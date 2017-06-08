import { SWF, Request } from 'aws-sdk';
import { DecisionTask } from '../tasks';
import { Decider, Workflow } from '../entities';
import { Worker } from './Worker';
import { SWFConfig, ConfigOverride } from '../SWFConfig';
import { CodedError } from '../interfaces';
import { EventDeserializer } from '../util/EventDeserializer';
export declare class DeciderWorker extends Worker<SWF.DecisionTask, DecisionTask> {
    swfClient: SWF;
    config: SWFConfig;
    opts: ConfigOverride;
    decider: Decider;
    deserializer: EventDeserializer;
    constructor(decider: Decider, opts?: ConfigOverride);
    buildApiRequest(): Request<any, any>;
    sendRequest(req: Request<any, any>, cb: {
        (err?: CodedError, d?: SWF.DecisionTask);
    }): void;
    handleError(err: Error): boolean;
    wrapTask(workflow: Workflow, task: SWF.DecisionTask, cb: {
        (err: Error | null, task: DecisionTask | null);
    }): void;
    performTask(task: DecisionTask): void;
    stop(cb: {
        (Error?);
    }): void;
    start(cb: {
        (Error?);
    }): void;
}
