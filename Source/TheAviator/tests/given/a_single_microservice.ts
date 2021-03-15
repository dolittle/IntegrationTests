// Copyright (c) Dolittle. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Guid } from '@dolittle/rudiments';
import { ScenarioEnvironmentDefinition, ScenarioContext, ScenarioEnvironment } from '../../gherkin';
import { Tenants } from '../shared/Tenants';
import { EventObject } from '../shared/EventObject';
import { EventLogRuleSetContainerBuilder, StreamsRuleSetContainerBuilder } from '../../rules/streams';
import { StreamProcessorRuleSetContainerBuilder } from '../../rules/streamProcessors';
import { MicroserviceInContext } from '../../gherkin/MicroserviceInContext';

export class a_single_microservice extends ScenarioContext {
    tenant = Tenants.tenant;

    async describe(environment: ScenarioEnvironmentDefinition) {
        environment.withMicroservice('main', [Guid.parse('f79fcfc9-c855-4910-b445-1f167e814bfd')]);
    }

    async establish(environment: ScenarioEnvironment) {
        await super.establish(environment);
        await this.microservice?.actions.head.startClient();
    }

    async cleanup(): Promise<void> {
        const restartPromises: Promise<void>[] = [];
        for (const microservice of Object.values(this.microservices!)) {
            restartPromises.push(microservice.head.restart());
        }
        await Promise.all(restartPromises);
    }

    get microservice(): MicroserviceInContext | undefined {
        return this.microservices.main;
    }

    async commitEvents(eventSource: Guid, ...events: EventObject[]) {
        await this.microservice?.actions.head.commitEvents(Tenants.tenant, eventSource, ...events);
    }

    async commitAggregateEvents(eventSource: Guid, version: number, ...events: EventObject[]) {
        await this.microservice?.actions.head.commitAggregateEvents(Tenants.tenant, eventSource, version, ...events);
    }

    get event_log(): EventLogRuleSetContainerBuilder | undefined {
        return this.microservice?.event_log;
    }

    get streams(): StreamsRuleSetContainerBuilder | undefined {
        return this.microservice?.streams;
    }

    get stream_processors(): StreamProcessorRuleSetContainerBuilder | undefined {
        return this.microservice?.stream_processors;
    }
}
