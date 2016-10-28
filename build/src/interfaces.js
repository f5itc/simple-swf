"use strict";
(function (StopReasons) {
    StopReasons[StopReasons["ProcessExit"] = 0] = "ProcessExit";
    StopReasons[StopReasons["WorkflowCancel"] = 1] = "WorkflowCancel";
    StopReasons[StopReasons["HeartbeatCancel"] = 2] = "HeartbeatCancel";
    StopReasons[StopReasons["UnknownResource"] = 3] = "UnknownResource";
})(exports.StopReasons || (exports.StopReasons = {}));
var StopReasons = exports.StopReasons;
exports.UnknownResourceFault = 'UnknownResourceFault';
exports.TypeExistsFault = 'TypeAlreadyExistsFault';
exports.DomainExistsFaults = 'DomainAlreadyExistsFault';
//# sourceMappingURL=interfaces.js.map