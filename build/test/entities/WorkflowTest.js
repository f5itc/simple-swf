"use strict";
var entities_1 = require('../../src/entities');
var util_1 = require('../../src/util');
var SWFConfig_1 = require('../../src/SWFConfig');
var aws_sdk_1 = require('aws-sdk');
var chai_1 = require('chai');
var sinonHelper_1 = require('../sinonHelper');
describe('Workflow', function () {
    describe('constructor', function () {
        var sandbox = sinonHelper_1.default();
        var config = new SWFConfig_1.SWFConfig();
        var domain = sandbox.stubClass(entities_1.Domain);
        var fieldSerializer = sandbox.stubClass(util_1.FieldSerializer);
        domain.config = config;
        domain.swfClient = new aws_sdk_1.SWF;
        it('should set properties', function () {
            var workflow = new entities_1.Workflow(domain, 'myworkflow', '1.0.0', fieldSerializer);
            chai_1.assert.equal(workflow.name, 'myworkflow');
            chai_1.assert.equal(workflow.version, '1.0.0');
            chai_1.assert.equal(workflow.config, domain.config);
            chai_1.assert.equal(workflow.swfClient, domain.swfClient);
            chai_1.assert.equal(workflow.fieldSerializer, fieldSerializer);
        });
    });
    describe('ensureWorkflow', function () {
        var sandbox = sinonHelper_1.default();
        var config = new SWFConfig_1.SWFConfig();
        var domain = sandbox.stubClass(entities_1.Domain);
        var fieldSerializer = sandbox.stubClass(util_1.FieldSerializer);
        it('should register the workflow using defaults from config and overrides', function (done) {
            var wfParams = null;
            var swfMock = {
                registerWorkflowType: function (params, cb) {
                    wfParams = params;
                    process.nextTick(function () {
                        if (cb) {
                            cb();
                        }
                    });
                    return {};
                }
            };
            var config = new SWFConfig_1.SWFConfig();
            var configMock = sandbox.mock(config);
            configMock.expects('populateDefaults').once()
                .withArgs({ entities: ['workflow'], api: 'registerWorkflowType' }, { hello: 'world' })
                .returns({ hello: 'world' });
            domain.config = config;
            domain.swfClient = swfMock;
            domain.setProp('name', 'testDomain');
            var workflow = new entities_1.Workflow(domain, 'myworkflow', '1.0.0', fieldSerializer);
            var swfSpy = sandbox.spy(swfMock, 'registerWorkflowType');
            workflow.ensureWorkflow({ hello: 'world' }, function (err) {
                chai_1.assert.ifError(err);
                chai_1.assert.equal(swfSpy.callCount, 1);
                configMock.verify();
                chai_1.assert.deepEqual(wfParams, {
                    domain: 'testDomain',
                    name: 'myworkflow',
                    version: '1.0.0',
                    hello: 'world'
                });
                done();
            });
        });
    });
    describe('startWorkflow', function () {
        var sandbox = sinonHelper_1.default();
        var config = new SWFConfig_1.SWFConfig();
        it('should register the workflow using defaults from config and overrides', function (done) {
            var taskInput = {
                input: { field: 'value' },
                env: { myEnv: 'env' },
                originWorkflow: 'myId'
            };
            var fieldSerializer = sandbox.mockClass(util_1.FieldSerializer);
            fieldSerializer.expects('serializeAll').once().withArgs({
                domain: 'testDomain',
                workflowId: 'myId',
                input: JSON.stringify(taskInput),
                taskStartToCloseTimeout: '10',
                workflowType: {
                    name: 'myworkflow',
                    version: '1.0.0'
                },
                hello: 'world'
            }).callsArgWithAsync(1, null, {
                domain: 'testDomain',
                workflowId: 'myId',
                input: JSON.stringify(taskInput),
                taskStartToCloseTimeout: '10',
                workflowType: {
                    name: 'myworkflow',
                    version: '1.0.0'
                },
                hello: 'world'
            });
            var wfParams = null;
            var swfMock = {
                startWorkflowExecution: function (params, cb) {
                    wfParams = params;
                    process.nextTick(function () {
                        if (cb) {
                            cb(null, { runId: '1234' });
                        }
                    });
                    return {};
                }
            };
            var config = new SWFConfig_1.SWFConfig();
            var configMock = sandbox.mock(config);
            configMock.expects('populateDefaults').once()
                .withArgs({ entities: ['workflow', 'decision'], api: 'startWorkflowExecution' }, { hello: 'world' })
                .returns({ hello: 'world', taskStartToCloseTimeout: '10' });
            var domain = sandbox.stubClass(entities_1.Domain);
            domain.config = config;
            domain.swfClient = swfMock;
            domain.setProp('name', 'testDomain');
            var workflow = new entities_1.Workflow(domain, 'myworkflow', '1.0.0', fieldSerializer.object);
            var swfSpy = sandbox.spy(swfMock, 'startWorkflowExecution');
            workflow.startWorkflow('myId', taskInput.input, taskInput.env, { hello: 'world' }, function (err, workflowInfo) {
                chai_1.assert.ifError(err);
                chai_1.assert.equal(swfSpy.callCount, 1);
                configMock.verify();
                chai_1.assert.deepEqual(wfParams, {
                    domain: 'testDomain',
                    workflowId: 'myId',
                    input: JSON.stringify(taskInput),
                    taskStartToCloseTimeout: '10',
                    workflowType: {
                        name: 'myworkflow',
                        version: '1.0.0'
                    },
                    hello: 'world'
                });
                done();
            });
        });
    });
    describe('getDefaultConfig', function () {
        it('should return a config', function () {
            chai_1.assert(entities_1.Workflow.getDefaultConfig());
        });
    });
});
//# sourceMappingURL=WorkflowTest.js.map