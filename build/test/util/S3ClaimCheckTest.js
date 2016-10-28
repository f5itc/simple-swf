"use strict";
var chai_1 = require('chai');
var aws_sdk_1 = require('aws-sdk');
var util_1 = require('../../src/util');
var sinonHelper_1 = require('../sinonHelper');
describe('S3ClaimCheck', function () {
    describe('constructor', function () {
        it('should init properly and allowing passing a custom s3 client', function () {
            var sandbox = sinonHelper_1.default();
            var client = new aws_sdk_1.S3();
            var mockClient = sandbox.mock(client);
            var checker = new util_1.S3ClaimCheck('fake-bucket', 'some-prefix/', client);
            chai_1.assert(checker.s3Client != null);
        });
    });
    describe('buildCheck', function () {
        it('should make an s3 request we expect', function (done) {
            var sandbox = sinonHelper_1.default();
            var client = new aws_sdk_1.S3();
            var mockClient = sandbox.mock(client);
            var checker = new util_1.S3ClaimCheck('fake-bucket', 'some-prefix/', client);
            var callArgs = mockClient.expects('putObject').once().callsArgWithAsync(1, null).args;
            var input = 'some big long string here';
            checker.buildCheck(input, function (err, cc) {
                chai_1.assert.ifError(err);
                var claimCheck = JSON.parse(cc);
                var s3Params = callArgs[0][0];
                chai_1.assert.equal(s3Params.Bucket, 'fake-bucket');
                chai_1.assert.include(s3Params.Key, claimCheck.key);
                chai_1.assert.equal(s3Params.Body, input);
                mockClient.verify();
                done();
            });
        });
        it('should handle an error from s3', function (done) {
            var sandbox = sinonHelper_1.default();
            var client = new aws_sdk_1.S3();
            var mockClient = sandbox.mock(client);
            var checker = new util_1.S3ClaimCheck('fake-bucket', 'some-prefix/', client);
            mockClient.expects('putObject').once().callsArgWithAsync(1, new Error('on no'));
            checker.buildCheck('should fail', function (err, output) {
                chai_1.assert.typeOf(err, 'error');
                mockClient.verify();
                done();
            });
        });
    });
    describe('retriveCheck', function () {
        it('should retrieve a check from s3', function (done) {
            var sandbox = sinonHelper_1.default();
            var client = new aws_sdk_1.S3();
            var mockClient = sandbox.mock(client);
            var checker = new util_1.S3ClaimCheck('fake-bucket', 'some-prefix/', client);
            var callArgs = mockClient.expects('getObject').once().callsArgWithAsync(1, null, { Body: 'some claim check' }).args;
            var cc = {
                _claimCheck: true,
                key: 'some-prefix/thing',
                url: 's3://fake-bucket/some-prefix/thing'
            };
            checker.retriveCheck(cc, function (err, output) {
                chai_1.assert.ifError(err);
                chai_1.assert.equal(output, 'some claim check');
                var s3Params = callArgs[0][0];
                chai_1.assert.equal(s3Params.Bucket, 'fake-bucket');
                chai_1.assert.equal(s3Params.Key, cc.key);
                mockClient.verify();
                done();
            });
        });
        it('should an error from s3', function (done) {
            var sandbox = sinonHelper_1.default();
            var client = new aws_sdk_1.S3();
            var mockClient = sandbox.mock(client);
            var checker = new util_1.S3ClaimCheck('fake-bucket', 'some-prefix/', client);
            mockClient.expects('getObject').once().callsArgWithAsync(1, new Error('on no'));
            checker.retriveCheck({ _claimCheck: true, key: 'a key' }, function (err, output) {
                chai_1.assert.typeOf(err, 'error');
                mockClient.verify();
                done();
            });
        });
    });
});
//# sourceMappingURL=S3ClaimCheckTest.js.map