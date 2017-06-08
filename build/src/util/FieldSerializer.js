"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var async = require("async");
// we can go to about 32k, but we cap it quite a bit smaller for reasons...
var DefaultLenLim = 10000;
exports.DefaultFields = ['input', 'control', 'reason', 'details', 'result'];
/**
 * we want to be able to pass around JSON objects but SWF
 * only really supports strings for most of its data fields
 * this class takes care of wrapping fields as well as claimChecking
 * fields that are above the max length
 */
var FieldSerializer = (function () {
    function FieldSerializer(claimChecker, fields, opts) {
        if (fields === void 0) { fields = exports.DefaultFields; }
        if (opts === void 0) { opts = {}; }
        this.fields = fields;
        this.claimChecker = claimChecker;
        this.maxLength = opts['maxLength'] || DefaultLenLim;
    }
    FieldSerializer.prototype.serializeAll = function (input, cb) {
        var _this = this;
        if (typeof input !== 'object')
            return this.serialize(input, cb);
        async.each(this.fields, function (fieldName, cb) {
            if (!input[fieldName])
                return process.nextTick(cb);
            _this.serialize(input[fieldName], function (err, serialized) {
                if (err)
                    return cb(err);
                input[fieldName] = serialized;
                cb();
            });
        }, function (err) {
            if (err)
                return cb(err, null);
            cb(null, input);
        });
    };
    FieldSerializer.prototype.serialize = function (input, cb) {
        var stringified = '';
        var isAlreadyCK = false;
        if (typeof input === 'object') {
            isAlreadyCK = this.claimChecker.isClaimCheck(input);
            stringified = JSON.stringify(input);
        }
        else if (typeof input === 'string') {
            isAlreadyCK = this.claimChecker.isClaimCheck(input);
            stringified = input;
        }
        else {
            stringified = input.toString();
        }
        if (!this.tooLong(stringified) || isAlreadyCK)
            return process.nextTick(function () { return cb(null, stringified); });
        this.claimChecker.buildCheck(stringified, cb);
    };
    FieldSerializer.prototype.deserializeAll = function (input, cb) {
        this.deserializeSome(this.fields, input, cb);
    };
    FieldSerializer.prototype.deserializeSome = function (fields, input, cb) {
        var _this = this;
        async.each(fields, function (fieldName, cb) {
            if (!input[fieldName])
                return process.nextTick(cb);
            _this.deserialize(input[fieldName], function (err, deserialized) {
                if (err)
                    return cb(err);
                input[fieldName] = deserialized;
                cb();
            });
        }, function (err) {
            if (err)
                return cb(err, null);
            cb(null, input);
        });
    };
    FieldSerializer.prototype.deserialize = function (input, cb) {
        var parsed = null;
        if (!input)
            return cb();
        try {
            parsed = JSON.parse(input);
        }
        catch (e) {
            // ignore if error, assume a string body
            return cb(null, parsed);
        }
        if (!this.claimChecker.isClaimCheck(parsed))
            return cb(null, parsed);
        this.claimChecker.retriveCheck(parsed, function (err, res) {
            if (err)
                return cb(err, null);
            var parsed;
            try {
                parsed = JSON.parse(res);
            }
            catch (e) {
                parsed = res;
            }
            cb(null, parsed);
        });
    };
    FieldSerializer.prototype.tooLong = function (field) {
        return field.length > this.maxLength;
    };
    return FieldSerializer;
}());
exports.FieldSerializer = FieldSerializer;
//# sourceMappingURL=FieldSerializer.js.map