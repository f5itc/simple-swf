"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var entities_1 = require('../../src/entities');
var SWFConfig_1 = require('../../src/SWFConfig');
var chai_1 = require('chai');
var sinonHelper_1 = require('../sinonHelper');
var DeciderMock = (function (_super) {
    __extends(DeciderMock, _super);
    function DeciderMock() {
        _super.apply(this, arguments);
    }
    DeciderMock.prototype.makeDecisions = function (task, cb) {
        if (this.onDecision)
            this.onDecision(task);
        cb(null, task);
    };
    return DeciderMock;
}(entities_1.Decider));
describe('Decider', function () {
    describe('contructor', function () {
        var sandbox = sinonHelper_1.default();
        var workflow = sandbox.stubClass(entities_1.Workflow);
        it('inits the properties', function () {
            workflow.swfClient = {};
            workflow.config = new SWFConfig_1.SWFConfig();
            var decider = new DeciderMock(workflow);
            chai_1.assert.equal(decider.workflow, workflow);
            chai_1.assert.equal(decider.config, workflow.config);
            chai_1.assert.equal(decider.swfClient, workflow.swfClient);
        });
    });
    describe('getDefaultConfig', function () {
        it('should return a config', function () {
            chai_1.assert(entities_1.Decider.getDefaultConfig());
        });
    });
});
//# sourceMappingURL=DeciderTest.js.map