"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ActivityTypeInfo = (function () {
    function ActivityTypeInfo(name, version) {
        this.name = name;
        this.version = version;
        this.domainScope = {};
    }
    ActivityTypeInfo.prototype.describeActivityType = function (domain, cb) {
        domain.swfClient.describeActivityType({ domain: domain.name, activityType: { name: this.name, version: this.version } }, cb);
    };
    ActivityTypeInfo.prototype.deprecateActivityType = function (domain, cb) {
        domain.swfClient.deprecateActivityType({ domain: domain.name, activityType: { name: this.name, version: this.version } }, cb);
    };
    ActivityTypeInfo.prototype.toJSON = function () {
        return {
            activityType: {
                name: this.name,
                version: this.version
            },
            domainScopes: this.domainScope
        };
    };
    return ActivityTypeInfo;
}());
exports.ActivityTypeInfo = ActivityTypeInfo;
//# sourceMappingURL=ActivityTypeInfo.js.map