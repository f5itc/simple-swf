// TODO: port this code! it is fairly well tested
// in etl_engine, but too much work to port now...
/*
 * translates the list of events grouped by state and encapsulating id (such as activity of workflow id)
 * first group by type
 *  {
 *    'activity': ...
 *    'workflow': ...
 *    'decider': ...
 *    'markers': ...
 *    'signal':...
 *    'byEventId': {
 *      'event1': //rawEvent
 *      ...
 *    }
 *  }
 *  then state:
 *  {
 *    'activity' : {
 *      'completed': {
 *        taska: {
 *          // raw event
 *        }
 *      },
 *      scheduled: {
 *        taskb: {
 *          //raw event
 *        }
 *      }
 *    }
 *  }
 *  All meta data in the chain of events is merged, so if you are in completed state, it will be the scheduled, started, and completed events all merged
 *  The group that an event is found is the current state of that event
 *
 *  the two exceptions are the 'signals' and 'markers' groups as they only have a single state of events, as well as the byEventId which is just a cache for looking up events that refer to other events
 *
 *  We build up this state somewhat like a state machine, which each event transitioning a task to a new state. This is rebuilt on every decision task (but could be memoized) to allow for statelessness
 *
 * }
*/
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
// short hand name for states
exports.states = {
    SCH: 'scheduled',
    FAS: 'failedToSchedule',
    ST: 'started',
    FA: 'failed',
    CO: 'completed',
    TO: 'timedOut',
    TE: 'terminate',
    TC: 'toCancel',
    CAL: 'canceling',
    CAD: 'canceled',
    CF: 'cancelFailed'
};
// mock logger
var log = {
    error: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
    }
};
// handlers for each event type that are 'manual', pretty much they either don't act on the state machine or are more complex than the events below
var transitions = {
    WorkflowExecutionStarted: function (state, event) {
        return { state: state };
    },
    WorkflowExecutionCancelRequested: function (state, event) {
        // move scheduled and running to cancel
        var types = ['activity', 'workflow'];
        for (var _i = 0, types_1 = types; _i < types_1.length; _i++) {
            var type = types_1[_i];
            var forType = state[type];
            for (var id in forType) {
                var group = forType[id];
                if (group.current === exports.states.ST || group.current === exports.states.SCH) {
                    group.toCancel = _.merge(group[exports.states.ST], group[exports.states.SCH]);
                    group.current = 'toCancel';
                }
            }
        }
        return { state: state };
    },
    WorkflowExecutionCompleted: function (state, event) {
        return { state: state, wait: true, notify: true };
    },
    CompleteWorkflowExecutionFailed: function (state, event) {
        return { state: state, error: 'completing the workflow failed', notify: true };
    },
    WorkflowExecutionFailed: function (state, event) {
        return { state: state, error: 'workflow execution failed', notify: true };
    },
    FailWorkflowExecutionFailed: function (state, event) {
        return { state: state, error: 'failed to fail execution', notify: true };
    },
    WorkflowExecutionTimedOut: function (state, event) {
        return { state: state, error: 'workflow timed out', notify: true };
    },
    WorkflowExecutionCanceled: function (state, event) {
        return { state: state, wait: true };
    },
    CancelWorkflowExecutionFailed: function (state, event) {
        return { state: state, error: 'failed to cancel workflow', notify: true };
    },
    WorkflowExecutionTerminated: function (state, event) {
        return { state: state, wait: true };
    },
    WorkflowExecutionSignaled: function (state, event) {
        state.signals[event.workflowExecutionSignaledEventAttributes.signalName] = event;
        return { state: state };
    }
};
// describes the transitions from one state space to another
var describeTransition = {
    DecisionTaskScheduled: function (state, event) {
        return { type: 'decision', id: event.eventId, to: exports.states.SCH };
    },
    DecisionTaskStarted: function (state, event) {
        var eventId = event.decisionTaskStartedEventAttributes.scheduledEventId;
        return { type: 'decision', id: eventId, to: exports.states.ST, from: exports.states.SCH };
    },
    DecisionTaskCompleted: function (state, event) {
        var eventId = event.decisionTaskCompletedEventAttributes.scheduledEventId;
        return { type: 'decision', id: eventId, to: exports.states.CO, from: exports.states.ST };
    },
    DecisionTaskTimedOut: function (state, event) {
        var eventId = event.decisionTaskTimedOutEventAttributes.scheduledEventId;
        return { type: 'decision', id: eventId, to: exports.states.TO, from: [exports.states.SCH, exports.states.ST] };
    },
    ActivityTaskScheduled: function (state, event) {
        var activityId = event.activityTaskScheduledEventAttributes.activityId;
        return { type: 'activity', id: activityId, to: exports.states.SCH, from: [exports.states.FA, exports.states.TO] };
    },
    ScheduleActivityTaskFailed: function (state, event) {
        var activityId = event.scheduleActivityTaskFailedEventAttributes.activityId;
        return { type: 'activity', id: activityId, to: exports.states.FAS, error: 'failed to schedule activity ' + activityId, notify: true };
    },
    ActivityTaskStarted: function (state, event) {
        var eventId = event.activityTaskStartedEventAttributes.scheduledEventId;
        var activityId = state.byEventId[eventId].activityTaskScheduledEventAttributes.activityId;
        return { type: 'activity', id: activityId, to: exports.states.ST, from: exports.states.SCH };
    },
    ActivityTaskCompleted: function (state, event) {
        var eventId = event.activityTaskCompletedEventAttributes.scheduledEventId;
        var activityId = state.byEventId[eventId].activityTaskScheduledEventAttributes.activityId;
        function addResult(group, e) {
            var res = e.activityTaskCompletedEventAttributes.result;
            try {
                res = JSON.parse(res);
            }
            catch (e) {
            }
            group.result = res;
        }
        return { type: 'activity', id: activityId, to: exports.states.CO, from: exports.states.ST, transform: addResult };
    },
    ActivityTaskFailed: function (state, event) {
        var eventId = event.activityTaskFailedEventAttributes.scheduledEventId;
        var activityId = state.byEventId[eventId].activityTaskScheduledEventAttributes.activityId;
        return { type: 'activity', id: activityId, to: exports.states.FA, from: exports.states.ST };
    },
    ActivityTaskTimedOut: function (state, event) {
        var eventId = event.activityTaskTimedOutEventAttributes.scheduledEventId;
        var activityId = state.byEventId[eventId].activityTaskScheduledEventAttributes.activityId;
        return { type: 'activity', id: activityId, to: exports.states.TO, from: [exports.states.ST, exports.states.SCH] };
    },
    ActivityTaskCanceled: function (state, event) {
        var eventId = event.activityTaskCanceledEventAttributes.scheduledEventId;
        var activityId = state.byEventId[eventId].activityTaskScheduledEventAttributes.activityId;
        return { type: 'activity', id: activityId, to: exports.states.CAD, from: exports.states.CAL };
    },
    ActivityTaskCancelRequested: function (state, event) {
        var activityId = event.activityTaskCancelRequestedEventAttributes.activityId;
        return { type: 'activity', id: activityId, to: exports.states.CAL, from: [exports.states.TC, exports.states.SCH, exports.states.ST] };
    },
    RequestCancelActivityTaskFailed: function (state, event) {
        var activityId = event.requestCancelActivityTaskFailedEventAttributes.activityId;
        return { type: 'activity', id: activityId, to: exports.states.CF, from: exports.states.CAL, error: 'failed to cancel request', notify: true };
    },
    LambdaFunctionScheduled: function (state, event) {
        var activityId = event.lambdaFunctionScheduledEventAttributes.id;
        return { type: 'activity', id: activityId, to: exports.states.SCH, from: [exports.states.FA, exports.states.TO] };
    },
    ScheduleLambdaFunctionFailed: function (state, event) {
        var activityId = event.scheduleLambdaFunctionFailedEventAttributes.id;
        return { type: 'activity', id: activityId, to: exports.states.FAS, error: 'failed to schedule lambda ' + activityId, notify: true };
    },
    LambdaFunctionStarted: function (state, event) {
        var eventId = event.lambdaFunctionStartedEventAttributes.scheduledEventId;
        var activityId = state.byEventId[eventId].lambdaFunctionScheduledEventAttributes.activityId;
        return { type: 'activity', id: activityId, to: exports.states.ST, from: exports.states.SCH };
    },
    LambdaFunctionCompleted: function (state, event) {
        var eventId = event.lambdaFunctionCompletedEventAttributes.scheduledEventId;
        var activityId = state.byEventId[eventId].scheduleLambdaFunctionFailedEventAttributes.activityId;
        function addResult(group, e) {
            var res = e.lambdaFunctionCompletedEventAttributes.result;
            try {
                res = JSON.parse(res);
            }
            catch (e) {
            }
            group.result = res;
        }
        return { type: 'activity', id: activityId, to: exports.states.CO, from: exports.states.ST, transform: addResult };
    },
    LambdaFunctionFailed: function (state, event) {
        var eventId = event.lambdaFunctionFailedEventAttributes.scheduledEventId;
        var activityId = state.byEventId[eventId].activityTaskScheduledEventAttributes.activityId;
        return { type: 'activity', id: activityId, to: exports.states.FA, from: exports.states.ST };
    },
    LambdaFunctionTimedOut: function (state, event) {
        var eventId = event.activityTaskTimedOutEventAttributes.scheduledEventId;
        var activityId = state.byEventId[eventId].activityTaskScheduledEventAttributes.activityId;
        return { type: 'activity', id: activityId, to: exports.states.TO, from: [exports.states.ST, exports.states.SCH] };
    },
    StartLambdaFunctionFailed: function (state, event) {
        var eventId = event.activityTaskCanceledEventAttributes.scheduledEventId;
        var activityId = state.byEventId[eventId].activityTaskScheduledEventAttributes.activityId;
        return { type: 'activity', id: activityId, to: exports.states.FAS, from: exports.states.ST };
    },
    StartChildWorkflowExecutionInitiated: function (state, event) {
        var workflowId = event.startChildWorkflowExecutionInitiatedEventAttributes.workflowId;
        return { type: 'workflow', id: workflowId, to: exports.states.SCH };
    },
    StartChildWorkflowExecutionFailed: function (state, event) {
        var workflowId = event.startChildWorkflowExecutionFailedEventAttributes.workflowId;
        return { type: 'workflow', id: workflowId, to: exports.states.FAS, from: exports.states.SCH, error: 'failed to start child workflow', notify: true };
    },
    ChildWorkflowExecutionStarted: function (state, event) {
        var workflowId = event.childWorkflowExecutionStartedEventAttributes.workflowExecution.workflowId;
        return { type: 'workflow', id: workflowId, to: exports.states.ST, from: exports.states.SCH, states: [exports.states.FA, exports.states.TO] };
    },
    ChildWorkflowExecutionCompleted: function (state, event) {
        var workflowId = event.childWorkflowExecutionCompletedEventAttributes.workflowExecution.workflowId;
        function addResult(group, e) {
            var res = e.childWorkflowExecutionCompletedEventAttributes.result;
            try {
                res = JSON.parse(res);
            }
            catch (e) {
            }
            group.result = res;
        }
        return { type: 'workflow', id: workflowId, to: exports.states.CO, from: exports.states.ST, transform: addResult };
    },
    ChildWorkflowExecutionFailed: function (state, event) {
        var workflowId = event.childWorkflowExecutionFailedEventAttributes.workflowExecution.workflowId;
        return { type: 'workflow', id: workflowId, to: exports.states.FA, from: exports.states.ST };
    },
    ChildWorkflowExecutionTimedOut: function (state, event) {
        var workflowId = event.childWorkflowExecutionTimedOutEventAttributes.workflowExecution.workflowId;
        return { type: 'workflow', id: workflowId, to: exports.states.TO, from: [exports.states.SCH, exports.states.ST] };
    },
    ChildWorkflowExecutionCanceled: function (state, event) {
        var workflowId = event.childWorkflowExecutionCanceledEventAttributes.workflowExecution.workflowId;
        return { type: 'workflow', id: workflowId, to: exports.states.CAD, from: [exports.states.SCH, exports.states.ST] };
    },
    ChildWorkflowExecutionTerminated: function (state, event) {
        var workflowId = event.childWorkflowExecutionTerminatedEventAttributes.workflowExecution.workflowId;
        return { type: 'workflow', id: workflowId, to: exports.states.TE, from: [exports.states.SCH, exports.states.ST] };
    },
    MarkerRecorded: function (state, event) {
        var markerName = event.markerRecordedEventAttributes.markerName;
        return { type: 'marker', id: markerName, to: exports.states.CO };
    },
    RecordMarkerFailed: function (state, event) {
        var markerName = event.recordMarkerFailedEventAttributes.markerName;
        return { type: 'marker', id: markerName, to: exports.states.FAS, error: 'failed to create marker', notify: true };
    }
};
function processEvents(events) {
    var state = {
        activity: {},
        workflow: {},
        decision: {},
        marker: {},
        byEventId: {},
        signals: {},
        completed: []
    };
    events.forEach(function (event) {
        state.byEventId[event.eventId] = event;
        if (describeTransition[event.eventType]) {
            var transition = describeTransition[event.eventType](state, event);
            if (transition.error && transition.notify) {
                log.error(transition.error);
            }
            if (!transition.type || !transition.id || !transition.to) {
                log.error('invalid transition given', transition);
                throw new Error('invalid transition');
            }
            var typeState = state[transition.type] || {};
            var grouped = typeState[transition.id] || {};
            grouped.current = transition.to;
            var oldEvent = null;
            if (Array.isArray(transition.from)) {
                for (var _i = 0, _a = transition.from; _i < _a.length; _i++) {
                    var from = _a[_i];
                    if (grouped[from]) {
                        oldEvent = grouped[from];
                        break;
                    }
                    oldEvent = {};
                }
            }
            else {
                oldEvent = grouped[transition.from] || {};
            }
            grouped[transition.to] = _.merge(oldEvent, event);
            // allow the transitions to transform the state to add other properties we may want
            if (transition.transform) {
                transition.transform(grouped, event);
            }
            if (transition.to === exports.states.CO) {
                state.completed.push({ type: transition.type, id: transition.id, state: grouped });
            }
            typeState[transition.id] = grouped;
            state[transition.type] = typeState;
        }
        else if (transitions[event.eventType]) {
            var transition = transitions[event.eventType](state, event);
            if (transition.error && transition.notify) {
                log.error(transition.error);
            }
            state = transition.state;
        }
        else {
            log.error('unsupported transition');
        }
    });
    return state;
}
exports.processEvents = processEvents;
//# sourceMappingURL=processEvents.js.map