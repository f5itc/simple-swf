/// <reference types="node" />
/// <reference types="chai" />
import { SWF } from 'aws-sdk';
import { Workflow } from './Workflow';
import { WorkflowInfo } from '../interfaces';
import { ListFilter } from './Domain';
import { EventData } from '../tasks/EventRollup';
import { EventDeserializer } from '../util/EventDeserializer';
export interface ExecutionHistory {
    progress: EventData;
    wfInput: any;
}
export declare class WorkflowExecution {
    workflow: Workflow;
    runInfo: WorkflowInfo;
    startTimestamp?: Date;
    executionStatus?: SWF.ExecutionStatus;
    cancelRequested: boolean;
    deserializer: EventDeserializer;
    constructor(workflow: Workflow, runInfo: WorkflowInfo);
    describeWorkflowExecution(cb: {
        (err?: Error | null, data?: any);
    }): void;
    signalWorkflowExecution(signalName: string, input: any, cb: {
        (err?: Error | null);
    }): void;
    terminateWorkflowExecution(childPolicy: SWF.ChildPolicy, reason: string, details: string, cb: {
        (err?: Error | null);
    }): void;
    requestCancelWorkflowExecution(cb: {
        (err?: Error | null);
    }): void;
    getWorkflowExecutionHistory(opts: ListFilter, cb: {
        (err?: Error | null, data?: ExecutionHistory);
    }): void;
    toJSON(): Object;
}
