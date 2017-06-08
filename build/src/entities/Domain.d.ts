import { SWF } from 'aws-sdk';
import { ConfigGroup, SWFConfig, ConfigOverride } from '../SWFConfig';
import { WorkflowExecution } from './WorkflowExecution';
import { FieldSerializer } from '../util/FieldSerializer';
import { ActivityTypeInfo } from './ActivityTypeInfo';
export interface SWFFilterBase {
    domain?: string;
    executionFilter?: SWF.WorkflowExecutionFilter;
    startTimeFilter: SWF.ExecutionTimeFilter;
    typeFilter?: SWF.WorkflowTypeFilter;
    tagFilter?: SWF.TagFilter;
}
export interface ListFilter {
    maximumPageSize?: number;
    nextPageToken?: string;
    reverseOrder?: boolean;
}
export interface ClosedFilter {
    closeStatusFilter?: SWF.CloseStatusFilter;
    closeTimeFilter?: SWF.ExecutionTimeFilter;
}
export interface ClosedCountInput extends SWFFilterBase, ClosedFilter {
}
export interface ClosedListFilter extends ListFilter, ClosedFilter {
}
export interface ListActivityType extends ListFilter {
    registrationStatus: SWF.RegistrationStatus;
    name?: string;
}
export declare type countCallback = {
    (err?: Error | null, count?: number | null, truncated?: boolean | null);
};
export declare class Domain {
    name: string;
    swfClient: SWF;
    config: SWFConfig;
    status?: SWF.RegistrationStatus;
    description?: string;
    constructor(name: string, config: SWFConfig, swfClient?: SWF);
    ensureDomain(opts: ConfigOverride, cb: {
        (err?: Error, success?: boolean);
    }): void;
    countClosedWorkflowExecutions(input: ClosedCountInput, cb: countCallback): void;
    countOpenWorkflowExecutions(input: SWFFilterBase, cb: countCallback): void;
    private buildWfExection(serializer, info);
    listOpenWorkflowExecutions(serializer: FieldSerializer, input: ListFilter, cb: {
        (err?: Error, workflows?: WorkflowExecution[]);
    }): void;
    listClosedWorkflowExecutions(serializer: FieldSerializer, input: ClosedListFilter, cb: {
        (err?: Error, workflows?: WorkflowExecution[]);
    }): void;
    listActivityTypes(input: ListActivityType, cb: {
        (err?: Error | null, actTypes?: ActivityTypeInfo[] | null);
    }): void;
    countPendingActivityTasks(name: string, cb: countCallback): void;
    countPendingDecisionTasks(name: string, cb: countCallback): void;
    deprecateDomain(cb: {
        (err?: Error);
    }): void;
    describeDomain(cb: {
        (err?: Error, data?: any);
    }): void;
    toJSON(): Object;
    static loadDomain(config: SWFConfig, swfClient: SWF, name: string): Domain;
    static listDomains(config: SWFConfig, swfClient: SWF, regStatus: SWF.RegistrationStatus, cb: {
        (err?: Error, domains?: Domain[]);
    }): void;
    static getDefaultConfig(): ConfigGroup;
}
