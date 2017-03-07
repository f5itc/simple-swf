"use strict";
var chai_1 = require('chai');
var entities_1 = require('../../src/entities');
var tasks_1 = require('../../src/tasks');
var interfaces_1 = require('../../src/interfaces');
var sinonHelper_1 = require('../sinonHelper');
describe('Activity', function () {
    describe('constructor', function () {
        var sandbox = sinonHelper_1.default();
        var workflowMock = sandbox.stubClass(entities_1.Workflow);
        var activityTypeMock = sandbox.stubClass(entities_1.ActivityType);
        activityTypeMock.stubMethod('heartbeatTimeout').returns(10);
        activityTypeMock.setProp('name', 'foo');
        var activity = new entities_1.Activity(workflowMock, activityTypeMock, { rawTask: { activityId: '1234' } });
        it('should populate correct fields on instance new instace', function () {
            it('should throw an error on default implementation', function () {
                chai_1.assert.equal(activity['_heartbeatInterval'], 10);
                chai_1.assert.deepEqual(activity.task, {});
                chai_1.assert.equal(activity.workflow, workflowMock);
                chai_1.assert.equal(activity.taskStatus, entities_1.TaskState.Stopped);
                chai_1.assert.include(activity.id, 'foo');
            });
        });
    });
    describe('getActivityType', function () {
        it('should throw an error on default implementation', function () {
            chai_1.assert.throws(function () { return entities_1.Activity.getActivityType(); }, 'overriden');
        });
    });
    describe('run', function () {
        var sandbox = sinonHelper_1.default();
        var workflowMock = sandbox.stubClass(entities_1.Workflow);
        var activityTypeMock = sandbox.stubClass(entities_1.ActivityType);
        activityTypeMock.stubMethod('heartbeatTimeout').returns(10);
        var activity = new entities_1.Activity(workflowMock, activityTypeMock, { rawTask: { activityId: '1234' } });
        it('should throw an error on default implementation', function () {
            chai_1.assert.throws(function () { return activity.run(null, {}, function () { }); }, 'overriden');
        });
    });
    describe('stop', function () {
        var sandbox = sinonHelper_1.default();
        var workflowMock = sandbox.stubClass(entities_1.Workflow);
        var activityTypeMock = sandbox.stubClass(entities_1.ActivityType);
        activityTypeMock.stubMethod('heartbeatTimeout').returns(10);
        var activity = new entities_1.Activity(workflowMock, activityTypeMock, { rawTask: { activityId: '1234' } });
        it('should throw an error on default implementation', function () {
            chai_1.assert.throws(function () { return activity.stop(null, function () { }); }, 'overriden');
        });
    });
    describe('_start', function () {
        var sandbox = sinonHelper_1.default();
        var workflowMock = sandbox.stubClass(entities_1.Workflow);
        var activityTypeMock = sandbox.stubClass(entities_1.ActivityType);
        var taskInput = {
            input: { myTask: 'input' },
            env: {},
            originWorkflow: 'fake'
        };
        activityTypeMock.stubMethod('heartbeatTimeout').returns(10);
        it('should work to do a normal task', function (done) {
            var taskMock = sandbox.mockClass(tasks_1.ActivityTask);
            taskMock.object.rawTask = { activityId: '1234' };
            taskMock.object.taskInput = taskInput;
            taskMock.expects('respondSuccess').once().callsArgWithAsync(1, null, true, { status: 'test' });
            taskMock.expects('respondFailed').never();
            var runCalled = false;
            var activity = new entities_1.Activity(workflowMock, activityTypeMock, taskMock.object);
            activity.heartbeatInterval = 10;
            activity.run = function (input, env, cb) {
                runCalled = true;
                process.nextTick(function () {
                    cb(null, { status: 'test' });
                });
            };
            activity._start(function (err, success, res) {
                chai_1.assert.ifError(err);
                chai_1.assert(runCalled);
                chai_1.assert.equal(activity.taskStatus, entities_1.TaskState.Finished);
                chai_1.assert(success);
                chai_1.assert(res.status, 'test');
                taskMock.verify();
                done();
            });
            chai_1.assert.equal(activity.taskStatus, entities_1.TaskState.Started, 'should change state after starting');
        });
        it('should respond if a task failed', function (done) {
            var taskMock = sandbox.mockClass(tasks_1.ActivityTask);
            taskMock.object.taskInput = taskInput;
            taskMock.object.rawTask = { activityId: '1234' };
            taskMock.expects('respondSuccess').never();
            taskMock.expects('respondFailed').once().callsArgWithAsync(1, null);
            var runCalled = false;
            var activity = new entities_1.Activity(workflowMock, activityTypeMock, taskMock.object);
            activity.heartbeatInterval = 10;
            activity.run = function (input, env, cb) {
                process.nextTick(function () {
                    cb(new Error('a problem'), { status: 'failed' });
                });
            };
            activity._start(function (err, success, res) {
                chai_1.assert.ifError(err);
                chai_1.assert.equal(activity.taskStatus, entities_1.TaskState.Failed);
                chai_1.assert(!success);
                chai_1.assert(res.status, 'failed');
                taskMock.verify();
                done();
            });
            chai_1.assert.equal(activity.taskStatus, entities_1.TaskState.Started, 'should change state after starting');
        });
        it('should emit heartbeats for long running tasks', function (done) {
            var taskMock = sandbox.mockClass(tasks_1.ActivityTask);
            taskMock.object.taskInput = taskInput;
            taskMock.object.rawTask = { activityId: '1234' };
            taskMock.expects('respondSuccess').once().callsArgWithAsync(1, null, true, { status: 'test' });
            taskMock.expects('sendHeartbeat').once().callsArgWithAsync(1, null, false);
            var activity = new entities_1.Activity(workflowMock, activityTypeMock, taskMock.object);
            activity.heartbeatInterval = 10;
            var gotHeartbeat = false;
            var finHeartbeat = false;
            activity.run = function (input, env, cb) {
                setTimeout(function () {
                    cb(null, { status: 'test' });
                }, 6);
            };
            activity.on('heartbeat', function () { return gotHeartbeat = true; });
            activity.on('heartbeatComplete', function () { return finHeartbeat = true; });
            activity._start(function (err, success, res) {
                chai_1.assert.ifError(err);
                chai_1.assert(gotHeartbeat);
                chai_1.assert(finHeartbeat);
                taskMock.verify();
                done();
            });
        });
        it('should work to have a heartbeat cancel an operation', function (done) {
            var taskMock = sandbox.mockClass(tasks_1.ActivityTask);
            taskMock.object.taskInput = taskInput;
            taskMock.object.rawTask = { activityId: '1234' };
            taskMock.expects('respondCanceled').once().callsArgWithAsync(1, null);
            taskMock.expects('respondSuccess').never();
            taskMock.expects('sendHeartbeat').once().callsArgWithAsync(1, null, true);
            var activity = new entities_1.Activity(workflowMock, activityTypeMock, taskMock.object);
            activity.heartbeatInterval = 10;
            var stopCalled = false;
            var stopReason = null;
            var cancelEvent = false;
            activity.stop = function (reason, cb) {
                stopCalled = true;
                stopReason = reason;
                setTimeout(function () {
                    cb();
                }, 5);
            };
            var didFinish = false;
            var runTimeout = null;
            activity.run = function (input, env, cb) {
                runTimeout = setTimeout(function () {
                    didFinish = true;
                    cb(null, { status: 'test' });
                }, 100);
            };
            activity.on('canceled', function () {
                cancelEvent = true;
                clearTimeout(runTimeout);
                chai_1.assert(!didFinish);
                chai_1.assert(stopCalled);
                chai_1.assert(cancelEvent);
                chai_1.assert.equal(activity.taskStatus, entities_1.TaskState.Canceled);
                chai_1.assert.equal(stopReason, interfaces_1.StopReasons.HeartbeatCancel);
                taskMock.verify();
                done();
            });
            activity._start(function (err, success, res) {
                // we should never get here!
                chai_1.assert(false);
            });
        });
        it('should recover from an UnknownResourceFault by cancelling but not reporting the cancel', function (done) {
            var taskMock = sandbox.mockClass(tasks_1.ActivityTask);
            taskMock.object.rawTask = { activityId: '1234' };
            taskMock.object.taskInput = taskInput;
            taskMock.expects('respondCanceled').never();
            taskMock.expects('respondSuccess').never();
            taskMock.expects('sendHeartbeat').once().callsArgWithAsync(1, { code: "UnknownResourceFault" }, true);
            var activity = new entities_1.Activity(workflowMock, activityTypeMock, taskMock.object);
            activity.heartbeatInterval = 10;
            var stopCalled = false;
            var stopReason = null;
            var cancelEvent = false;
            activity.stop = function (reason, cb) {
                stopCalled = true;
                stopReason = reason;
                setTimeout(function () {
                    cb();
                }, 5);
            };
            var didFinish = false;
            var runTimeout = null;
            activity.run = function (input, env, cb) {
                runTimeout = setTimeout(function () {
                    didFinish = true;
                    cb(null, { status: 'test' });
                }, 100);
            };
            activity.on('canceled', function () {
                cancelEvent = true;
                clearTimeout(runTimeout);
                chai_1.assert(!didFinish);
                chai_1.assert(stopCalled);
                chai_1.assert(cancelEvent);
                chai_1.assert.equal(activity.taskStatus, entities_1.TaskState.Canceled);
                chai_1.assert.equal(stopReason, interfaces_1.StopReasons.UnknownResource);
                taskMock.verify();
                done();
            });
            activity._start(function (err, success, res) {
                // we should never get here!
                chai_1.assert(false);
            });
        });
    });
    describe('_requestStop', function () {
        var sandbox = sinonHelper_1.default();
        var workflowMock = sandbox.stubClass(entities_1.Workflow);
        var activityTypeMock = sandbox.stubClass(entities_1.ActivityType);
        var taskInput = {
            input: { myTask: 'input' },
            env: {},
            originWorkflow: 'fake'
        };
        activityTypeMock.stubMethod('heartbeatTimeout').returns(10);
        it('should work to do a normal task', function (done) {
            var taskMock = sandbox.mockClass(tasks_1.ActivityTask);
            taskMock.object.rawTask = { activityId: '1234' };
            taskMock.object.taskInput = taskInput;
            taskMock.expects('respondSuccess').never();
            taskMock.expects('respondCanceled').once().callsArgWithAsync(1, null);
            var runCalled = false;
            var activity = new entities_1.Activity(workflowMock, activityTypeMock, taskMock.object);
            activity.run = function (input, cb) {
                setTimeout(function () {
                    cb(null, { status: 'test' });
                }, 100);
            };
            activity._start(function (err, success, res) {
                // should never get here
                chai_1.assert(false);
            });
            var stopCalled = false;
            activity.stop = function (reason, cb) {
                stopCalled = true;
                setTimeout(function () {
                    cb();
                }, 5);
            };
            chai_1.assert.equal(activity.taskStatus, entities_1.TaskState.Started, 'should change state after starting');
            activity._requestStop(interfaces_1.StopReasons.ProcessExit, false, function (err) {
                chai_1.assert.ifError(err);
                chai_1.assert.equal(activity.taskStatus, entities_1.TaskState.Canceled);
                chai_1.assert(stopCalled);
                done();
            });
        });
    });
});
//# sourceMappingURL=ActivityTest.js.map