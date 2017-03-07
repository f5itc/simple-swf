"use strict";
// a holder for all the different config options with sane defaults
var Domain_1 = require('./entities/Domain');
var Workflow_1 = require('./entities/Workflow');
var Decider_1 = require('./entities/Decider');
var ActivityType_1 = require('./entities/ActivityType');
var _ = require('lodash');
(function (ConfigDefaultUnit) {
    ConfigDefaultUnit[ConfigDefaultUnit["Second"] = 0] = "Second";
    ConfigDefaultUnit[ConfigDefaultUnit["Day"] = 1] = "Day";
    ConfigDefaultUnit[ConfigDefaultUnit["Enum"] = 2] = "Enum";
    ConfigDefaultUnit[ConfigDefaultUnit["String"] = 3] = "String";
    ConfigDefaultUnit[ConfigDefaultUnit["Number"] = 4] = "Number";
})(exports.ConfigDefaultUnit || (exports.ConfigDefaultUnit = {}));
var ConfigDefaultUnit = exports.ConfigDefaultUnit;
var SWFConfig = (function () {
    function SWFConfig(overrideConfig) {
        overrideConfig = overrideConfig || {};
        var domainConfig = this.applyOverrideConfig(Domain_1.Domain.getDefaultConfig(), overrideConfig.domain || {});
        var workflowConfig = this.applyOverrideConfig(Workflow_1.Workflow.getDefaultConfig(), overrideConfig.workflow || {});
        var activityConfig = this.applyOverrideConfig(ActivityType_1.ActivityType.getDefaultConfig(), overrideConfig.activity || {});
        var deciderConfig = this.applyOverrideConfig(Decider_1.Decider.getDefaultConfig(), overrideConfig.decision || {});
        this.defaults = {
            domain: domainConfig,
            workflow: workflowConfig,
            activity: activityConfig,
            decision: deciderConfig
        };
    }
    SWFConfig.prototype.getValueUnit = function (unit) {
        if (typeof unit === 'string')
            return ConfigDefaultUnit.String;
        if (typeof unit === 'number')
            return ConfigDefaultUnit.Number;
        return ConfigDefaultUnit.String;
    };
    SWFConfig.prototype.applyOverrideConfig = function (defaultConfig, overrides) {
        if (overrides === void 0) { overrides = {}; }
        for (var keyName in overrides) {
            var override = overrides[keyName];
            var emptyMapping = [];
            var defaultUnit = this.getValueUnit(override);
            if (!defaultConfig[keyName]) {
                defaultConfig[keyName] = {
                    description: 'Unkown',
                    mappings: emptyMapping,
                    value: override,
                    unit: defaultUnit
                };
            }
            else {
                defaultConfig[keyName].value = override;
            }
        }
        return defaultConfig;
    };
    SWFConfig.prototype.getParamsForApi = function (forApi) {
        var _this = this;
        var mappedGroup = forApi.entities.reduce(function (configGroup, entity) {
            var singleGroup = _.mapValues(_this.defaults[entity] || {}, function (configVal) {
                var newConfigVal = _.clone(configVal);
                newConfigVal.mappings = configVal.mappings.filter(function (mapping) {
                    return _this.isCorrectMapping(forApi, mapping);
                });
                return newConfigVal;
            });
            return _.merge(configGroup, singleGroup);
        }, {});
        var configGroup = {};
        for (var keyName in mappedGroup) {
            if (mappedGroup[keyName].mappings.length) {
                configGroup[keyName] = mappedGroup[keyName];
            }
        }
        return configGroup;
    };
    SWFConfig.prototype.getValueForParam = function (entity, paramName) {
        if (!this.defaults[entity] || !this.defaults[entity][paramName])
            return null;
        return this.defaults[entity][paramName].value;
    };
    SWFConfig.prototype.isCorrectMapping = function (forApi, mapping) {
        return forApi.api === mapping.api && forApi.attribute === mapping.attribute;
    };
    SWFConfig.prototype.getMappingName = function (paramName, forApi) {
        var _this = this;
        var possibleVals = forApi.entities.map(function (entity) {
            if (!_this.defaults[entity] || !_this.defaults[entity][paramName])
                return null;
            var mapping = _.find(_this.defaults[entity][paramName].mappings, function (mapping) {
                return _this.isCorrectMapping(forApi, mapping);
            });
            if (!mapping)
                return null;
            return mapping.name;
        }).filter(function (v) { return !!v; });
        if (possibleVals.length === 0)
            return null;
        return possibleVals[0];
    };
    SWFConfig.prototype.populateDefaults = function (forApi, opts) {
        if (opts === void 0) { opts = {}; }
        opts = opts || {};
        var configVals = this.getParamsForApi(forApi);
        var mappedValues = Object.keys(configVals).map(function (keyName) {
            var configVal = configVals[keyName];
            var val = opts[keyName] || configVal.value;
            if (!configVal.format && val == null)
                return null;
            if (!configVal.format)
                return val.toString();
            return configVal.format(val);
        });
        var allValues = _.zipObject(Object.keys(configVals), mappedValues);
        var defaults = {};
        for (var keyName in configVals) {
            if (!allValues[keyName])
                continue;
            defaults[configVals[keyName].mappings[0].name] = allValues[keyName];
        }
        return defaults;
    };
    return SWFConfig;
}());
exports.SWFConfig = SWFConfig;
//# sourceMappingURL=SWFConfig.js.map