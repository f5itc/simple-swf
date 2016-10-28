import { SWF } from 'aws-sdk';
import { Workflow } from '../entities/Workflow';
import { SWFTask } from '../interfaces';
import { SWFConfig } from '../SWFConfig';
export declare abstract class Task<T extends SWFTask> {
    workflow: Workflow;
    rawTask: T;
    swfClient: SWF;
    config: SWFConfig;
    constructor(workflow: Workflow, rawTask: T);
    getEventId(): number;
    getWorkflowInfo(): SWF.WorkflowExecution;
    getWorkflowId(): string;
}
