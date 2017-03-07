/// <reference types="node" />
/// <reference types="chai" />
import { SWF } from 'aws-sdk';
import { Domain } from './Domain';
import { SWFConfig, ConfigGroup, ConfigOverride } from '../SWFConfig';
import { WorkflowInfo } from '../interfaces';
import { FieldSerializer } from '../util/FieldSerializer';
import { WorkflowExecution } from './WorkflowExecution';
export declare class Workflow {
    name: string;
    version: string;
    domain: Domain;
    swfClient: SWF;
    config: SWFConfig;
    fieldSerializer: FieldSerializer;
    constructor(domain: Domain, name: string, version: string, fieldSerializer: FieldSerializer);
    ensureWorkflow(opts: ConfigOverride, cb: {
        (err: Error | null, success: boolean);
    }): void;
    startWorkflow(id: string, input: any, env: Object | null, opts: ConfigOverride, cb: {
        (err?: Error | null, wfInfo?: WorkflowInfo | null, exectution?: WorkflowExecution | null);
    }): void;
    buildExecution(workflowId: any, runId: any): WorkflowExecution;
    deprecateWorkflowType(cb: {
        (err?: Error);
    }): void;
    describeWorkflowType(cb: {
        (err?: Error | null, data?: any);
    }): void;
    toJSON(): Object;
    static getDefaultConfig(): ConfigGroup;
}
