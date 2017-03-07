"use strict";
var SWFConfig_1 = require('../SWFConfig');
var Decider = (function () {
    function Decider(workflow) {
        this.workflow = workflow;
        this.config = workflow.config;
        this.swfClient = workflow.swfClient;
    }
    Decider.getDefaultConfig = function () {
        return {
            startToCloseTimeout: {
                description: 'The maximum amount of time a decision task can take to complete. 0 or NONE inidcate no limit',
                mappings: [
                    { api: 'startWorkflowExecution', name: 'taskStartToCloseTimeout' },
                    { api: 'registerWorkflowType', name: 'defaultTaskStartToCloseTimeout' },
                    { api: 'respondDecisionTaskCompleted', attribute: 'continueAsNewWorkflowExecutionDecisionAttributes', name: 'taskStartToCloseTimeout' },
                    { api: 'respondDecisionTaskCompleted', attribute: 'startChildWorkflowExecutionDecisionAttributes', name: 'taskStartToCloseTimeout' }
                ],
                value: 120,
                unit: SWFConfig_1.ConfigDefaultUnit.Second,
            },
            taskList: {
                description: 'Specifies the taskList name for a specific decision, see SWF docs for more stails',
                mappings: [
                    { api: 'pollForDecisionTask', name: 'taskList' }
                ],
                value: 'simple-swf',
                format: function (name) {
                    return { name: name };
                },
                unit: SWFConfig_1.ConfigDefaultUnit.String
            }
        };
    };
    return Decider;
}());
exports.Decider = Decider;
//# sourceMappingURL=Decider.js.map