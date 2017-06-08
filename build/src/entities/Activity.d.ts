/// <reference types="node" />
import { EventEmitter } from 'events';
import { ActivityType } from './ActivityType';
import { Workflow } from './Workflow';
import { ActivityTask } from '../tasks/ActivityTask';
import { StopReasons, TaskStatus, CodedError } from '../interfaces';
export declare enum TaskState {
    Started = 0,
    Stopped = 1,
    ShouldStop = 2,
    Finished = 3,
    Canceled = 4,
    Failed = 5,
}
export declare class Activity extends EventEmitter {
    task: ActivityTask;
    workflow: Workflow;
    taskStatus: TaskState;
    id: string;
    activityType: ActivityType;
    workflowId: string;
    heartbeatInterval: number;
    private timer;
    constructor(workflow: Workflow, activityType: ActivityType, task: ActivityTask);
    status(): TaskStatus;
    stop(reason: StopReasons | null, cb: {
        (err: CodedError, details: TaskStatus | null);
    }): void;
    run(input: any, env: Object | null, initialEnv: Object | null, cb: {
        (err: CodedError, details: TaskStatus);
    }): void;
    _start(cb: {
        (err: CodedError, success: boolean, details?: TaskStatus);
    }): void;
    _requestStop(reason: StopReasons, doNotRespond: boolean, cb: {
        (err?: CodedError);
    }): void;
    protected startHeartbeat(): void;
    protected stopHeartbeat(): void;
    static getActivityType(): ActivityType;
}
