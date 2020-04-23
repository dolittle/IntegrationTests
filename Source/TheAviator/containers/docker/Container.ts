// Copyright (c) Dolittle. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { retry } from 'async';
const getPort = require('get-port');

import { PassThrough } from 'stream';
import * as Docker from 'dockerode';

import { ContainerOptions, IContainer, Mount, IWaitStrategy } from '../';

/**
 * Represents an implementation of {IContainer} for Docker.
 */
export class Container implements IContainer {
    readonly options: ContainerOptions;
    readonly outputStream: NodeJS.ReadWriteStream;
    readonly boundPorts: Map<number, number>;

    _container: Docker.Container | undefined;

    /**
     * Creates an instance of container.
     * @param options {ContainerOptions} The Container options.
     * @param _dockerClient {Docker} The Docker client object.
     */
    constructor(options: ContainerOptions, private _dockerClient: Docker) {
        this.options = options;
        this.outputStream = new PassThrough();
        this.boundPorts = new Map<number, number>();
    }

    /** @inheritdoc */
    async configure() {
        if (this.options.exposedPorts) {
            for (const port of this.options.exposedPorts) {
                this.boundPorts.set(port, await getPort());
            }
        }
    }

    /** @inheritdoc */
    async start(...waitStrategies: IWaitStrategy[]) {
        const createOptions = this.getCreateOptions();
        this._container = await this._dockerClient.createContainer(createOptions);

        await this._container.start();
        this._container.attach({ stream: true, stdout: true, stderr: true }, (err, stream) => {
            stream?.setEncoding('utf8');
            stream?.pipe(this.outputStream);
        });

        await this.waitForStrategies(waitStrategies);
    }

    /** @inheritdoc */
    async stop(...waitStrategies: IWaitStrategy[]) {
        if (!this._container) {
            return;
        }
        const state = await this._container.inspect();
        if (state.State.Running) {
            await this._container.stop();
            await this.waitForStrategies(waitStrategies);
        }
    }

    /** @inheritdoc */
    async pause(...waitStrategies: IWaitStrategy[]) {
        if (!this._container) {
            return;
        }
        const state = await this._container.inspect();
        if (state.State.Running) {
            await this._container.pause();
            await this.waitForStrategies(waitStrategies);
        }
    }

    /** @inheritdoc */
    async resume(...waitStrategies: IWaitStrategy[]) {
        if (!this._container) {
            return;
        }
        const state = await this._container.inspect();
        if (state.State.Running) {
            await this._container.unpause();
            await this.waitForStrategies(waitStrategies);
        }
    }


    /** @inheritdoc */
    async kill(...waitStrategies: IWaitStrategy[]) {
        if (!this._container) {
            return;
        }
        try {
            const state = await this._container.inspect();
            try {
                await this._container.kill();
                await this.waitForStrategies(waitStrategies);
            } catch (kex) {
            }

            for (const mount of state.Mounts) {
                if (mount.Name) {
                    const volume = this._dockerClient.getVolume(mount.Name);
                    if (volume) {
                        await volume.remove();
                    }
                }
            }

            await this._container.remove();
        } catch (ex) {
        }
    }

    /** @inheritdoc */
    async restart(...waitStrategies: IWaitStrategy[]) {
        if (!this._container) {
            return;
        }
        await this._container.restart();
        await this.waitForStrategies(waitStrategies);
    }

    /** @inheritdoc */
    async exec(command: string[], options?: any, ...waitStrategies: IWaitStrategy[]): Promise<void> {
        if (!this._container) {
            return;
        }

        options = options || {};
        options.AttachStdout = true;
        options.AttachStderr = true;
        options.Tty = false;
        options.Cmd = command;

        const exec = await this._container.exec(options);
        const result = await exec.start({ 'Detach': false, 'Tty': false, stream: true, stdout: true, stderr: true });
        result.output.setEncoding('utf8');
        result.output.pipe(this.outputStream);

        try {
            await retry({ times: 10, interval: 200 }, async (callback, results) => {
                const info = await exec.inspect();
                if (info.Running) {
                    callback(new Error('Running'));
                } else {
                    callback(null);
                }
            });
        } catch (ex) {}

        await this.waitForStrategies(waitStrategies);
    }

    private async waitForStrategies(waitStrategies: IWaitStrategy[]) {
        for (const strategy of waitStrategies) {
            try {
                await strategy.wait(this);
            }
            catch (ex) { }
        }
    }


    private getCreateOptions(): Docker.ContainerCreateOptions {
        return {
            name: this.options.name,
            Image: this.getImageName(),
            AttachStdout: true,
            AttachStderr: true,
            AttachStdin: false,
            ExposedPorts: this.getExposedPorts(),
            HostConfig: {
                PortBindings: this.getPortBindings(),
                Binds: this.getBinds(),
                RestartPolicy: {
                    Name: 'always'
                },
                NetworkMode: this.options.networkName ?? 'bridge'
            }
        };
    }

    private getBinds() {
        return this.options.mounts?.map((mount: Mount) => {
            return `${mount.host}:${mount.container}:rw`;
        }) ?? [];
    }

    private getExposedPorts() {
        const exposedPorts: any = {};
        this.options.exposedPorts?.forEach(port => {
            exposedPorts[`${port}/tcp`] = {};
        });

        return exposedPorts;
    }

    private getPortBindings() {
        const boundPorts: any = {};
        this.boundPorts.forEach((hostPort, port) => {
            boundPorts[`${port}/tcp`] = [
                {
                    HostPort: `${hostPort}`
                }];
        });
        return boundPorts;
    }

    private getImageName() {
        if (this.options.tag) {
            return `${this.options.image}:${this.options.tag}`;
        }
        return this.options.image;
    }
}
