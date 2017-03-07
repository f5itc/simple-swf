/// <reference types="chai" />
import { SWF } from 'aws-sdk';
export interface Event {
    id: string;
    current: string;
    scheduled?: any;
    failedToSchedule?: any;
    started?: any;
    failed?: any;
    completed?: any;
    timedOut?: any;
    terminate?: any;
    toCancel?: any;
    canceling?: any;
    canceled?: any;
    cancelFailed?: any;
    result?: any;
}
export interface EventsById {
    [id: string]: Event;
}
export interface EventData {
    activity?: EventsById;
    decision?: EventsById;
    workflow?: EventsById;
    marker?: EventsById;
    byEventId?: EventsById;
    completed?: Event[];
}
export interface SelectedEvents {
    activity: Event[];
    workflow: Event[];
}
export declare class EventRollup {
    data: EventData;
    env: Object;
    constructor(rawTask: SWF.DecisionTask, workflowEnv?: Object);
    getTimedOutEvents(): SelectedEvents;
    getFailedEvents(): SelectedEvents;
    getPendingEvents(): SelectedEvents;
    buildEnv(currentEnv: Object, completed?: any[]): Object;
}
