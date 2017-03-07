/// <reference types="chai" />
import { SWF } from 'aws-sdk';
import { Task } from './Task';
import { Workflow } from '../entities/Workflow';
import { FieldSerializer } from '../util/FieldSerializer';
import { TaskStatus, CodedError, ActivityFailed, ActivityCanceled, TaskInput } from '../interfaces';
export declare class ActivityTask extends Task<SWF.ActivityTask> {
    fieldSerializer: FieldSerializer;
    id: string;
    taskInput: TaskInput;
    constructor(workflow: Workflow, rawTask: SWF.ActivityTask, taskInput: TaskInput);
    respondSuccess(result: TaskStatus, cb: any): void;
    respondFailed(result: ActivityFailed, cb: any): void;
    respondCanceled(result: ActivityCanceled, cb: any): void;
    activityName(): string;
    sendHeartbeat(status: TaskStatus, cb: {
        (err: CodedError, success: boolean);
    }): void;
    getInput(): any;
    getEnv(): Object;
    getOriginWorkflow(): string;
}
