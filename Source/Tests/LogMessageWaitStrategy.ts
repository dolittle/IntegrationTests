// Copyright (c) Dolittle. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { IWaitStrategy } from './IWaitStrategy';
import { IContainer } from './IContainer';
const byline =  require('byline');

export class LogMessageWaitStrategy implements IWaitStrategy {
    constructor(private _message: string) {
    }

    wait(container: IContainer): Promise<void> {
        let done = false;
        return new Promise((resolve, reject) => {
            const stream = byline(container.outputStream);
            stream.on('data', (line: string) => {
                if (line.toString().includes(this._message)) {
                    if (done) {
                        return;
                    }
                    resolve();
                    done = true;
                }
            });
            stream.on('err', (line: string) => {
                if (line.toString().includes(this._message)) {
                    if (done) {
                        return;
                    }
                    resolve();
                    done = true;
                }
            });
            stream.on('end', (line: string) => {
                if (done) {
                    return;
                }
                resolve();
                done = true;
            });
        });
    }
}
