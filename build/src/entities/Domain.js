"use strict";
var aws_sdk_1 = require('aws-sdk');
var _ = require('lodash');
var SWFConfig_1 = require('../SWFConfig');
var interfaces_1 = require('../interfaces');
var Workflow_1 = require('./Workflow');
var ActivityTypeInfo_1 = require('./ActivityTypeInfo');
var objectAssign = require('object-assign');
var Domain = (function () {
    function Domain(name, config, swfClient) {
        this.name = name;
        this.config = config;
        this.swfClient = swfClient || new aws_sdk_1.SWF();
    }
    Domain.prototype.ensureDomain = function (opts, cb) {
        var defaults = this.config.populateDefaults({ entities: ['domain'], api: 'registerDomain' }, opts);
        var retentionKey = this.config.getMappingName('executionRetentionPeriodInDays', { entities: ['domain'],
            api: 'registerDomain' });
        var retention = defaults[retentionKey];
        var params = {
            name: this.name,
            workflowExecutionRetentionPeriodInDays: retention,
        };
        this.swfClient.registerDomain(_.defaults(params, defaults), function (err) {
            if (err && err.code !== interfaces_1.DomainExistsFaults)
                return cb(err, false);
            if (err)
                return cb(null, false);
            cb(null, true);
        });
    };
    Domain.prototype.countClosedWorkflowExecutions = function (input, cb) {
        var withDomain = objectAssign(input, { domain: this.name });
        this.swfClient.countClosedWorkflowExecutions(withDomain, function (err, data) {
            if (err)
                return cb(err);
            cb(null, data.count, data.truncated);
        });
    };
    Domain.prototype.countOpenWorkflowExecutions = function (input, cb) {
        var withDomain = objectAssign(input, { domain: this.name });
        this.swfClient.countOpenWorkflowExecutions(withDomain, function (err, data) {
            if (err)
                return cb(err);
            cb(null, data.count, data.truncated);
        });
    };
    Domain.prototype.buildWfExection = function (serializer, info) {
        var wf = new Workflow_1.Workflow(this, info.workflowType.name, info.workflowType.version, serializer);
        var wfExec = wf.buildExecution(info.execution.workflowId, info.execution.runId);
        wfExec.startTimestamp = info.startTimestamp;
        wfExec.executionStatus = info.executionStatus;
        wfExec.cancelRequested = info.cancelRequested;
        return wf.buildExecution(info.execution.workflowId, info.execution.runId);
    };
    Domain.prototype.listOpenWorkflowExecutions = function (serializer, input, cb) {
        var withDomain = objectAssign(input, { domain: this.name });
        var workflows = [];
        var buildExecBound = this.buildWfExection.bind(this, serializer);
        this.swfClient.listOpenWorkflowExecutions(withDomain).eachPage(function (err, data) {
            if (err)
                return cb(err);
            if (!data)
                return cb(null, workflows);
            workflows = workflows.concat(data.executionInfos.map(buildExecBound));
        });
    };
    Domain.prototype.listClosedWorkflowExecutions = function (serializer, input, cb) {
        var withDomain = objectAssign(input, { domain: this.name });
        var workflows = [];
        var buildExecBound = this.buildWfExection.bind(this, serializer);
        this.swfClient.listClosedWorkflowExecutions(withDomain).eachPage(function (err, data) {
            if (err)
                return cb(err);
            if (!data)
                return cb(undefined, workflows);
            workflows = workflows.concat(data.executionInfos.map(buildExecBound));
        });
    };
    Domain.prototype.listActivityTypes = function (input, cb) {
        var _this = this;
        var withDomain = objectAssign(input, { domain: this.name });
        var actTypes = [];
        this.swfClient.listActivityTypes(withDomain).eachPage(function (err, data) {
            if (err)
                return cb(err);
            if (!data)
                return cb(null, actTypes);
            actTypes = actTypes.concat(data.typeInfos.map(function (actInfo) {
                var actType = new ActivityTypeInfo_1.ActivityTypeInfo(actInfo.activityType.name, actInfo.activityType.version);
                actType.domainScope[_this.name] = {
                    status: actInfo.status,
                    description: actInfo.description,
                    creationDate: actInfo.creationDate,
                    deprecationDate: actInfo.deprecationDate
                };
                return actType;
            }));
        });
    };
    Domain.prototype.countPendingActivityTasks = function (name, cb) {
        this.swfClient.countPendingActivityTasks({ domain: this.name, taskList: { name: name } }, function (err, data) {
            if (err)
                return cb(err);
            cb(null, data.count, data.truncated);
        });
    };
    Domain.prototype.countPendingDecisionTasks = function (name, cb) {
        this.swfClient.countPendingDecisionTasks({ domain: this.name, taskList: { name: name } }, function (err, data) {
            if (err)
                return cb(err);
            cb(null, data.count, data.truncated);
        });
    };
    Domain.prototype.deprecateDomain = function (cb) {
        this.swfClient.deprecateDomain({ name: this.name }, cb);
    };
    Domain.prototype.describeDomain = function (cb) {
        this.swfClient.describeDomain({ name: this.name }, cb);
    };
    Domain.prototype.toJSON = function () {
        return {
            domain: this.name,
            status: this.status,
            description: this.description
        };
    };
    Domain.loadDomain = function (config, swfClient, name) {
        return new Domain(name, config, swfClient);
    };
    Domain.listDomains = function (config, swfClient, regStatus, cb) {
        var boundLoad = Domain.loadDomain.bind(Domain, config, swfClient);
        var domains = [];
        swfClient.listDomains({ registrationStatus: regStatus }).eachPage(function (err, data) {
            if (err)
                return cb(err);
            if (!data)
                return cb(undefined, domains);
            domains = domains.concat(data.domainInfos.map(function (di) {
                var d = boundLoad(di.name);
                d.status = di.status;
                d.description = di.description;
                return d;
            }));
        });
    };
    Domain.getDefaultConfig = function () {
        return {
            executionRetentionPeriodInDays: {
                description: 'The amount of time to keep the record of the workflow execution.',
                mappings: [{ api: 'registerDomain', name: 'workflowExecutionRetentionPeriodInDays' }],
                value: 5,
                unit: SWFConfig_1.ConfigDefaultUnit.Second
            },
            description: {
                description: 'Provides a text description for this domain',
                mappings: [
                    { api: 'registerDomain', name: 'description' }
                ],
                value: null,
                unit: SWFConfig_1.ConfigDefaultUnit.String
            },
        };
    };
    return Domain;
}());
exports.Domain = Domain;
//# sourceMappingURL=Domain.js.map