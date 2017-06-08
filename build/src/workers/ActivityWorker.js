"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var async = require("async");
var tasks_1 = require("../tasks");
var Worker_1 = require("./Worker");
var buildIdentity_1 = require("../util/buildIdentity");
var interfaces_1 = require("../interfaces");
var ActivityWorker = (function (_super) {
    __extends(ActivityWorker, _super);
    function ActivityWorker(workflow, opts) {
        if (opts === void 0) { opts = {}; }
        var _this = this;
        // ensure string from overrides as ConfigOverride allows numbers
        var identity = (opts['identity'] || buildIdentity_1.buildIdentity('activity')).toString();
        _this = _super.call(this, workflow, identity) || this;
        _this.config = workflow.config;
        _this.fieldSerializer = workflow.fieldSerializer;
        _this.opts = opts;
        _this.activityRegistry = {};
        _this.activeActivities = {};
        _this.swfClient = workflow.swfClient;
        return _this;
    }
    ActivityWorker.prototype.buildApiRequest = function () {
        var defaults = this.config.populateDefaults({ entities: ['activity'], api: 'pollForActivityTask' }, this.opts);
        var taskListKey = this.config.getMappingName('taskList', { entities: ['activity'], api: 'pollForActivityTask' });
        var taskList = defaults[taskListKey];
        var params = {
            domain: this.workflow.domain.name,
            taskList: taskList
        };
        return this.swfClient.pollForActivityTask(_.defaults(params, defaults));
    };
    ActivityWorker.prototype.handleError = function (err) {
        return false;
    };
    ActivityWorker.prototype.wrapTask = function (workflow, task, cb) {
        this.fieldSerializer.deserialize(task.input || null, function (err, input) {
            if (err)
                return cb(err, null);
            var sInput = input;
            var actTask = new tasks_1.ActivityTask(workflow, task, sInput);
            cb(null, actTask);
        });
    };
    ActivityWorker.prototype.performTask = function (task) {
        var _this = this;
        var activityType = this.getActivityType(task.activityName());
        var execution = activityType.createExecution(this.workflow, task);
        this.emit('startTask', task, execution);
        this.activeActivities[execution.id] = execution;
        execution.on('failedToStop', function (err) {
            _this.emit('error', err);
        });
        execution._start(function (err, status, details) {
            // this error should only indicate AWS errors, the actual result of the task
            // is handler by the activity
            if (err && err.code !== interfaces_1.UnknownResourceFault)
                _this.emit('error', err);
            if (err)
                _this.emit('warn', err);
            _this.emit('finished', task, execution, status, details);
            delete _this.activeActivities[execution.id];
        });
    };
    ActivityWorker.prototype.stop = function (cb) {
        var _this = this;
        async.forEachOf(this.activeActivities, function (execution, keyName, cb) {
            delete _this.activeActivities[keyName];
            execution._requestStop(interfaces_1.StopReasons.ProcessExit, false, cb);
        }, function (err) {
            // even if we have an error, we want still stop the polling
            _this._stop(function (stopError) {
                cb(err || stopError);
            });
        });
    };
    ActivityWorker.prototype.start = function (cb) {
        var _this = this;
        var activities = _.values(this.activityRegistry);
        async.map(activities, function (act, cb) { return act.ensureActivityType(_this.workflow.domain, cb); }, function (err, results) {
            if (err)
                return cb(err);
            var withCreated = activities.map(function (act, index) { return ({ activity: act, created: results[index] }); });
            _this._start();
            cb(null, withCreated);
        });
    };
    ActivityWorker.prototype.registerActivityType = function (activity) {
        this.activityRegistry[activity.name] = activity;
    };
    ActivityWorker.prototype.getActivityType = function (name) {
        return this.activityRegistry[name];
    };
    return ActivityWorker;
}(Worker_1.Worker));
exports.ActivityWorker = ActivityWorker;
//# sourceMappingURL=ActivityWorker.js.map