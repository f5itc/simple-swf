/// <reference types="node" />
/// <reference types="chai" />
import { SWF } from 'aws-sdk';
export declare type SWFTask = SWF.DecisionTask | SWF.ActivityTask;
export interface CodedError extends Error {
    code?: string;
}
export interface WorkflowInfo {
    workflowId: string;
    runId: string;
}
export declare enum StopReasons {
    ProcessExit = 0,
    WorkflowCancel = 1,
    HeartbeatCancel = 2,
    UnknownResource = 3,
}
export interface TaskStatus {
    status: string;
    info?: any;
    progress?: number;
    env?: Object;
}
export interface TaskInput {
    env?: Object;
    originWorkflow: string;
    input: any;
}
export interface ActivityFailed {
    error: Error;
    details: TaskStatus;
}
export interface ActivityCanceled {
    reason: StopReasons;
    details: TaskStatus | null;
}
export declare type EntityTypes = 'workflow' | 'activity' | 'decision' | 'domain' | 'marker' | 'timer';
export declare const UnknownResourceFault: string;
export declare const TypeExistsFault: string;
export declare const DomainExistsFaults: string;
