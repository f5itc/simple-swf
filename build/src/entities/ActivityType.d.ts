import { SWFConfig, ConfigGroup, ConfigOverride } from '../SWFConfig';
import { Domain } from './Domain';
import { Workflow } from './Workflow';
import { ActivityTask } from '../tasks/ActivityTask';
import { Activity } from './Activity';
import { ActivityTypeInfo } from './ActivityTypeInfo';
export declare class ActivityType extends ActivityTypeInfo {
    HandlerClass: {
        new (...args: any[]): Activity;
    };
    opts: ConfigOverride;
    maxRetry: number;
    constructor(name: string, version: string, HandlerClass: {
        new (...args: any[]): Activity;
    }, opts?: ConfigOverride);
    ensureActivityType(domain: Domain, cb: {
        (err: Error | null, success: boolean);
    }): void;
    createExecution(workflow: Workflow, task: ActivityTask): Activity;
    heartbeatTimeout(config: SWFConfig): number;
    static getDefaultConfig(): ConfigGroup;
}
