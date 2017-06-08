"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var aws_sdk_1 = require("aws-sdk");
var workers_1 = require("../../src/workers");
var tasks_1 = require("../../src/tasks");
var sinonHelper_1 = require("../sinonHelper");
describe('Worker', function () {
    describe('loop', function () {
        var sandbox = sinonHelper_1.default();
        var worker = sandbox.mockClass(workers_1.Worker);
        it('should emit events as it polls and keep looping', function (done) {
            var reqObj = sandbox.stubClass(aws_sdk_1.Request);
            var loopCount = 0;
            reqObj.on = function (event, cb) {
                if (event === 'error')
                    process.nextTick(function () { return cb(new Error('break out')); });
                return reqObj;
            };
            reqObj.abort = function () {
                return reqObj;
            };
            worker.object.buildApiRequest = function () {
                return reqObj;
            };
            var sendCalled = false;
            worker.object.sendRequest = function (req, cb) {
                sendCalled = true;
                cb(undefined, {});
            };
            worker.object.on('poll', function (req) {
                loopCount++;
                if (loopCount === 3) {
                    chai_1.assert.deepEqual(req, reqObj);
                    worker.object._stop(function () {
                        chai_1.assert(sendCalled);
                        chai_1.assert.equal(loopCount, 3);
                        done();
                    });
                }
            });
            worker.object._start();
        });
        it('should emit task events and call run method', function (done) {
            var reqObj = sandbox.stubClass(aws_sdk_1.Request);
            var taskCalled = false;
            var performCalled = false;
            reqObj.on = function (event, cb) {
                if (event === 'error')
                    process.nextTick(function () { return cb(new Error('break out')); });
                return reqObj;
            };
            reqObj.abort = function () {
                return reqObj;
            };
            worker.object.buildApiRequest = function () {
                return reqObj;
            };
            var taskObj = sandbox.stubClass(tasks_1.Task);
            worker.object.wrapTask = function (wf, data, cb) {
                taskObj.rawTask = data;
                cb(null, taskObj);
            };
            worker.object.sendRequest = function (req, cb) {
                cb(undefined, { taskToken: '1234' });
            };
            worker.object.on('task', function (task) {
                taskCalled = true;
                chai_1.assert.deepEqual(task.rawTask, taskObj.rawTask);
            });
            worker.object.performTask = function (task) {
                performCalled = true;
                worker.object._stop(function () {
                    chai_1.assert(taskCalled);
                    chai_1.assert(performCalled);
                    done();
                });
            };
            worker.object._start();
        });
    });
});
//# sourceMappingURL=WorkerTest.js.map