/// <reference types="chai" />
import { SWF } from 'aws-sdk';
import { Task } from './Task';
import { Workflow } from '../entities/Workflow';
import { ActivityType } from '../entities/ActivityType';
import { FieldSerializer } from '../util/FieldSerializer';
import { EntityTypes, TaskInput, TaskStatus } from '../interfaces';
import { Event, EventData, SelectedEvents } from './EventRollup';
import { ConfigOverride } from '../SWFConfig';
export interface Decision {
    entities: EntityTypes[];
    overrides: ConfigOverride;
    decision: SWF.Decision;
}
export interface DecisionRollup {
    [decisionType: string]: number;
}
export declare class DecisionTask extends Task<SWF.DecisionTask> {
    fieldSerializer: FieldSerializer;
    decisions: Decision[];
    private executionContext;
    private rollup;
    private workflowAttrs;
    id: string;
    constructor(workflow: Workflow, rawTask: SWF.DecisionTask);
    getWorkflowTaskInput(): TaskInput;
    getWorkflowInput(): any;
    setExecutionContext(context: any): void;
    private buildTaskInput(input, overrideEnv?, initialEnv?);
    private encodeExecutionContext(cb);
    private wrapDecisions(decisions, cb);
    sendDecisions(cb: any): void;
    getParentWorkflowInfo(): SWF.WorkflowExecution | null;
    isChildWorkflow(): boolean;
    rescheduleTimedOutEvents(): Event[];
    rescheduleFailedEvents(): Event[];
    private rescheduleOfType<T>(toReschedule, attrName, addFunc);
    rescheduleTask(taskAttrs: SWF.ScheduleActivityTaskDecisionAttributes): boolean;
    rescheduleChild(childAttrs: SWF.StartChildWorkflowExecutionDecisionAttributes): boolean;
    scheduleTask(activityId: string, input: any, activity: ActivityType, opts?: ConfigOverride, overrideEnv?: any, initialEnv?: any): void;
    startChildWorkflow(workflowId: string, input: any, opts?: ConfigOverride, overrideEnv?: any): void;
    failWorkflow(reason: string, details: string, opts?: ConfigOverride): void;
    completeWorkflow(result: TaskStatus, opts?: ConfigOverride, overrideEnv?: any): void;
    addMarker(markerName: string, details: any, opts?: ConfigOverride): void;
    cancelWorkflow(details: any, opts?: ConfigOverride): void;
    cancelActivity(activityId: string, opts?: ConfigOverride): void;
    startTimer(timerId: string, timerLength: number, control?: any): void;
    cancelTimer(timerId: string): void;
    continueAsNewWorkflow(overrideInput?: string | null, opts?: ConfigOverride, overrideEnv?: any): void;
    scheduleLambda(lambdaName: string, id: string, input: any, opts?: ConfigOverride, overrideEnv?: any): void;
    getDecisionInfo(): DecisionRollup;
    getGroupedEvents(): EventData;
    getRetryableFailedToScheduleEvents(): SelectedEvents | false;
    getEnv(): Object;
    getOriginWorkflow(): string;
    private buildInitialControlDoc(maxRetry?);
    private getControlDoc(existingControl);
    private extractWorkflowInput(rawEvents);
}
