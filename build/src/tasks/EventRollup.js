"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var processEvents_1 = require("./processEvents");
var _ = require("lodash");
var EventRollup = (function () {
    function EventRollup(rawTask, workflowEnv) {
        this.data = processEvents_1.processEvents(rawTask.events);
        this.env = this.buildEnv(workflowEnv || {}, this.data.completed);
    }
    EventRollup.prototype.getTimedOutEvents = function () {
        return {
            activity: _.filter(this.data.activity || [], { current: 'timedOut' }),
            workflow: _.filter(this.data.workflow || [], { current: 'timedOut' })
        };
    };
    EventRollup.prototype.getFailedEvents = function () {
        return {
            activity: _.filter(this.data.activity || [], { current: 'failed' }),
            workflow: _.filter(this.data.workflow || [], { current: 'failed' })
        };
    };
    EventRollup.prototype.getRetryableFailedToScheduleEvents = function () {
        var activity = _.filter(this.data.activity || [], function (event) {
            if (event.current !== 'failedToSchedule') {
                return false;
            }
            else {
                var retryableCauses = [
                    'OPEN_ACTIVITIES_LIMIT_EXCEEDED',
                    'ACTIVITY_CREATION_RATE_EXCEEDED'
                ];
                return retryableCauses.indexOf(event.failedToSchedule.scheduleActivityTaskFailedEventAttributes.cause) > -1;
            }
        });
        var workflow = _.filter(this.data.workflow || [], function (event) {
            if (event.current !== 'failedToSchedule') {
                return false;
            }
            else {
                var retryableCauses = [
                    'OPEN_WORKFLOWS_LIMIT_EXCEEDED',
                    'OPEN_CHILDREN_LIMIT_EXCEEDED',
                    'CHILD_CREATION_RATE_EXCEEDED'
                ];
                return retryableCauses.indexOf(event.failedToSchedule.startChildWorkflowExecutionFailedEventAttributes.cause) > -1;
            }
        });
        if (!activity.length && !workflow.length) {
            return false;
        }
        return { activity: activity, workflow: workflow };
    };
    EventRollup.prototype.buildEnv = function (currentEnv, completed) {
        if (!completed)
            return currentEnv;
        for (var _i = 0, completed_1 = completed; _i < completed_1.length; _i++) {
            var event_1 = completed_1[_i];
            if (event_1.state && event_1.state.result && event_1.state.result.env && typeof event_1.state.result.env === 'object') {
                currentEnv = _.merge(currentEnv || {}, event_1.state.result.env || {});
            }
        }
        return currentEnv;
    };
    return EventRollup;
}());
exports.EventRollup = EventRollup;
//# sourceMappingURL=EventRollup.js.map