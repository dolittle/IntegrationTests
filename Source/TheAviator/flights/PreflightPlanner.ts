// Copyright (c) Dolittle. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Constructor } from '../Constructor';

import { IGiven } from '../gherkin';

import { IMicroserviceFactory } from '../microservices';

import { Scenario, ScenarioEnvironmentDefinition } from '../gherkin';

import { IPreflightPlanner } from './IPreflightPlanner';
import { PreflightChecklist } from './PreflightChecklist';
import { IFlightPaths } from './IFlightPaths';

const zeroPad = (num: number, places: number) => String(num).padStart(places, '0');

export class PreflightPlanner implements IPreflightPlanner {

    constructor(private _flightPaths: IFlightPaths, private _microserviceFactory: IMicroserviceFactory) {
    }

    createChecklistFor(platform: string, ...givenStatements: Constructor<any>[]): PreflightChecklist {
        const scenariosByGiven: Map<Constructor<IGiven>, Scenario[]> = new Map();
        const scenarioContexts: Map<Constructor<IGiven>, ScenarioEnvironmentDefinition> = new Map();
        const scenariosByContexts: Map<ScenarioEnvironmentDefinition, Scenario[]> = new Map();

        for (const givenConstructor of givenStatements) {
            const scenario = new givenConstructor();
            let i = 0;
            i++;
        }

        /*
        scenario.prepare();

        let givenConstructor = scenario.given;
        if (!givenConstructor) {
            givenConstructor = NoContext;
        }

        let scenarioContext: ScenarioContextDefinition;
        if (!scenariosByGiven.has(givenConstructor)) {
            const given = new givenConstructor();
            scenariosByGiven.set(givenConstructor, []);
            scenarioContext = new ScenarioContextDefinition(givenConstructor.name);
            given.describe(scenarioContext);
            scenarioContexts.set(givenConstructor, scenarioContext);
        } else {
            scenarioContext = scenarioContexts.get(givenConstructor) ?? new ScenarioContextDefinition(givenConstructor.name);
        }

        scenariosByGiven.get(givenConstructor)?.push(scenario);
        if (!scenariosByContexts.has(scenarioContext)) {
            scenariosByContexts.set(scenarioContext, []);
        }

        scenariosByContexts.get(scenarioContext)?.push(scenario);
        */

        return new PreflightChecklist(this._flightPaths, scenariosByContexts);
    }
}
