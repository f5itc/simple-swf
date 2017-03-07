/// <reference types="node" />
import { EventEmitter } from 'events';
import { Request } from 'aws-sdk';
import { SWFTask, CodedError } from '../interfaces';
import { Task } from '../tasks/Task';
import { Workflow } from '../entities/Workflow';
export declare abstract class Worker<T extends SWFTask, W extends Task<SWFTask>> extends EventEmitter {
    identity: string;
    workflow: Workflow;
    private currentRequest;
    private pollingState;
    constructor(workflow: Workflow, identity: string);
    _start(): void;
    _stop(cb: any): any;
    loop(): void;
    sendRequest(req: Request<any, any>, cb: {
        (err?: CodedError, data?: T);
    }): void;
    abstract wrapTask(workflow: Workflow, data: T, cb: {
        (err: Error | null, task: W | null);
    }): any;
    abstract buildApiRequest(): Request<any, any>;
    abstract performTask(task: W): any;
    abstract handleError(err: Error): boolean;
}
