export declare const states: {
    SCH: string;
    FAS: string;
    ST: string;
    FA: string;
    CO: string;
    TO: string;
    TE: string;
    TC: string;
    CAL: string;
    CAD: string;
    CF: string;
};
export declare function processEvents(events: any): {
    activity: {
        [id: string]: any;
    };
    workflow: {
        [id: string]: any;
    };
    decision: {
        [id: string]: any;
    };
    marker: {
        [id: string]: any;
    };
    byEventId: {
        [id: string]: any;
    };
    signals: {
        [id: string]: any;
    };
    completed: any[];
};
