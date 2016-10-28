"use strict";
var chai_1 = require('chai');
var SWFConfig_1 = require('../src/SWFConfig');
var entities_1 = require('../src/entities');
describe('SWFConfig', function () {
    describe('constructor', function () {
        var config = new SWFConfig_1.SWFConfig();
        it('should set merged defaults', function () {
            chai_1.assert.equal(config.defaults['activity']['heartbeatTimeout'].value, 120);
        });
        var overriden = new SWFConfig_1.SWFConfig({ activity: { startToCloseTimeout: 20 } });
        it('should set merged defaults with overrides', function () {
            chai_1.assert.equal(overriden.defaults['activity']['startToCloseTimeout'].value, 20);
            chai_1.assert.notEqual(overriden.defaults['workflow']['startToCloseTimeout'].value, 20);
        });
    });
    describe('applyOverrideConfig', function () {
        var config = new SWFConfig_1.SWFConfig();
        it('should override values correctly', function () {
            var group = config.applyOverrideConfig(entities_1.Domain.getDefaultConfig(), { description: 'new desc' });
            chai_1.assert.equal(group['description'].value, 'new desc');
        });
        it('should add new values correctly', function () {
            var group = config.applyOverrideConfig(entities_1.Domain.getDefaultConfig(), { myValue: 'new desc', numValue: 0 });
            chai_1.assert.equal(group['myValue'].value, 'new desc');
            chai_1.assert.equal(group['myValue'].unit, SWFConfig_1.ConfigDefaultUnit.String);
            chai_1.assert.equal(group['numValue'].unit, SWFConfig_1.ConfigDefaultUnit.Number);
            chai_1.assert.equal(group['numValue'].value, 0);
        });
    });
    describe('getParamsForApi', function () {
        var config = new SWFConfig_1.SWFConfig();
        it('should grab the config values', function () {
            var configVals = config.getParamsForApi({
                entities: ['activity'],
                api: 'respondDecisionTaskCompleted',
                attribute: 'scheduleActivityTaskDecisionAttributes'
            });
            chai_1.assert.typeOf(configVals['heartbeatTimeout'].value, 'number');
            chai_1.assert.equal(configVals['startToCloseTimeout'].value, 'NONE');
            chai_1.assert(configVals['description'] == null);
        });
        it('should reduce to only the single mapping ask for', function () {
            var configVals = config.getParamsForApi({ entities: ['activity'], api: 'registerActivityType' });
            chai_1.assert.equal(configVals['startToCloseTimeout'].mappings.length, 1);
            chai_1.assert.equal(configVals['startToCloseTimeout'].mappings[0].api, 'registerActivityType');
        });
        it('should return an empty config group for invalid configs', function () {
            var configVals = config.getParamsForApi({ entities: ['activity'], api: 'fakeApi' });
            chai_1.assert.deepEqual(configVals, {});
        });
        it('should handle an invalid entity by return empty config', function () {
            var configVals = config.getParamsForApi({ entities: ['marker'], api: 'fakeApi' });
            chai_1.assert.deepEqual(configVals, {});
        });
    });
    describe('getMappingName', function () {
        var config = new SWFConfig_1.SWFConfig();
        it('should return the proper name of a config', function () {
            var decActName = config.getMappingName('heartbeatTimeout', {
                entities: ['activity'],
                api: 'respondDecisionTaskCompleted',
                attribute: 'scheduleActivityTaskDecisionAttributes'
            });
            chai_1.assert.equal(decActName, 'heartbeatTimeout');
            var regActName = config.getMappingName('heartbeatTimeout', { entities: ['activity'], api: 'registerActivityType' });
            chai_1.assert.equal(regActName, 'defaultTaskHeartbeatTimeout');
        });
        it('should null if invalid api', function () {
            var badApi = config.getMappingName('heartbeatTimeout', { entities: ['activity'], api: 'noApi' });
            chai_1.assert.isNull(badApi);
            var badConfig = config.getMappingName('fakeConfig', { entities: ['activity'], api: 'registerActivityType' });
            chai_1.assert.isNull(badConfig);
            //valid entity type, but no config.. good enough for now
            var badEntity = config.getMappingName('heartbeatTimeout', { entities: ['marker'], api: 'registerActivityType' });
            chai_1.assert.isNull(badEntity);
        });
    });
    describe('populateDefaults', function () {
        var config = new SWFConfig_1.SWFConfig();
        it('should populate values for a given api', function () {
            var registerActivityVals = config.populateDefaults({ entities: ['activity'], api: 'registerActivityType' });
            chai_1.assert.equal(registerActivityVals['defaultTaskHeartbeatTimeout'], '120', 'should be a string');
            // strip out values that default to null
            chai_1.assert.isUndefined(registerActivityVals['description']);
        });
        it('should properly use the format function', function () {
            var registerActivityVals = config.populateDefaults({ entities: ['workflow'], api: 'registerWorkflowType' });
            chai_1.assert.deepEqual(registerActivityVals['defaultTaskList'], { name: 'simple-swf' });
        });
        it('should properly use overrides', function () {
            var overrides = { taskList: 'hello', startToCloseTimeout: 100 };
            var registerActivityVals = config.populateDefaults({ entities: ['workflow'], api: 'registerWorkflowType' }, overrides);
            chai_1.assert.deepEqual(registerActivityVals['defaultTaskList'], { name: 'hello' });
            chai_1.assert.deepEqual(registerActivityVals['defaultExecutionStartToCloseTimeout'], '100');
        });
    });
    describe('getValueForParam', function () {
        var config = new SWFConfig_1.SWFConfig();
        it('should return the value for entity and param', function () {
            chai_1.assert.equal(config.getValueForParam('activity', 'heartbeatTimeout'), 120);
        });
        it('should handle missing stuff', function () {
            chai_1.assert.isNull(config.getValueForParam('marker', 'heartbeatTimeout'));
            chai_1.assert.isNull(config.getValueForParam('marker', 'fake'));
        });
    });
});
//# sourceMappingURL=SWFConfigTest.js.map