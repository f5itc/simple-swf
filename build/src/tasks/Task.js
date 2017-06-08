"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Task = (function () {
    function Task(workflow, rawTask) {
        this.workflow = workflow;
        this.rawTask = rawTask;
        this.swfClient = workflow.swfClient;
        this.config = workflow.config;
    }
    Task.prototype.getEventId = function () {
        return this.rawTask.startedEventId;
    };
    Task.prototype.getWorkflowInfo = function () {
        return this.rawTask.workflowExecution;
    };
    Task.prototype.getWorkflowId = function () {
        return this.rawTask.workflowExecution.workflowId;
    };
    return Task;
}());
exports.Task = Task;
//# sourceMappingURL=Task.js.map