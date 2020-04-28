// Copyright (c) Dolittle. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Constructor } from '../Constructor';
import { Scenario } from '../gherkin';
import { PreflightChecklist } from './PreflightChecklist';

export interface IFlightPlanner {
    planFor(target: string, ...scenarios: Constructor<Scenario>[]): PreflightChecklist
}
