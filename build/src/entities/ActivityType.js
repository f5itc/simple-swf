"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var _ = require('lodash');
var SWFConfig_1 = require('../SWFConfig');
var interfaces_1 = require('../interfaces');
var ActivityTypeInfo_1 = require('./ActivityTypeInfo');
var ActivityType = (function (_super) {
    __extends(ActivityType, _super);
    function ActivityType(name, version, HandlerClass, opts) {
        if (opts === void 0) { opts = {}; }
        _super.call(this, name, version);
        this.HandlerClass = HandlerClass;
        this.opts = opts;
        this.maxRetry = opts['maxRetry'] || 5;
        this.domainScope = {};
    }
    ActivityType.prototype.ensureActivityType = function (domain, cb) {
        var defaults = domain.config.populateDefaults({ entities: ['activity'], api: 'registerActivityType' }, this.opts);
        var params = {
            name: this.name,
            version: this.version,
            domain: domain.name
        };
        domain.swfClient.registerActivityType(_.defaults(params, defaults), function (err) {
            if (err && err.code !== interfaces_1.TypeExistsFault)
                return cb(err, false);
            if (err)
                return cb(null, false);
            cb(null, true);
        });
    };
    ActivityType.prototype.createExecution = function (workflow, task) {
        return new this.HandlerClass(workflow, this, task);
    };
    ActivityType.prototype.heartbeatTimeout = function (config) {
        if (this.opts['heartbeatTimeout'])
            return this.opts['heartbeatTimeout'];
        return config.getValueForParam('activity', 'heartbeatTimeout');
    };
    ActivityType.getDefaultConfig = function () {
        return {
            heartbeatTimeout: {
                description: 'A task must make a RecordActivityTaskHeartbeat call once within this interval. If not, the task is marked as invalid and rescheduled',
                mappings: [
                    { api: 'respondDecisionTaskCompleted', attribute: 'scheduleActivityTaskDecisionAttributes', name: 'heartbeatTimeout' },
                    { api: 'registerActivityType', name: 'defaultTaskHeartbeatTimeout' }
                ],
                value: 120,
                unit: SWFConfig_1.ConfigDefaultUnit.Second
            },
            startToCloseTimeout: {
                description: 'The maximum amount of time an activity task can be outstanding after being started. 0 or NONE indiciate no limit',
                mappings: [
                    { api: 'registerActivityType', name: 'defaultTaskStartToCloseTimeout' },
                    { api: 'startWorkflowExecution', name: 'taskStartToCloseTimeout' },
                    { api: 'respondDecisionTaskCompleted', attribute: 'scheduleActivityTaskDecisionAttributes', name: 'startToCloseTimeout' },
                    { api: 'respondDecisionTaskCompleted', attribute: 'scheduleLambdaFunctionDecisionAttributes', name: 'startToCloseTimeout' }
                ],
                value: 'NONE',
                unit: SWFConfig_1.ConfigDefaultUnit.Second,
            },
            scheduleToStartTimeout: {
                description: 'The maximum amount of time a task can be waiting to be started. 0 or NONE indicate no limit',
                mappings: [
                    { api: 'registerActivityType', name: 'defaultTaskScheduleToStartTimeout' },
                    { api: 'respondDecisionTaskCompleted', attribute: 'scheduleActivityTaskDecisionAttributes', name: 'scheduleToStartTimeout' },
                ],
                value: 'NONE',
                unit: SWFConfig_1.ConfigDefaultUnit.Second,
            },
            scheduleToCloseTimeout: {
                description: 'The maximum amount of time a task can be outstanding, including scheudling delay. 0 or NONE indicate no limit',
                mappings: [
                    { api: 'registerActivityType', name: 'defaultTaskScheduleToCloseTimeout' },
                    { api: 'respondDecisionTaskCompleted', attribute: 'scheduleActivityTaskDecisionAttributes', name: 'scheduleToCloseTimeout' },
                ],
                value: 'NONE',
                unit: SWFConfig_1.ConfigDefaultUnit.Second,
            },
            taskList: {
                description: 'Specifies the taskList name for a specific activity or filters by taskList, see SWF docs for more stails',
                mappings: [
                    { api: 'registerActivityType', name: 'defaultTaskList' },
                    { api: 'respondDecisionTaskCompleted', attribute: 'startChildWorkflowExecutionDecisionAttributes', name: 'taskList' },
                    { api: 'pollForActivityTask', name: 'taskList' }
                ],
                value: 'simple-swf',
                format: function (name) {
                    return { name: name };
                },
                unit: SWFConfig_1.ConfigDefaultUnit.String
            },
            taskPriority: {
                description: 'The priority allows for tasks to be prioritized above others, see SWF docs for details',
                mappings: [
                    { api: 'registerActivityType', name: 'defaultTaskPriority' },
                    { api: 'respondDecisionTaskCompleted', attribute: 'startChildWorkflowExecutionDecisionAttributes', name: 'taskPriority' }
                ],
                value: 0,
                unit: SWFConfig_1.ConfigDefaultUnit.Number
            },
            description: {
                description: 'Provides a text description for this activty type',
                mappings: [
                    { api: 'registerActivityType', name: 'description' }
                ],
                value: null,
                unit: SWFConfig_1.ConfigDefaultUnit.String
            }
        };
    };
    return ActivityType;
}(ActivityTypeInfo_1.ActivityTypeInfo));
exports.ActivityType = ActivityType;
//# sourceMappingURL=ActivityType.js.map