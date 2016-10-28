"use strict";
var _ = require('lodash');
var SWFConfig_1 = require('../SWFConfig');
var interfaces_1 = require('../interfaces');
var WorkflowExecution_1 = require('./WorkflowExecution');
var Workflow = (function () {
    function Workflow(domain, name, version, fieldSerializer) {
        this.domain = domain;
        this.name = name;
        this.version = version;
        this.swfClient = domain.swfClient;
        this.config = domain.config;
        this.fieldSerializer = fieldSerializer;
    }
    Workflow.prototype.ensureWorkflow = function (opts, cb) {
        var defaults = this.config.populateDefaults({ entities: ['workflow'], api: 'registerWorkflowType' }, opts);
        var params = {
            name: this.name,
            version: this.version,
            domain: this.domain.name
        };
        this.swfClient.registerWorkflowType(_.defaults(params, defaults), function (err) {
            if (err && err.code !== interfaces_1.TypeExistsFault)
                return cb(err, false);
            if (err)
                return cb(null, false);
            cb(null, true);
        });
    };
    Workflow.prototype.startWorkflow = function (id, input, env, opts, cb) {
        var _this = this;
        var defaults = this.config.populateDefaults({ entities: ['workflow', 'decision'], api: 'startWorkflowExecution' }, opts);
        // TODO: get rid of this hack, currently need it as this API crosses entties, need
        // to take care of in config layer
        var taskStartParam = this.config.getMappingName('startToCloseTimeout', { entities: ['decision'], api: 'startWorkflowExecution' });
        var params = {
            domain: this.domain.name,
            workflowId: id,
            input: JSON.stringify({
                input: input,
                env: env,
                originWorkflow: id
            }),
            taskStartToCloseTimeout: defaults[taskStartParam],
            workflowType: {
                name: this.name,
                version: this.version
            }
        };
        var merged = _.defaults(params, defaults);
        this.fieldSerializer.serializeAll(merged, function (err, encoded) {
            if (err)
                return cb(err);
            _this.swfClient.startWorkflowExecution(encoded, function (err, data) {
                if (err)
                    return cb(err);
                var runInfo = {
                    workflowId: id,
                    runId: data.runId
                };
                cb(null, runInfo, new WorkflowExecution_1.WorkflowExecution(_this, runInfo));
            });
        });
    };
    Workflow.prototype.buildExecution = function (workflowId, runId) {
        return new WorkflowExecution_1.WorkflowExecution(this, { workflowId: workflowId, runId: runId });
    };
    Workflow.prototype.deprecateWorkflowType = function (cb) {
        this.swfClient.deprecateWorkflowType({ domain: this.domain.name,
            workflowType: { name: this.name, version: this.version } }, function (err) {
            cb(err);
        });
    };
    Workflow.prototype.describeWorkflowType = function (cb) {
        this.swfClient.describeWorkflowType({ domain: this.domain.name,
            workflowType: { name: this.name, version: this.version } }, cb);
    };
    Workflow.prototype.toJSON = function () {
        return {
            domain: this.domain.name,
            workflowType: {
                name: this.name,
                version: this.version
            }
        };
    };
    Workflow.getDefaultConfig = function () {
        return {
            startToCloseTimeout: {
                description: 'The maximum amount of time this workflow can run. This has a max value of 1 year',
                mappings: [
                    { api: 'registerWorkflowType', name: 'defaultExecutionStartToCloseTimeout' },
                    { api: 'startWorkflowExecution', name: 'executionStartToCloseTimeout' },
                    { api: 'respondDecisionTaskCompleted', attribute: 'continueAsNewWorkflowExecutionDecisionAttributes', name: 'executionStartToCloseTimeout' },
                    { api: 'respondDecisionTaskCompleted', attribute: 'startChildWorkflowExecutionDecisionAttributes', name: 'executionStartToCloseTimeout' }
                ],
                value: 60 * 60 * 24 * 30,
                unit: SWFConfig_1.ConfigDefaultUnit.Second
            },
            childPolicy: {
                description: 'The behvaior child policies should have if the parent workflow dies',
                mappings: [
                    { api: 'registerWorkflowType', name: 'defaultChildPolicy' },
                    { api: 'terminateWorkflowExecution', name: 'childPolicy' },
                    { api: 'startWorkflowExecution', name: 'childPolicy' },
                    { api: 'respondDecisionTaskCompleted', attribute: 'continueAsNewWorkflowExecutionDecisionAttributes', name: 'childPolicy' },
                    { api: 'respondDecisionTaskCompleted', attribute: 'startChildWorkflowExecutionDecisionAttributes', name: 'childPolicy' }
                ],
                possible: ['TERMINATE', 'REQUEST_CANCEL', 'ABANDON'],
                value: 'TERMINATE',
                unit: SWFConfig_1.ConfigDefaultUnit.Enum
            },
            taskList: {
                description: 'The defaultTaskList that will be assigned to activities in this workflow, see SWF docs for task list details',
                mappings: [
                    { api: 'registerWorkflowType', name: 'defaultTaskList' },
                    { api: 'respondDecisionTaskCompleted', attribute: 'continueAsNewWorkflowExecutionDecisionAttributes', name: 'taskList' },
                    { api: 'respondDecisionTaskCompleted', attribute: 'startChildWorkflowExecutionDecisionAttributes', name: 'taskList' },
                    { api: 'startWorkflowExecution', name: 'taskList' }
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
                    { api: 'registerWorkflowType', name: 'defaultTaskPriority' },
                    { api: 'respondDecisionTaskCompleted', attribute: 'continueAsNewWorkflowExecutionDecisionAttributes', name: 'taskPriority' },
                    { api: 'respondDecisionTaskCompleted', attribute: 'startChildWorkflowExecutionDecisionAttributes', name: 'taskPriority' },
                    { api: 'startWorkflowExecution', name: 'taskPriority' }
                ],
                value: 0,
                unit: SWFConfig_1.ConfigDefaultUnit.Number
            },
            description: {
                description: 'Provides a text description for this workflow',
                mappings: [
                    { api: 'registerWorkflowType', name: 'description' }
                ],
                value: null,
                unit: SWFConfig_1.ConfigDefaultUnit.String
            },
            lambdaRole: {
                description: 'Lambda role to be used if using lambdaTasks',
                mappings: [
                    { api: 'registerWorkflowType', name: 'defaultLambdaRole' },
                    { api: 'respondDecisionTaskCompleted', attribute: 'continueAsNewWorkflowExecutionDecisionAttributes', name: 'lambdaRole' },
                    { api: 'respondDecisionTaskCompleted', attribute: 'startChildWorkflowExecutionDecisionAttributes', name: 'lambdaRole' },
                    { api: 'startWorkflowExecution', name: 'lambdaRole' }
                ],
                value: null,
                unit: SWFConfig_1.ConfigDefaultUnit.String
            }
        };
    };
    return Workflow;
}());
exports.Workflow = Workflow;
//# sourceMappingURL=Workflow.js.map