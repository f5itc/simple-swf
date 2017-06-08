"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var entities_1 = require("../../src/entities");
var SWFConfig_1 = require("../../src/SWFConfig");
var aws_sdk_1 = require("aws-sdk");
var chai_1 = require("chai");
var sinonHelper_1 = require("../sinonHelper");
describe('Domain', function () {
    describe('constructor', function () {
        var sandbox = sinonHelper_1.default();
        var config = new SWFConfig_1.SWFConfig();
        it('should set properties and create own SWF', function () {
            var domain = new entities_1.Domain('testDomain', config);
            chai_1.assert.equal(domain.name, 'testDomain');
            chai_1.assert.equal(domain.config, config);
            chai_1.assert(domain.swfClient != null);
            chai_1.assert.instanceOf(domain.swfClient, aws_sdk_1.SWF);
        });
        it('should use passed in SWF instance', function () {
            var mySwf = new aws_sdk_1.SWF();
            var domain = new entities_1.Domain('testDomain', config, mySwf);
            chai_1.assert.equal(domain.name, 'testDomain');
            chai_1.assert.equal(domain.config, config);
            chai_1.assert(domain.swfClient != null);
            chai_1.assert.equal(domain.swfClient, mySwf);
        });
    });
    describe('ensureDomain', function () {
        var sandbox = sinonHelper_1.default();
        var config = new SWFConfig_1.SWFConfig();
        it('should register the domain using defaults from config and overrides', function (done) {
            var domainParams = null;
            var swfMock = {
                registerDomain: function (params, cb) {
                    domainParams = params;
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
                .withArgs({ entities: ['domain'], api: 'registerDomain' }, { workflowExecutionRetentionPeriodInDays: 24 })
                .returns({ workflowExecutionRetentionPeriodInDays: 24 });
            var domain = new entities_1.Domain('test', config, swfMock);
            var swfSpy = sandbox.spy(swfMock, 'registerDomain');
            domain.ensureDomain({ workflowExecutionRetentionPeriodInDays: 24 }, function (err) {
                chai_1.assert.ifError(err);
                chai_1.assert.equal(swfSpy.callCount, 1);
                configMock.verify();
                chai_1.assert.deepEqual(domainParams, {
                    name: 'test',
                    workflowExecutionRetentionPeriodInDays: 24
                });
                done();
            });
        });
    });
    describe('getDefaultConfig', function () {
        it('should return a config', function () {
            chai_1.assert(entities_1.Domain.getDefaultConfig());
        });
    });
});
//# sourceMappingURL=DomainTest.js.map