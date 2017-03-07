"use strict";
var os = require('os');
var shortId = require('shortid');
function buildIdentity(prefix) {
    return [prefix, os.hostname(), process.pid, shortId.generate()].join('-');
}
exports.buildIdentity = buildIdentity;
//# sourceMappingURL=buildIdentity.js.map