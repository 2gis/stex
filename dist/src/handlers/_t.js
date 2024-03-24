"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.translate = void 0;
var tslib_1 = require("tslib");
var ts = tslib_1.__importStar(require("typescript"));
var utils_1 = require("../utils");
var _1 = require("./");
// Simple translation
function translate(d) {
    return function (signatureItems, identInfo, comments) {
        var tString = signatureItems[0], _a = signatureItems[2], args = _a === void 0 ? null : _a;
        // Checks
        if (tString.kind != ts.SyntaxKind.StringLiteral) {
            (0, _1.panic)('_t: parameter #0 should be a string literal', identInfo);
            return;
        }
        if (!(0, utils_1.validateSinglePlaceholder)(args, tString)) {
            (0, _1.panic)('_t: optional arguments count mismatch', identInfo);
            return;
        }
        // All ok, add to dict
        var entry = {
            type: 'single',
            entry: tString.text,
            occurences: [], // will be filled within addToDict
            comments: comments
        };
        var key = (0, utils_1.makeKey)(entry);
        (0, utils_1.addToDict)(d, key, entry, identInfo);
    };
}
exports.translate = translate;
//# sourceMappingURL=_t.js.map