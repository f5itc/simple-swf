"use strict";
var processEvents_1 = require('./processEvents');
var _ = require('lodash');
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
    EventRollup.prototype.getPendingEvents = function () {
        return {
            activity: _.filter(this.data.activity || [], { current: 'failed' }),
            workflow: _.filter(this.data.workflow || [], { current: 'failed' })
        };
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