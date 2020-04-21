// Copyright (c) Dolittle. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScenarioContext } from './ScenarioContext';
import { Scenario } from './Scenario';
import { Microservice } from 'Microservice';

/**
 * Defines a system for maintaining paths for a flight.
 */
export interface IFlightPaths {
    readonly base: string;
    readonly global: string;

    /**
     * Get Path for a {ScenarioContext}
     * @param {ScenarioContext} context ScenarioContext to get for.
     */
    forScenarioContext(context: ScenarioContext): string;

    /**
     * Get Path for a {Scenario}
     * @param {Scenario} scenario Scenario to get for.
     */
    forScenario(scenario: Scenario): string;

    /**
     * Get Path for a {Microservice} used in a {Scenario}
     * @param {Scenario} scenario Scenario to get for.
     * @param {Microservice} microservice Microservice to get for.
     */
    forMicroservice(scenario: Scenario, microservice: Microservice): string;

    /**
     * Get Path for a {Microservice} used in a {ScenarioContext}
     * @param {ScenarioContext} context ScenarioContext to get for.
     * @param {Microservice} microservice Microservice to get for.
     */
    forMicroserviceInContext(context: ScenarioContext, microservice: Microservice): string;
}
