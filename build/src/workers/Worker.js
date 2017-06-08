"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var events_1 = require("events");
var PollingStates;
(function (PollingStates) {
    PollingStates[PollingStates["Stopped"] = 0] = "Stopped";
    PollingStates[PollingStates["Started"] = 1] = "Started";
    PollingStates[PollingStates["ShouldStop"] = 2] = "ShouldStop";
})(PollingStates || (PollingStates = {}));
var Worker = (function (_super) {
    __extends(Worker, _super);
    function Worker(workflow, identity) {
        var _this = _super.call(this) || this;
        _this.workflow = workflow;
        _this.identity = identity;
        return _this;
    }
    Worker.prototype._start = function () {
        this.pollingState = PollingStates.Started;
        this.loop();
    };
    Worker.prototype._stop = function (cb) {
        var _this = this;
        this.pollingState = PollingStates.ShouldStop;
        if (!this.currentRequest) {
            this.pollingState = PollingStates.Stopped;
            return cb();
        }
        this.currentRequest.on('error', function (err) {
            _this.pollingState = PollingStates.Stopped;
            _this.currentRequest = null;
            // ignore this error, its always going to be aborted by user
            cb();
        });
        this.currentRequest.abort();
        this.currentRequest = null;
    };
    Worker.prototype.loop = function () {
        var _this = this;
        if (this.pollingState === PollingStates.ShouldStop || this.pollingState === PollingStates.Stopped)
            return;
        var req = this.buildApiRequest();
        this.currentRequest = req;
        this.emit('poll', req);
        this.sendRequest(req, function (err, data) {
            if (_this.pollingState === PollingStates.ShouldStop || _this.pollingState === PollingStates.Stopped)
                return;
            if (err) {
                _this.emit('error', err);
                var toContinue = _this.handleError(err);
                if (!toContinue)
                    return;
                return _this.loop();
            }
            // didn't get any work, poll again
            if (!data || !data.taskToken)
                return _this.loop();
            _this.wrapTask(_this.workflow, data, function (err, task) {
                if (err) {
                    console.log('here?');
                    _this.emit('error', err);
                    var toContinue = _this.handleError(err);
                    if (!toContinue)
                        return;
                    return _this.loop();
                }
                task = task;
                _this.emit('task', task);
                _this.performTask(task);
                _this.loop();
            });
        });
    };
    Worker.prototype.sendRequest = function (req, cb) {
        req.send(cb);
    };
    return Worker;
}(events_1.EventEmitter));
exports.Worker = Worker;
//# sourceMappingURL=Worker.js.map