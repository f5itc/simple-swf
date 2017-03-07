"use strict";
var ClaimCheck = (function () {
    function ClaimCheck() {
    }
    ClaimCheck.prototype.isClaimCheck = function (input) {
        if (typeof input === 'string') {
            try {
                input = JSON.parse(input);
            }
            catch (e) {
                return false;
            }
        }
        return input && input._claimCheck && input.key;
    };
    return ClaimCheck;
}());
exports.ClaimCheck = ClaimCheck;
//# sourceMappingURL=ClaimCheck.js.map