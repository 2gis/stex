"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.translate = void 0;
var tslib_1 = require("tslib");
var ts = tslib_1.__importStar(require("typescript"));
var utils_1 = require("../utils");
var _1 = require("./");
// Contextual translation
function translate(d) {
    return function (signatureItems, identInfo, comments) {
        var context = signatureItems[0], tString = signatureItems[2], _a = signatureItems[4], args = _a === void 0 ? null : _a;
        // Checks
        if (!context || context.kind !== ts.SyntaxKind.StringLiteral) {
            (0, _1.panic)('_pt: parameter #0 (context) should be a string literal', identInfo);
            return;
        }
        if (!tString || tString.kind !== ts.SyntaxKind.StringLiteral) {
            (0, _1.panic)('_pt: parameter #1 (translated string) should be a string literal', identInfo);
            return;
        }
        if (!(0, utils_1.validateSinglePlaceholder)(args, tString)) {
            // TODO check %n match also, what if %1 then %5 in string?
            (0, _1.panic)('_pt: optional arguments count mismatch', identInfo);
            return;
        }
        // All ok, add to dict
        var entry = {
            type: 'single',
            entry: tString.text,
            context: context.text,
            occurences: [], // will be filled within addToDict
            comments: comments
        };
        var key = (0, utils_1.makeKey)(entry);
        (0, utils_1.addToDict)(d, key, entry, identInfo);
    };
}
exports.translate = translate;
//# sourceMappingURL=_pt.js.map