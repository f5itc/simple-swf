"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Task_1 = require('./Task');
var ActivityTask = (function (_super) {
    __extends(ActivityTask, _super);
    function ActivityTask(workflow, rawTask, taskInput) {
        _super.call(this, workflow, rawTask);
        this.fieldSerializer = workflow.fieldSerializer;
        this.id = rawTask.activityId;
        this.taskInput = taskInput;
    }
    ActivityTask.prototype.respondSuccess = function (result, cb) {
        var _this = this;
        this.fieldSerializer.serialize(result, function (err, encoded) {
            if (err)
                return cb(err);
            var params = {
                taskToken: _this.rawTask.taskToken,
                result: encoded
            };
            _this.swfClient.respondActivityTaskCompleted(params, cb);
        });
    };
    ActivityTask.prototype.respondFailed = function (result, cb) {
        var _this = this;
        this.fieldSerializer.serialize(result.details, function (err, encoded) {
            if (err)
                return cb(err);
            var resErr = result.error || {};
            var errMessage = resErr.message || '';
            var params = {
                taskToken: _this.rawTask.taskToken,
                // small guard to make sure this never gets too crazy...
                reason: errMessage.slice(0, 100),
                details: encoded
            };
            _this.swfClient.respondActivityTaskFailed(params, cb);
        });
    };
    ActivityTask.prototype.respondCanceled = function (result, cb) {
        var _this = this;
        this.fieldSerializer.serialize(result, function (err, encoded) {
            if (err)
                return cb(err);
            var params = {
                taskToken: _this.rawTask.taskToken,
                details: encoded
            };
            _this.swfClient.respondActivityTaskFailed(params, cb);
        });
    };
    ActivityTask.prototype.activityName = function () {
        return this.rawTask.activityType.name;
    };
    ActivityTask.prototype.sendHeartbeat = function (status, cb) {
        var _this = this;
        this.fieldSerializer.serialize(status, function (err, encoded) {
            var params = {
                taskToken: _this.rawTask.taskToken,
                details: encoded
            };
            _this.swfClient.recordActivityTaskHeartbeat(params, function (err, data) {
                if (err)
                    return cb(err, false);
                cb(err, data.cancelRequested || false);
            });
        });
    };
    ActivityTask.prototype.getInput = function () {
        return this.taskInput.input;
    };
    ActivityTask.prototype.getEnv = function () {
        return this.taskInput.env || {};
    };
    ActivityTask.prototype.getOriginWorkflow = function () {
        return this.taskInput.originWorkflow;
    };
    return ActivityTask;
}(Task_1.Task));
exports.ActivityTask = ActivityTask;
//# sourceMappingURL=ActivityTask.js.map