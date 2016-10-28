"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var chai_1 = require('chai');
var crypto = require('crypto');
var util_1 = require('../../src/util');
var MockClaimCheck = (function (_super) {
    __extends(MockClaimCheck, _super);
    function MockClaimCheck() {
        _super.call(this);
        this.db = {};
    }
    MockClaimCheck.prototype.buildCheck = function (input, cb) {
        var hashed = crypto.createHash('sha1').update(input).digest('hex');
        this.db[hashed] = input;
        var ccObj = {
            _claimCheck: true,
            key: hashed
        };
        cb(null, JSON.stringify(ccObj));
    };
    MockClaimCheck.prototype.retriveCheck = function (input, cb) {
        var key = input.key;
        var ret = this.db[key];
        cb(null, ret);
    };
    return MockClaimCheck;
}(util_1.ClaimCheck));
describe('FieldSerializer', function () {
    describe('constructor', function () {
        var checker = new MockClaimCheck();
        it('sets some defaults', function () {
            var serializer = new util_1.FieldSerializer(checker);
            chai_1.assert.isArray(serializer.fields);
            chai_1.assert.typeOf(serializer.maxLength, 'number');
        });
        it('should allow us to set some overrides of fields', function () {
            var serializer = new util_1.FieldSerializer(checker, ['foo', 'bar'], { maxLength: 1000 });
            chai_1.assert.deepEqual(serializer.fields, ['foo', 'bar']);
            chai_1.assert.equal(serializer.maxLength, 1000);
        });
    });
    describe('serialize', function () {
        var checker = new MockClaimCheck();
        describe('should handle different types', function () {
            var serializer = new util_1.FieldSerializer(checker, null, { maxLength: 10 });
            it('like strings', function (done) {
                var input = '12345678910';
                serializer.serialize(input, function (err, checkObj) {
                    chai_1.assert.ifError(err);
                    var cc = JSON.parse(checkObj);
                    chai_1.assert(cc._claimCheck);
                    chai_1.assert.typeOf(cc.key, 'string');
                    chai_1.assert.equal(checker.db[cc.key], input);
                    done();
                });
            });
            it('like objects', function (done) {
                var input = { foobar: ['one', 'two', 'three'], coolStuff: 'anytime' };
                serializer.serialize(input, function (err, checkObj) {
                    chai_1.assert.ifError(err);
                    var cc = JSON.parse(checkObj);
                    chai_1.assert(cc._claimCheck);
                    chai_1.assert.typeOf(cc.key, 'string');
                    chai_1.assert.equal(checker.db[cc.key], JSON.stringify(input));
                    done();
                });
            });
            it('like anything else', function (done) {
                var input = 12345678900000000;
                serializer.serialize(input, function (err, checkObj) {
                    chai_1.assert.ifError(err);
                    var cc = JSON.parse(checkObj);
                    chai_1.assert(cc._claimCheck);
                    chai_1.assert.typeOf(cc.key, 'string');
                    chai_1.assert.equal(checker.db[cc.key], JSON.stringify(input));
                    done();
                });
            });
        });
        describe('should reclaim check if already a claim check', function () {
            var serializer = new util_1.FieldSerializer(checker, null, { maxLength: 10 });
            var cc = {
                _claimCheck: true,
                key: '12345678'
            };
            it('as an object', function (done) {
                serializer.serialize(cc, function (err, output) {
                    chai_1.assert.ifError(err);
                    var fullCC = JSON.parse(output);
                    chai_1.assert.equal(fullCC.key, cc.key);
                    chai_1.assert.isUndefined(checker.db[cc.key]);
                    done();
                });
            });
            it('as a string', function (done) {
                serializer.serialize(JSON.stringify(cc), function (err, output) {
                    chai_1.assert.ifError(err);
                    var fullCC = JSON.parse(output);
                    chai_1.assert.equal(fullCC.key, cc.key);
                    chai_1.assert.isUndefined(checker.db[cc.key]);
                    done();
                });
            });
        });
        describe('should only claim check if large enough', function () {
            var serializer = new util_1.FieldSerializer(checker, null, { maxLength: 100 });
            it('with strings', function (done) {
                serializer.serialize('hey guys', function (err, output) {
                    chai_1.assert.ifError(err);
                    chai_1.assert.equal(output, 'hey guys');
                    done();
                });
            });
            it('with objects', function (done) {
                serializer.serialize({ hey: 'guys' }, function (err, output) {
                    chai_1.assert.ifError(err);
                    chai_1.assert.equal(output, JSON.stringify({ hey: 'guys' }));
                    done();
                });
            });
        });
    });
    describe('serializeAll', function () {
        it('should serialize all fields specified if over length', function (done) {
            var checker = new MockClaimCheck();
            var serializer = new util_1.FieldSerializer(checker, ['foo', 'bar'], { maxLength: 10 });
            var input = {
                foo: '12345678910',
                bar: '123',
                baz: 'can be too long and be ok'
            };
            serializer.serializeAll(input, function (err, output) {
                chai_1.assert.ifError(err);
                chai_1.assert(JSON.parse(output.foo)._claimCheck);
                chai_1.assert.equal(output.bar, input.bar);
                chai_1.assert.equal(output.baz, input.baz);
                done();
            });
        });
    });
    describe('deserialize', function () {
        var checker = new MockClaimCheck();
        var serializer = new util_1.FieldSerializer(checker, ['foo', 'bar'], { maxLength: 10 });
        it('should handle nulls', function (done) {
            serializer.deserialize(null, function (err, output) {
                chai_1.assert.ifError(err);
                chai_1.assert(output == null);
                done();
            });
        });
        it('should handle fields that are not a claim check', function (done) {
            var t = {
                notACheck: true
            };
            serializer.deserialize(JSON.stringify(t), function (err, output) {
                chai_1.assert.ifError(err);
                chai_1.assert.deepEqual(output, t);
                done();
            });
        });
        it('should handle a claim check and hydrate it', function (done) {
            var input = {
                isAClaimCheck: true
            };
            var cc = {
                _claimCheck: true,
                key: 'isACheck'
            };
            checker.db[cc.key] = JSON.stringify(input);
            serializer.deserialize(JSON.stringify(cc), function (err, output) {
                chai_1.assert.ifError(err);
                chai_1.assert.deepEqual(output, input);
                done();
            });
        });
    });
    describe('deserializeSome', function () {
        it('should deserialize all fields specified and retrieve claim checks where applicable', function (done) {
            var checker = new MockClaimCheck();
            var serializer = new util_1.FieldSerializer(checker, ['foo', 'bar'], { maxLength: 10 });
            var foo = {
                hello: 'world',
                number: 123456789
            };
            checker.db['fooField'] = JSON.stringify(foo);
            var fooCheck = {
                _claimCheck: true,
                key: 'fooField'
            };
            var bar = {
                another: 'one',
                notA: 'claimCheck'
            };
            var baz = {
                shouldStay: 'an object'
            };
            var input = {
                foo: JSON.stringify(fooCheck),
                bar: JSON.stringify(bar),
                baz: baz
            };
            serializer.deserializeSome(['foo', 'bar'], input, function (err, output) {
                chai_1.assert.ifError(err);
                chai_1.assert.deepEqual(output, { foo: foo, bar: bar, baz: baz });
                done();
            });
        });
    });
    describe('deserializeAll', function () {
        it('should behave the same as deserializeSome, but uses args from constructor', function (done) {
            var checker = new MockClaimCheck();
            var serializer = new util_1.FieldSerializer(checker, ['foo', 'bar'], { maxLength: 10 });
            var foo = {
                hello: 'world',
                number: 123456789
            };
            checker.db['fooField'] = JSON.stringify(foo);
            var fooCheck = {
                _claimCheck: true,
                key: 'fooField'
            };
            var bar = {
                another: 'one',
                notA: 'claimCheck'
            };
            var baz = {
                shouldStay: 'an object'
            };
            var input = {
                foo: JSON.stringify(fooCheck),
                bar: JSON.stringify(bar),
                baz: baz
            };
            serializer.deserializeAll(input, function (err, output) {
                chai_1.assert.ifError(err);
                chai_1.assert.deepEqual(output, { foo: foo, bar: bar, baz: baz });
                done();
            });
        });
    });
});
//# sourceMappingURL=FieldSerializerTest.js.map