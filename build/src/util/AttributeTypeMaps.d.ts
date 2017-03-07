export declare type DecisionType = 'ScheduleActivityTask' | 'RequestCancelActivityTask' | 'CompleteWorkflowExecution' | 'FailWorkflowExecution' | 'CancelWorkflowExecution' | 'ContinueAsNewWorkflowExecution' | 'RecordMarker' | 'StartTimer' | 'CancelTimer' | 'SignalExternalWorkflowExecution' | 'RequestCancelExternalWorkflowExecution' | 'StartChildWorkflowExecution' | 'ScheduleLambdaFunction';
export declare type EventType = 'WorkflowExecutionStarted' | 'WorkflowExecutionCancelRequested' | 'WorkflowExecutionCompleted' | 'CompleteWorkflowExecutionFailed' | 'WorkflowExecutionFailed' | 'FailWorkflowExecutionFailed' | 'WorkflowExecutionTimedOut' | 'WorkflowExecutionCanceled' | 'CancelWorkflowExecutionFailed' | 'WorkflowExecutionContinuedAsNew' | 'ContinueAsNewWorkflowExecutionFailed' | 'WorkflowExecutionTerminated' | 'DecisionTaskScheduled' | 'DecisionTaskStarted' | 'DecisionTaskCompleted' | 'DecisionTaskTimedOut' | 'ActivityTaskScheduled' | 'ScheduleActivityTaskFailed' | 'ActivityTaskStarted' | 'ActivityTaskCompleted' | 'ActivityTaskFailed' | 'ActivityTaskTimedOut' | 'ActivityTaskCanceled' | 'ActivityTaskCancelRequested' | 'RequestCancelActivityTaskFailed' | 'WorkflowExecutionSignaled' | 'MarkerRecorded' | 'RecordMarkerFailed' | 'TimerStarted' | 'StartTimerFailed' | 'TimerFired' | 'TimerCanceled' | 'CancelTimerFailed' | 'StartChildWorkflowExecutionInitiated' | 'StartChildWorkflowExecutionFailed' | 'ChildWorkflowExecutionStarted' | 'ChildWorkflowExecutionCompleted' | 'ChildWorkflowExecutionFailed' | 'ChildWorkflowExecutionTimedOut' | 'ChildWorkflowExecutionCanceled' | 'ChildWorkflowExecutionTerminated' | 'SignalExternalWorkflowExecutionInitiated' | 'SignalExternalWorkflowExecutionFailed' | 'ExternalWorkflowExecutionSignaled' | 'RequestCancelExternalWorkflowExecutionInitiated' | 'RequestCancelExternalWorkflowExecutionFailed' | 'ExternalWorkflowExecutionCancelRequested' | 'LambdaFunctionScheduled' | 'LambdaFunctionStarted' | 'LambdaFunctionCompleted' | 'LambdaFunctionFailed' | 'LambdaFunctionTimedOut' | 'ScheduleLambdaFunctionFailed' | 'StartLambdaFunctionFailed';
export declare const DecisionTypeAttributeMap: {
    CompleteWorkflowExecution: string;
    FailWorkflowExecution: string;
    ScheduleActivityTask: string;
    RecordMarker: string;
    StartChildWorkflowExecution: string;
    RequestCancelActivityTask: string;
    CancelWorkflowExecution: string;
    ContinueAsNewWorkflowExecution: string;
    StartTimer: string;
    CancelTimer: string;
    SignalExternalWorkflowExecution: string;
    RequestCancelExternalWorkflowExecution: string;
    ScheduleLambdaFunction: string;
};
export declare const EventTypeAttributeMap: {
    WorkflowExecutionStarted: string;
    WorkflowExecutionCancelRequested: string;
    WorkflowExecutionCompleted: string;
    CompleteWorkflowExecutionFailed: string;
    WorkflowExecutionFailed: string;
    FailWorkflowExecutionFailed: string;
    WorkflowExecutionTimedOut: string;
    WorkflowExecutionCanceled: string;
    CancelWorkflowExecutionFailed: string;
    WorkflowExecutionContinuedAsNew: string;
    ContinueAsNewWorkflowExecutionFailed: string;
    WorkflowExecutionTerminated: string;
    DecisionTaskScheduled: string;
    DecisionTaskStarted: string;
    DecisionTaskCompleted: string;
    DecisionTaskTimedOut: string;
    ActivityTaskScheduled: string;
    ScheduleActivityTaskFailed: string;
    ActivityTaskStarted: string;
    ActivityTaskCompleted: string;
    ActivityTaskFailed: string;
    ActivityTaskTimedOut: string;
    ActivityTaskCanceled: string;
    ActivityTaskCancelRequested: string;
    RequestCancelActivityTaskFailed: string;
    WorkflowExecutionSignaled: string;
    MarkerRecorded: string;
    RecordMarkerFailed: string;
    TimerStarted: string;
    StartTimerFailed: string;
    TimerFired: string;
    TimerCanceled: string;
    CancelTimerFailed: string;
    StartChildWorkflowExecutionInitiated: string;
    StartChildWorkflowExecutionFailed: string;
    ChildWorkflowExecutionStarted: string;
    ChildWorkflowExecutionCompleted: string;
    ChildWorkflowExecutionFailed: string;
    ChildWorkflowExecutionTimedOut: string;
    ChildWorkflowExecutionCanceled: string;
    ChildWorkflowExecutionTerminated: string;
    SignalExternalWorkflowExecutionInitiated: string;
    SignalExternalWorkflowExecutionFailed: string;
    ExternalWorkflowExecutionSignaled: string;
    RequestCancelExternalWorkflowExecutionInitiated: string;
    RequestCancelExternalWorkflowExecutionFailed: string;
    ExternalWorkflowExecutionCancelRequested: string;
    LambdaFunctionScheduled: string;
    LambdaFunctionStarted: string;
    LambdaFunctionCompleted: string;
    LambdaFunctionFailed: string;
    LambdaFunctionTimedOut: string;
    ScheduleLambdaFunctionFailed: string;
    StartLambdaFunctionFailed: string;
};