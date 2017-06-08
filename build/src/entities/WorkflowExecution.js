"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var async = require("async");
var processEvents_1 = require("../tasks/processEvents");
var EventDeserializer_1 = require("../util/EventDeserializer");
var objectAssign = require('object-assign');
var WorkflowExecution = (function () {
    function WorkflowExecution(workflow, runInfo) {
        this.workflow = workflow;
        this.runInfo = runInfo;
        this.deserializer = new EventDeserializer_1.EventDeserializer(true, this.workflow.fieldSerializer);
    }
    WorkflowExecution.prototype.describeWorkflowExecution = function (cb) {
        this.workflow.swfClient.describeWorkflowExecution({ domain: this.workflow.domain.name, execution: this.runInfo }, cb);
    };
    WorkflowExecution.prototype.signalWorkflowExecution = function (signalName, input, cb) {
        var _this = this;
        this.workflow.fieldSerializer.serialize(input, function (err, serialized) {
            if (err)
                return cb;
            _this.workflow.swfClient.signalWorkflowExecution({
                signalName: signalName,
                domain: _this.workflow.domain.name,
                workflowId: _this.runInfo.workflowId,
                runId: _this.runInfo.runId,
                input: serialized,
            }, cb);
        });
    };
    WorkflowExecution.prototype.terminateWorkflowExecution = function (childPolicy, reason, details, cb) {
        this.workflow.swfClient.terminateWorkflowExecution({
            domain: this.workflow.domain.name,
            workflowId: this.runInfo.workflowId,
            runId: this.runInfo.runId,
            reason: reason,
            childPolicy: childPolicy,
            details: details
        });
    };
    WorkflowExecution.prototype.requestCancelWorkflowExecution = function (cb) {
        this.workflow.swfClient.requestCancelWorkflowExecution({
            domain: this.workflow.domain.name,
            workflowId: this.runInfo.workflowId,
            runId: this.runInfo.runId
        }, cb);
    };
    WorkflowExecution.prototype.getWorkflowExecutionHistory = function (opts, cb) {
        var _this = this;
        var withExecutionInfo = objectAssign(opts, {
            domain: this.workflow.domain.name,
            execution: this.runInfo
        });
        var events = [];
        this.workflow.swfClient.getWorkflowExecutionHistory(withExecutionInfo).eachPage(function (err, data, done) {
            if (err)
                return cb(err);
            if (!data) {
                if (events[0].eventType !== 'WorkflowExecutionStarted')
                    return cb(new Error('unexpected workflow state'));
                // this is slightly hacky, when we cann deserializeEvent it changes this from strings
                // to hydrated objects
                var input = events[0].workflowExecutionStartedEventAttributes.input;
                return cb(null, {
                    progress: processEvents_1.processEvents(events),
                    wfInput: input
                });
            }
            async.map(data.events, _this.deserializer.deserializeEvent.bind(_this.deserializer), function (err, newEvents) {
                if (err)
                    return cb(err);
                events = events.concat(newEvents);
                if (!done)
                    return cb(new Error('unexpected, should have had done callback'));
                done();
            });
        });
    };
    WorkflowExecution.prototype.toJSON = function () {
        return {
            execution: this.runInfo,
            status: this.executionStatus,
            startTimestamp: this.startTimestamp,
            cancelRequested: this.cancelRequested,
            domain: this.workflow.domain.name,
            workflowType: {
                name: this.workflow.name,
                version: this.workflow.version
            }
        };
    };
    return WorkflowExecution;
}());
exports.WorkflowExecution = WorkflowExecution;
//# sourceMappingURL=WorkflowExecution.js.map