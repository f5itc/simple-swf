"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var events_1 = require('events');
var interfaces_1 = require('../interfaces');
(function (TaskState) {
    TaskState[TaskState["Started"] = 0] = "Started";
    TaskState[TaskState["Stopped"] = 1] = "Stopped";
    TaskState[TaskState["ShouldStop"] = 2] = "ShouldStop";
    TaskState[TaskState["Finished"] = 3] = "Finished";
    TaskState[TaskState["Canceled"] = 4] = "Canceled";
    TaskState[TaskState["Failed"] = 5] = "Failed";
})(exports.TaskState || (exports.TaskState = {}));
var TaskState = exports.TaskState;
// this is really an abstract class, but there isn't
// of expressing abstract static methods or passing a generic type
// make up for this by throwing errors (which is better for non-ts code anyways)
var Activity = (function (_super) {
    __extends(Activity, _super);
    // this constructor is not to be called by the user, it gets created
    // when an activity of this type exists
    function Activity(workflow, activityType, task) {
        _super.call(this);
        this.task = task;
        this.workflow = workflow;
        // heartbeatTimout is in seconds, convert to milliseconds
        this.heartbeatInterval = activityType.heartbeatTimeout(workflow.config) * 1000;
        this.activityType = activityType;
        this.taskStatus = TaskState.Stopped;
        this.id = task.rawTask.activityId;
    }
    Activity.prototype.status = function () {
        return { status: 'UNKNOWN' };
    };
    Activity.prototype.stop = function (reason, cb) {
        throw new Error('this method must be overriden!');
    };
    Activity.prototype.run = function (input, env, initialEnv, cb) {
        throw new Error('this method must be overriden!');
    };
    Activity.prototype._start = function (cb) {
        var _this = this;
        this.startHeartbeat();
        this.taskStatus = TaskState.Started;
        this.run(this.task.getInput(), this.task.getEnv(), this.task.getInitialEnv(), function (err, details) {
            _this.stopHeartbeat();
            // if a task is canceled before we call to respond, don't respond
            if (_this.taskStatus === TaskState.Canceled)
                return;
            if (err) {
                _this.taskStatus = TaskState.Failed;
                _this.emit('failed', err, details);
                return _this.task.respondFailed({ error: err, details: details }, function (err) { return cb(err, false, details); });
            }
            _this.taskStatus = TaskState.Finished;
            _this.emit('completed', details);
            _this.task.respondSuccess(details, function (err) { return cb(err, true, details); });
        });
    };
    Activity.prototype._requestStop = function (reason, doNotRespond, cb) {
        var _this = this;
        this.taskStatus = TaskState.ShouldStop;
        this.stopHeartbeat();
        this.stop(reason, function (err, details) {
            if (err)
                return cb(err);
            if (doNotRespond) {
                _this.taskStatus = TaskState.Canceled;
                _this.emit('canceled', reason);
                return cb();
            }
            // if we finished, don't try and cancel, probably have outstanding completion
            if (_this.taskStatus === TaskState.Finished)
                return;
            _this.task.respondCanceled({ reason: reason, details: details }, function (err) {
                if (err)
                    return cb(err);
                _this.taskStatus = TaskState.Canceled;
                _this.emit('canceled', reason);
                cb();
            });
        });
    };
    Activity.prototype.startHeartbeat = function () {
        var _this = this;
        this.timer = setInterval(function () {
            // if we happened to finished, just bail out
            if (_this.taskStatus === TaskState.Finished)
                return;
            var status = _this.status();
            _this.emit('heartbeat', status);
            _this.task.sendHeartbeat(status, function (err, shouldCancel) {
                if (err && err.code === interfaces_1.UnknownResourceFault) {
                    // could finish the task but have sent off the heartbeat, so check here
                    if (_this.taskStatus === TaskState.Finished)
                        return;
                    return _this._requestStop(interfaces_1.StopReasons.UnknownResource, true, function (err) {
                        if (err)
                            return _this.emit('failedToStop', err);
                    });
                }
                if (err)
                    return _this.emit('error', err);
                if (shouldCancel) {
                    _this._requestStop(interfaces_1.StopReasons.HeartbeatCancel, false, function (err) {
                        if (err)
                            return _this.emit('failedToStop', err);
                    });
                }
                _this.emit('heartbeatComplete');
            });
            // use half the interval to ensure we do it in time!
        }, (this.heartbeatInterval * 0.5));
    };
    Activity.prototype.stopHeartbeat = function () {
        clearInterval(this.timer);
    };
    Activity.getActivityType = function () {
        throw new Error('this method must be overriden!');
    };
    return Activity;
}(events_1.EventEmitter));
exports.Activity = Activity;
//# sourceMappingURL=Activity.js.map