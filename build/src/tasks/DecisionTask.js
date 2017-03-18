"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var _ = require('lodash');
var async = require('async');
var Task_1 = require('./Task');
var EventRollup_1 = require('./EventRollup');
var util_1 = require('../util');
var SWF_MAX_RETRY = 5;
var DecisionTask = (function (_super) {
    __extends(DecisionTask, _super);
    function DecisionTask(workflow, rawTask) {
        _super.call(this, workflow, rawTask);
        this.fieldSerializer = workflow.fieldSerializer;
        this.decisions = [];
        this.workflowAttrs = this.extractWorkflowInput(rawTask.events);
        this.rollup = new EventRollup_1.EventRollup(rawTask, this.getWorkflowTaskInput().env);
        this.id = rawTask.startedEventId.toString();
    }
    DecisionTask.prototype.getWorkflowTaskInput = function () {
        // this is hacky and ugly, but we already have deserialized stuff
        // so we force input to be our TaskInput
        var input = this.workflowAttrs.input;
        return input;
    };
    DecisionTask.prototype.getWorkflowInput = function () {
        return this.getWorkflowTaskInput().input;
    };
    DecisionTask.prototype.setExecutionContext = function (context) {
        this.executionContext = context;
    };
    DecisionTask.prototype.buildTaskInput = function (input, overrideEnv, initialEnv) {
        return JSON.stringify({
            input: input,
            env: overrideEnv || this.getEnv(),
            initialEnv: initialEnv || null,
            originWorkflow: this.getOriginWorkflow()
        });
    };
    DecisionTask.prototype.encodeExecutionContext = function (cb) {
        if (!this.executionContext)
            return cb(null, '');
        this.fieldSerializer.serialize(this.executionContext, cb);
    };
    DecisionTask.prototype.wrapDecisions = function (decisions, cb) {
        var _this = this;
        async.map(decisions, function (decision, cb) {
            var swfDec = decision.decision;
            var attrName = util_1.DecisionTypeAttributeMap[swfDec.decisionType];
            var swfAttrs = swfDec[attrName];
            var apiUse = { entities: decision.entities, api: 'respondDecisionTaskCompleted', attribute: attrName };
            var defaults = _this.config.populateDefaults(apiUse, decision.overrides);
            var merged = _.defaults(swfAttrs, defaults);
            _this.fieldSerializer.serializeAll(merged, function (err, serialized) {
                if (err)
                    return cb(err);
                swfDec[attrName] = serialized;
                cb(null, swfDec);
            });
        }, cb);
    };
    DecisionTask.prototype.sendDecisions = function (cb) {
        var _this = this;
        this.encodeExecutionContext(function (err, context) {
            if (err)
                return cb(err);
            _this.wrapDecisions(_this.decisions, function (err, decisions) {
                if (err)
                    return cb(err);
                var params = {
                    taskToken: _this.rawTask.taskToken,
                    decisions: decisions,
                    executionContext: context
                };
                _this.swfClient.respondDecisionTaskCompleted(params, cb);
            });
        });
    };
    DecisionTask.prototype.getParentWorkflowInfo = function () {
        return this.rawTask.events[0].workflowExecutionStartedEventAttributes.parentWorkflowExecution || null;
    };
    DecisionTask.prototype.isChildWorkflow = function () {
        return this.getParentWorkflowInfo() !== null;
    };
    DecisionTask.prototype.rescheduleTimedOutEvents = function () {
        var timedOut = this.rollup.getTimedOutEvents();
        var actFailRe = this.rescheduleOfType(timedOut.activity, 'activityTaskScheduledEventAttributes', this.rescheduleTask.bind(this));
        var workFailRe = this.rescheduleOfType(timedOut.workflow, 'startChildWorkflowExecutionInitiatedEventAttributes', this.rescheduleChild.bind(this));
        return actFailRe.concat(workFailRe);
    };
    DecisionTask.prototype.rescheduleFailedEvents = function () {
        var failed = this.rollup.getFailedEvents();
        var actFailRe = this.rescheduleOfType(failed.activity, 'activityTaskScheduledEventAttributes', this.rescheduleTask.bind(this));
        var workFailRe = this.rescheduleOfType(failed.workflow, 'startChildWorkflowExecutionInitiatedEventAttributes', this.rescheduleChild.bind(this));
        return actFailRe.concat(workFailRe);
    };
    DecisionTask.prototype.rescheduleOfType = function (toReschedule, attrName, addFunc) {
        var failedReschedule = [];
        for (var _i = 0, toReschedule_1 = toReschedule; _i < toReschedule_1.length; _i++) {
            var task = toReschedule_1[_i];
            var startAttrs = _.clone(task.scheduled[attrName]);
            // this is an invalid option when scheduling activites and child workflows
            // otherwise, the attributes from the scheduled event are the same as the attributes to schedule a new event
            delete startAttrs.decisionTaskCompletedEventId;
            if (!addFunc(startAttrs))
                failedReschedule.push(task);
        }
        return failedReschedule;
    };
    DecisionTask.prototype.rescheduleTask = function (taskAttrs) {
        // we don't want to rebuild the manifest, so don't put it in the normal place
        var control = this.getControlDoc(taskAttrs.control);
        if (control.executionCount > control.maxRetry)
            return false;
        taskAttrs.control = JSON.stringify(control);
        this.decisions.push({
            entities: ['activity'],
            overrides: {},
            decision: {
                decisionType: 'ScheduleActivityTask',
                scheduleActivityTaskDecisionAttributes: taskAttrs
            }
        });
        return true;
    };
    DecisionTask.prototype.rescheduleChild = function (childAttrs) {
        // we don't want to rebuild the manifest, so don't put it in the normal place
        var control = this.getControlDoc(childAttrs.control);
        if (control.executionCount > control.maxRetry)
            return false;
        childAttrs.control = JSON.stringify(control);
        this.decisions.push({
            entities: ['workflow'],
            overrides: {},
            decision: {
                decisionType: 'StartChildWorkflowExecution',
                startChildWorkflowExecutionDecisionAttributes: childAttrs
            }
        });
        return true;
    };
    DecisionTask.prototype.scheduleTask = function (activityId, input, activity, opts, overrideEnv, initialEnv) {
        if (opts === void 0) { opts = {}; }
        var maxRetry = opts['maxRetry'] || activity.maxRetry;
        var taskInput = this.buildTaskInput(input, overrideEnv, initialEnv);
        this.decisions.push({
            entities: ['activity'],
            overrides: opts,
            decision: {
                decisionType: 'ScheduleActivityTask',
                scheduleActivityTaskDecisionAttributes: {
                    input: taskInput,
                    activityId: activityId,
                    activityType: {
                        name: activity.name,
                        version: activity.version
                    },
                    control: JSON.stringify(this.buildInitialControlDoc(maxRetry))
                }
            }
        });
    };
    DecisionTask.prototype.startChildWorkflow = function (workflowId, input, opts, overrideEnv, initialEnv) {
        if (opts === void 0) { opts = {}; }
        var maxRetry = opts['maxRetry'];
        this.decisions.push({
            entities: ['workflow', 'decision'],
            overrides: opts,
            decision: {
                decisionType: 'StartChildWorkflowExecution',
                startChildWorkflowExecutionDecisionAttributes: {
                    workflowId: workflowId,
                    workflowType: {
                        name: this.workflow.name,
                        version: this.workflow.version
                    },
                    input: this.buildTaskInput(input, overrideEnv, initialEnv),
                    control: JSON.stringify(this.buildInitialControlDoc(maxRetry))
                }
            }
        });
    };
    DecisionTask.prototype.failWorkflow = function (reason, details, opts) {
        if (opts === void 0) { opts = {}; }
        // when you fail workflow, the only thing that should be in it is the fail decision, any other
        // decisions can cause an error! so zero them out
        this.decisions = [];
        this.decisions.push({
            entities: ['workflow'],
            overrides: opts,
            decision: {
                decisionType: 'FailWorkflowExecution',
                failWorkflowExecutionDecisionAttributes: { reason: reason, details: details }
            }
        });
    };
    DecisionTask.prototype.completeWorkflow = function (result, opts, overrideEnv) {
        if (opts === void 0) { opts = {}; }
        result.env = overrideEnv || this.getEnv();
        this.decisions.push({
            entities: ['workflow'],
            overrides: opts,
            decision: {
                decisionType: 'CompleteWorkflowExecution',
                completeWorkflowExecutionDecisionAttributes: {
                    result: JSON.stringify(result)
                }
            }
        });
    };
    DecisionTask.prototype.addMarker = function (markerName, details, opts) {
        if (opts === void 0) { opts = {}; }
        this.decisions.push({
            entities: ['activity'],
            overrides: opts,
            decision: {
                decisionType: 'RecordMarker',
                recordMarkerDecisionAttributes: { markerName: markerName, details: details }
            }
        });
    };
    DecisionTask.prototype.cancelWorkflow = function (details, opts) {
        if (opts === void 0) { opts = {}; }
        this.decisions.push({
            entities: ['workflow'],
            overrides: opts,
            decision: {
                decisionType: 'CancelWorkflowExecution',
                cancelWorkflowExecutionDecisionAttributes: { details: details }
            }
        });
    };
    DecisionTask.prototype.cancelActivity = function (activityId, opts) {
        if (opts === void 0) { opts = {}; }
        this.decisions.push({
            entities: ['activity'],
            overrides: opts,
            decision: {
                decisionType: 'RequestCancelActivityTask',
                requestCancelActivityTaskDecisionAttributes: { activityId: activityId }
            }
        });
    };
    DecisionTask.prototype.startTimer = function (timerId, timerLength, control) {
        this.decisions.push({
            entities: ['timer'],
            overrides: {},
            decision: {
                decisionType: 'StartTimer',
                startTimerDecisionAttributes: {
                    timerId: timerId,
                    startToFireTimeout: timerLength.toString(),
                    control: control
                }
            }
        });
    };
    DecisionTask.prototype.cancelTimer = function (timerId) {
        this.decisions.push({
            entities: ['timer'],
            overrides: {},
            decision: {
                decisionType: 'CancelTimer',
                cancelTimerDecisionAttributes: { timerId: timerId }
            }
        });
    };
    DecisionTask.prototype.continueAsNewWorkflow = function (overrideInput, opts, overrideEnv) {
        if (overrideInput === void 0) { overrideInput = null; }
        if (opts === void 0) { opts = {}; }
        var params = {
            input: this.buildTaskInput(overrideInput || this.workflowAttrs.input, overrideEnv),
            childPolicy: this.workflowAttrs.childPolicy,
            executionStartToCloseTimeout: this.workflowAttrs.executionStartToCloseTimeout,
            lambdaRole: this.workflowAttrs.lambdaRole,
            tagList: this.workflowAttrs.tagList,
            taskList: this.workflowAttrs.taskList,
            taskPriority: this.workflowAttrs.taskPriority,
            taskStartToCloseTimeout: this.workflowAttrs.taskStartToCloseTimeout,
            workflowTypeVersion: this.workflow.version
        };
        this.decisions.push({
            entities: ['workflow'],
            overrides: opts,
            decision: {
                decisionType: 'ContinueAsNewWorkflowExecution',
                continueAsNewWorkflowExecutionDecisionAttributes: params
            }
        });
    };
    DecisionTask.prototype.scheduleLambda = function (lambdaName, id, input, opts, overrideEnv) {
        if (opts === void 0) { opts = {}; }
        this.decisions.push({
            entities: ['activity'],
            overrides: opts,
            decision: {
                decisionType: 'ScheduleLambdaFunction',
                scheduleLambdaFunctionDecisionAttributes: {
                    id: id,
                    name: lambdaName,
                    input: this.buildTaskInput(input, overrideEnv),
                }
            }
        });
    };
    // responds with the info made in this decision
    DecisionTask.prototype.getDecisionInfo = function () {
        return this.decisions.reduce(function (rollup, decision) {
            if (rollup[decision.decision.decisionType]) {
                rollup[decision.decision.decisionType] += 1;
            }
            else {
                rollup[decision.decision.decisionType] = 1;
            }
            return rollup;
        }, {});
    };
    DecisionTask.prototype.getGroupedEvents = function () {
        return this.rollup.data;
    };
    DecisionTask.prototype.getRetryableFailedToScheduleEvents = function () {
        return this.rollup.getRetryableFailedToScheduleEvents();
    };
    DecisionTask.prototype.getEnv = function () {
        return this.rollup.env || {};
    };
    DecisionTask.prototype.getOriginWorkflow = function () {
        return this.getWorkflowTaskInput().originWorkflow;
    };
    // TODO: implement these
    // SignalExternalWorkflowExecution: 'signalExternalWorkflowExecutionDecisionAttributes',
    // RequestCancelExternalWorkflowExecution: 'requestCancelExternalWorkflowExecutionDecisionAttributes',
    DecisionTask.prototype.buildInitialControlDoc = function (maxRetry) {
        if (maxRetry === void 0) { maxRetry = SWF_MAX_RETRY; }
        return { executionCount: 1, maxRetry: maxRetry };
    };
    DecisionTask.prototype.getControlDoc = function (existingControl) {
        if (typeof existingControl === 'string') {
            existingControl = JSON.parse(existingControl);
        }
        return {
            executionCount: (existingControl.executionCount + 1 || 1),
            maxRetry: (existingControl.maxRetry || SWF_MAX_RETRY)
        };
    };
    DecisionTask.prototype.extractWorkflowInput = function (rawEvents) {
        if (rawEvents[0].eventType !== 'WorkflowExecutionStarted') {
            throw new Error('WorkflowExecutionStarted was not first event');
        }
        return rawEvents[0].workflowExecutionStartedEventAttributes;
    };
    return DecisionTask;
}(Task_1.Task));
exports.DecisionTask = DecisionTask;
//# sourceMappingURL=DecisionTask.js.map