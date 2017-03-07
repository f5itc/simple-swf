"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var _ = require('lodash');
var async = require('async');
var tasks_1 = require('../tasks');
var Worker_1 = require('./Worker');
var buildIdentity_1 = require('../util/buildIdentity');
var EventDeserializer_1 = require('../util/EventDeserializer');
// only try to deserialize these events types, since we really only
// care about the 'result' field to build the env
var EventsToDeserialize = {
    WorkflowExecutionStarted: true,
    WorkflowExecutionCompleted: true,
    ActivityTaskCompleted: true,
    ChildWorkflowExecutionCompleted: true,
    LambdaFunctionCompleted: true,
    WorkflowExecutionSignaled: true
};
var DeciderWorker = (function (_super) {
    __extends(DeciderWorker, _super);
    function DeciderWorker(decider, opts) {
        if (opts === void 0) { opts = {}; }
        // ensure string from overrides as ConfigOverride allows numbers
        var identity = (opts['identity'] || buildIdentity_1.buildIdentity('activity')).toString();
        _super.call(this, decider.workflow, identity);
        this.decider = decider;
        this.config = this.workflow.config;
        this.swfClient = this.workflow.swfClient;
        this.opts = opts;
        this.deserializer = new EventDeserializer_1.EventDeserializer(EventsToDeserialize, this.workflow.fieldSerializer);
    }
    DeciderWorker.prototype.buildApiRequest = function () {
        var defaults = this.config.populateDefaults({ entities: ['decision'], api: 'pollForDecisionTask' }, this.opts);
        var taskListKey = this.config.getMappingName('taskList', { entities: ['decision'], api: 'pollForDecisionTask' });
        var taskList = defaults[taskListKey];
        var params = {
            domain: this.workflow.domain.name,
            taskList: taskList,
            identity: this.identity
        };
        return this.swfClient.pollForDecisionTask(_.defaults(params, defaults));
    };
    // DecisionTaks have pagination, override this to paginate
    DeciderWorker.prototype.sendRequest = function (req, cb) {
        var _this = this;
        var events = [];
        var decisionTask = null;
        var cbCalled = false;
        req.eachPage(function (err, data, done) {
            if (err)
                return cb(err);
            if (cbCalled)
                return false;
            // this happens when we abort requests, seems like a small aws-sdk bug when I would expect an error
            if (!data && !decisionTask)
                return cb();
            if (!data) {
                decisionTask.events = events;
                return cb(null, decisionTask);
            }
            if (!decisionTask)
                decisionTask = data;
            async.map(data.events, _this.deserializer.deserializeEvent.bind(_this.deserializer), function (err, desEvents) {
                if (err) {
                    cb(err);
                    cbCalled = true;
                    // return false to stop pagination
                    return false;
                }
                events.push.apply(events, desEvents);
                done();
            });
        });
    };
    DeciderWorker.prototype.handleError = function (err) {
        return false;
    };
    DeciderWorker.prototype.wrapTask = function (workflow, task, cb) {
        cb(null, new tasks_1.DecisionTask(workflow, task));
    };
    DeciderWorker.prototype.performTask = function (task) {
        var _this = this;
        this.emit('decision', task);
        this.decider.makeDecisions(task, function (err) {
            if (err)
                return _this.emit('error', err);
            task.sendDecisions(function (err) {
                if (err)
                    return _this.emit('error', err);
                _this.emit('madeDecision', task);
            });
        });
    };
    DeciderWorker.prototype.stop = function (cb) {
        this._stop(cb);
    };
    DeciderWorker.prototype.start = function (cb) {
        this._start();
        cb();
    };
    return DeciderWorker;
}(Worker_1.Worker));
exports.DeciderWorker = DeciderWorker;
//# sourceMappingURL=DeciderWorker.js.map