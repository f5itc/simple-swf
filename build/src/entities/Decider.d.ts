/// <reference types="node" />
import { SWF } from 'aws-sdk';
import { SWFConfig, ConfigGroup } from '../SWFConfig';
import { Workflow } from './Workflow';
import { DecisionTask } from '../tasks/DecisionTask';
export declare abstract class Decider {
    workflow: Workflow;
    swfClient: SWF;
    config: SWFConfig;
    constructor(workflow: Workflow);
    abstract makeDecisions(task: DecisionTask, cb: {
        (err: Error, decision: DecisionTask);
    }): any;
    static getDefaultConfig(): ConfigGroup;
}
