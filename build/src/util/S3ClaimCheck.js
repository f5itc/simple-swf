"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var aws_sdk_1 = require('aws-sdk');
var crypto = require('crypto');
var path = require('path');
var ClaimCheck_1 = require('./ClaimCheck');
var S3ClaimCheck = (function (_super) {
    __extends(S3ClaimCheck, _super);
    function S3ClaimCheck(bucketName, prefix, s3Client) {
        if (s3Client === void 0) { s3Client = new aws_sdk_1.S3(); }
        _super.call(this);
        this.bucketName = bucketName;
        this.prefix = prefix;
        this.s3Client = s3Client;
    }
    S3ClaimCheck.prototype.buildCheck = function (input, cb) {
        var hashed = crypto.createHash('sha1').update(input).digest('hex');
        var key = path.join(this.prefix, hashed);
        var url = "s3://" + this.bucketName + "/" + key;
        this.s3Client.putObject({ Bucket: this.bucketName, Key: key, Body: input }, function (err) {
            if (err)
                return cb(err, '');
            var check = {
                _claimCheck: true, key: key, url: url
            };
            cb(null, JSON.stringify(check));
        });
    };
    S3ClaimCheck.prototype.retriveCheck = function (input, cb) {
        this.s3Client.getObject({ Bucket: this.bucketName, Key: input.key }, function (err, res) {
            if (err)
                return cb(err, '');
            var body = res.Body;
            if (Buffer.isBuffer(body)) {
                body = body.toString('utf8');
            }
            cb(null, body);
        });
    };
    return S3ClaimCheck;
}(ClaimCheck_1.ClaimCheck));
exports.S3ClaimCheck = S3ClaimCheck;
//# sourceMappingURL=S3ClaimCheck.js.map