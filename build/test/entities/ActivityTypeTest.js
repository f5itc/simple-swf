"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var entities_1 = require('../../src/entities');
var tasks_1 = require('../../src/tasks');
var SWFConfig_1 = require('../../src/SWFConfig');
var chai_1 = require('chai');
var sinonHelper_1 = require('../sinonHelper');
var FakeActivity = (function (_super) {
    __extends(FakeActivity, _super);
    function FakeActivity() {
        _super.apply(this, arguments);
    }
    FakeActivity.prototype.run = function (cb) {
        this.emit('ran');
        cb(null, { status: 'didStuff' });
    };
    return FakeActivity;
}(entities_1.Activity));
describe('ActivityType', function () {
    describe('constructor', function () {
        var sandbox = sinonHelper_1.default();
        it('should properly set properties we expect', function () {
            var activityType = new entities_1.ActivityType('testAct', '1.0.0', FakeActivity);
            chai_1.assert.equal(activityType.name, 'testAct');
            chai_1.assert.equal(activityType.version, '1.0.0');
            chai_1.assert.deepEqual(activityType.opts, {});
            chai_1.assert.equal(activityType.maxRetry, 5);
        });
    });
    describe('heartbeatTimeout', function () {
        var sandbox = sinonHelper_1.default();
        it('should grab the default from the config', function () {
            var configMock = sandbox.mockClass(SWFConfig_1.SWFConfig);
            configMock.expects('getValueForParam').once().returns(10);
            var activityType = new entities_1.ActivityType('testAct', '1.0.0', FakeActivity);
            chai_1.assert.equal(activityType.heartbeatTimeout(configMock.object), 10);
            configMock.verify();
        });
        it('should grab an override from the class', function () {
            var configMock = sandbox.mockClass(SWFConfig_1.SWFConfig);
            configMock.expects('getValueForParam').never();
            var activityType = new entities_1.ActivityType('testAct', '1.0.0', FakeActivity, { heartbeatTimeout: 20 });
            chai_1.assert.equal(activityType.heartbeatTimeout(configMock.object), 20);
            configMock.verify();
        });
    });
    describe('createExecution', function () {
        var sandbox = sinonHelper_1.default();
        var workflow = sandbox.stubClass(entities_1.Workflow);
        var actTask = sandbox.stubClass(tasks_1.ActivityTask);
        actTask.rawTask = { activityId: '1234' };
        it('should return an execution of the class passed in', function () {
            var activityType = new entities_1.ActivityType('testAct', '1.0.0', FakeActivity);
            sandbox.stub(activityType, 'heartbeatTimeout', function () { return 10; });
            var execution = activityType.createExecution(workflow, actTask);
            chai_1.assert.instanceOf(execution, FakeActivity);
            chai_1.assert.equal(execution.id, '1234');
        });
    });
    describe('ensureActivityType', function () {
        var sandbox = sinonHelper_1.default();
        var domain = sandbox.stubClass(entities_1.Domain);
        domain.setProp('name', 'mydomain');
        it('should register the activity using defaults from config and overrides', function (done) {
            var activityType = new entities_1.ActivityType('testAct', '1.0.0', FakeActivity, { hello: 'world' });
            var swfMock = {
                registerActivityType: function (params, cb) {
                    inputParams = params;
                    process.nextTick(function () {
                        if (cb) {
                            cb();
                        }
                    });
                    return {};
                }
            };
            var swfSpy = sandbox.spy(swfMock, 'registerActivityType');
            var configMock = sandbox.mockClass(SWFConfig_1.SWFConfig);
            configMock.expects('populateDefaults').once()
                .withArgs({ entities: ['activity'], api: 'registerActivityType' }, { hello: 'world' })
                .returns({
                foobar: 'stuff',
                hello: 'world',
                domain: 'not this value'
            });
            var inputParams = {};
            domain.swfClient = swfMock;
            domain.config = configMock.object;
            activityType.ensureActivityType(domain, function (err) {
                chai_1.assert.ifError(err);
                chai_1.assert.equal(swfSpy.callCount, 1);
                configMock.verify();
                chai_1.assert.deepEqual(inputParams, {
                    domain: 'mydomain',
                    foobar: 'stuff',
                    hello: 'world',
                    name: 'testAct',
                    version: '1.0.0'
                });
                done();
            });
        });
    });
    describe('getDefaultConfig', function () {
        it('should return a config', function () {
            chai_1.assert(entities_1.ActivityType.getDefaultConfig());
        });
    });
});
//# sourceMappingURL=ActivityTypeTest.js.map