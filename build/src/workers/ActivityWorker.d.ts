/// <reference types="node" />
import { SWF, Request } from 'aws-sdk';
import { Activity, ActivityType, Workflow } from '../entities';
import { ActivityTask } from '../tasks';
import { FieldSerializer } from '../util';
import { Worker } from './Worker';
import { SWFConfig, ConfigOverride } from '../SWFConfig';
export interface ActivityTypeCreated {
    activity: ActivityType;
    created: boolean;
}
export declare class ActivityWorker extends Worker<SWF.ActivityTask, ActivityTask> {
    swfClient: SWF;
    config: SWFConfig;
    opts: ConfigOverride;
    activityRegistry: {
        [name: string]: ActivityType;
    };
    activeActivities: {
        [activeId: string]: Activity;
    };
    fieldSerializer: FieldSerializer;
    constructor(workflow: Workflow, opts?: ConfigOverride);
    buildApiRequest(): Request<any, any>;
    handleError(err: Error): boolean;
    wrapTask(workflow: Workflow, task: SWF.ActivityTask, cb: {
        (err: Error | null, task: ActivityTask | null);
    }): void;
    performTask(task: ActivityTask): void;
    stop(cb: {
        (err?: Error);
    }): void;
    start(cb: {
        (Error?, res?: ActivityTypeCreated[]);
    }): void;
    registerActivityType(activity: ActivityType): void;
    getActivityType(name: string): ActivityType;
}
