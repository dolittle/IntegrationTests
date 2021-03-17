// Copyright (c) Dolittle. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Guid } from '@dolittle/rudiments';
import { EventHandlers } from '../shared/EventHandlers';
import { EventObject } from '../shared/EventObject';
import { Feature, ScenarioFor } from '../../gherkin';
import { a_single_microservice } from '../given/a_single_microservice';
import asyncTimeout from '../../asyncTimeout';

@Feature('Private events')
export class twenty_events_committed extends ScenarioFor<a_single_microservice> {
    readonly event_source = Guid.parse('acb6be0d-d035-43d9-b5c2-452fa2afa84b');
    readonly _events: EventObject[] = [];

    constructor() {
        super();
        for (let i = 0; i < 20; i += 1) {
            this._events.push({
                uniqueIdentifier: Guid.create().toString()
            });
        }
    }

    for = a_single_microservice;

    async when_all_events_are_committed() {
        await this.context?.commitEvents(this.event_source, ...this._events);
    }

    and = () => [
        this.waiting_for_two_seconds,
    ];

    waiting_for_two_seconds = async () => await asyncTimeout(2000);

    then_all_events_should_be_in_event_log = () => this.context?.event_log?.should_contain(this.context?.tenant, ...this._events);
    then_all_events_should_be_in_the_event_handler_stream = () => this.context?.streams?.should_contain(this.context?.tenant, EventHandlers.eventHandlerId, Guid.empty, ...this._events);
    then_all_events_should_be_in_the_unpartitioned_event_handler_stream = () => this.context?.streams?.should_contain(this.context?.tenant, EventHandlers.unpartitionedEventHandlerId, Guid.empty, ...this._events);
    then_event_handler_should_have_handled_the_events = () => this.context?.stream_processors?.should_have_event_handler_at_position(this.context?.tenant, EventHandlers.eventHandlerId, 20);
    then_unpartitioned_event_handler_should_have_handled_the_events = () => this.context?.stream_processors?.should_have_event_handler_at_position(this.context?.tenant, EventHandlers.unpartitionedEventHandlerId, 20);
}
