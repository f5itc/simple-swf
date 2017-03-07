"use strict";
var _1 = require('./');
var EventDeserializer = (function () {
    function EventDeserializer(eventsToDeserialize, fieldSerializer) {
        if (typeof eventsToDeserialize === 'object') {
            this.eventsToDeserialize = eventsToDeserialize;
            this.deserializeAll = false;
        }
        else {
            this.eventsToDeserialize = {};
            this.deserializeAll = true;
        }
        this.eventsToDeserialize = this.eventsToDeserialize || {};
        this.fieldSerializer = fieldSerializer;
    }
    EventDeserializer.prototype.deserializeEvent = function (event, cb) {
        if (!this.eventsToDeserialize[event.eventType] && !this.deserializeAll)
            return process.nextTick(function () { return cb(null, event); });
        var attrName = _1.EventTypeAttributeMap[event.eventType];
        if (!attrName)
            return cb(new Error('cannot find attributes for event ' + event.eventType), null);
        this.fieldSerializer.deserializeAll(event[attrName], function (err, des) {
            if (err)
                return cb(err, null);
            event[attrName] = des;
            cb(null, event);
        });
    };
    return EventDeserializer;
}());
exports.EventDeserializer = EventDeserializer;
//# sourceMappingURL=EventDeserializer.js.map