"use strict";
exports.DecisionTypeAttributeMap = {
    CompleteWorkflowExecution: 'completeWorkflowExecutionDecisionAttributes',
    FailWorkflowExecution: 'failWorkflowExecutionDecisionAttributes',
    ScheduleActivityTask: 'scheduleActivityTaskDecisionAttributes',
    RecordMarker: 'recordMarkerDecisionAttributes',
    StartChildWorkflowExecution: 'startChildWorkflowExecutionDecisionAttributes',
    RequestCancelActivityTask: 'requestCancelActivityTaskDecisionAttributes',
    CancelWorkflowExecution: 'cancelWorkflowExecutionDecisionAttributes',
    ContinueAsNewWorkflowExecution: 'continueAsNewWorkflowExecutionDecisionAttributes',
    StartTimer: 'startTimerDecisionAttributes',
    CancelTimer: 'cancelTimerDecisionAttributes',
    SignalExternalWorkflowExecution: 'signalExternalWorkflowExecutionDecisionAttributes',
    RequestCancelExternalWorkflowExecution: 'requestCancelExternalWorkflowExecutionDecisionAttributes',
    ScheduleLambdaFunction: 'scheduleLambdaFunctionDecisionAttributes'
};
exports.EventTypeAttributeMap = {
    WorkflowExecutionStarted: 'workflowExecutionStartedEventAttributes',
    WorkflowExecutionCancelRequested: 'workflowExecutionCancelRequestedEventAttributes',
    WorkflowExecutionCompleted: 'workflowExecutionCompletedEventAttributes',
    CompleteWorkflowExecutionFailed: 'completeWorkflowExecutionFailedEventAttributes',
    WorkflowExecutionFailed: 'workflowExecutionFailedEventAttributes',
    FailWorkflowExecutionFailed: 'failWorkflowExecutionFailedEventAttributes',
    WorkflowExecutionTimedOut: 'workflowExecutionTimedOutEventAttributes',
    WorkflowExecutionCanceled: 'workflowExecutionCanceledEventAttributes',
    CancelWorkflowExecutionFailed: 'cancelWorkflowExecutionFailedEventAttributes',
    WorkflowExecutionContinuedAsNew: 'workflowExecutionContinuedAsNewEventAttributes',
    ContinueAsNewWorkflowExecutionFailed: 'continueAsNewWorkflowExecutionFailedEventAttributes',
    WorkflowExecutionTerminated: 'workflowExecutionTerminatedEventAttributes',
    DecisionTaskScheduled: 'decisionTaskScheduledEventAttributes',
    DecisionTaskStarted: 'decisionTaskStartedEventAttributes',
    DecisionTaskCompleted: 'decisionTaskCompletedEventAttributes',
    DecisionTaskTimedOut: 'decisionTaskTimedOutEventAttributes',
    ActivityTaskScheduled: 'activityTaskScheduledEventAttributes',
    ScheduleActivityTaskFailed: 'scheduleActivityTaskFailedEventAttributes',
    ActivityTaskStarted: 'activityTaskStartedEventAttributes',
    ActivityTaskCompleted: 'activityTaskCompletedEventAttributes',
    ActivityTaskFailed: 'activityTaskFailedEventAttributes',
    ActivityTaskTimedOut: 'activityTaskTimedOutEventAttributes',
    ActivityTaskCanceled: 'activityTaskCanceledEventAttributes',
    ActivityTaskCancelRequested: 'activityTaskCancelRequestedEventAttributes',
    RequestCancelActivityTaskFailed: 'requestCancelActivityTaskFailedEventAttributes',
    WorkflowExecutionSignaled: 'workflowExecutionSignaledEventAttributes',
    MarkerRecorded: 'markerRecordedEventAttributes',
    RecordMarkerFailed: 'recordMarkerFailedEventAttributes',
    TimerStarted: 'timerStartedEventAttributes',
    StartTimerFailed: 'startTimerFailedEventAttributes',
    TimerFired: 'timerFiredEventAttributes',
    TimerCanceled: 'timerCanceledEventAttributes',
    CancelTimerFailed: 'cancelTimerFailedEventAttributes',
    StartChildWorkflowExecutionInitiated: 'startChildWorkflowExecutionInitiatedEventAttributes',
    StartChildWorkflowExecutionFailed: 'startChildWorkflowExecutionFailedEventAttributes',
    ChildWorkflowExecutionStarted: 'childWorkflowExecutionStartedEventAttributes',
    ChildWorkflowExecutionCompleted: 'childWorkflowExecutionCompletedEventAttributes',
    ChildWorkflowExecutionFailed: 'childWorkflowExecutionFailedEventAttributes',
    ChildWorkflowExecutionTimedOut: 'childWorkflowExecutionTimedOutEventAttributes',
    ChildWorkflowExecutionCanceled: 'childWorkflowExecutionCanceledEventAttributes',
    ChildWorkflowExecutionTerminated: 'childWorkflowExecutionTerminatedEventAttributes',
    SignalExternalWorkflowExecutionInitiated: 'signalExternalWorkflowExecutionInitiatedEventAttributes',
    SignalExternalWorkflowExecutionFailed: 'signalExternalWorkflowExecutionFailedEventAttributes',
    ExternalWorkflowExecutionSignaled: 'externalWorkflowExecutionSignaledEventAttributes',
    RequestCancelExternalWorkflowExecutionInitiated: 'requestCancelExternalWorkflowExecutionInitiatedEventAttributes',
    RequestCancelExternalWorkflowExecutionFailed: 'requestCancelExternalWorkflowExecutionFailedEventAttributes',
    ExternalWorkflowExecutionCancelRequested: 'externalWorkflowExecutionCancelRequestedEventAttributes',
    LambdaFunctionScheduled: 'lambdaFunctionScheduledEventAttributes',
    LambdaFunctionStarted: 'lambdaFunctionStartedEventAttributes',
    LambdaFunctionCompleted: 'lambdaFunctionCompletedEventAttributes',
    LambdaFunctionFailed: 'lambdaFunctionFailedEventAttributes',
    LambdaFunctionTimedOut: 'lambdaFunctionTimedOutEventAttributes',
    ScheduleLambdaFunctionFailed: 'scheduleLambdaFunctionFailedEventAttributes',
    StartLambdaFunctionFailed: 'startLambdaFunctionFailedEventAttributes',
};
//# sourceMappingURL=AttributeTypeMaps.js.map