/// <reference types="node" />
import { SWF } from 'aws-sdk';
import { FieldSerializer } from './FieldSerializer';
export declare class EventDeserializer {
    eventsToDeserialize: {
        [eventType: string]: boolean;
    };
    deserializeAll: boolean;
    fieldSerializer: FieldSerializer;
    constructor(eventsToDeserialize: {
        [eventType: string]: boolean;
    } | boolean, fieldSerializer: FieldSerializer);
    deserializeEvent(event: SWF.HistoryEvent, cb: {
        (err: Error | null, e: SWF.HistoryEvent | null);
    }): any;
}
