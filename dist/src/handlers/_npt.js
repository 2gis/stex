"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.translate = void 0;
var tslib_1 = require("tslib");
var ts = tslib_1.__importStar(require("typescript"));
var _1 = require("./");
var utils_1 = require("../utils");
// Plural contextual translation
function translate(d) {
    return function (signatureItems, identInfo, comments) {
        var context = signatureItems[0], plurals = signatureItems[2], factor = signatureItems[4], _a = signatureItems[6], args = _a === void 0 ? null : _a;
        // Checks
        if (!context || context.kind !== ts.SyntaxKind.StringLiteral) {
            (0, _1.panic)('_npt: parameter #0 (context) should be a string literal', identInfo);
            return;
        }
        if (!factor || !(0, utils_1.isValidQuantifier)(factor)) {
            (0, _1.panic)('_npt: parameter #2 (factor) should be a numeric literal, value or expression', identInfo);
            return;
        }
        if (!plurals || plurals.kind !== ts.SyntaxKind.ArrayLiteralExpression) {
            (0, _1.panic)('_npt: parameter #1 (plurality strings) should be an array literal', identInfo);
            return;
        }
        var list = (0, utils_1.getArrayListNode)(plurals);
        if (!list) {
            (0, _1.panic)('_nt: parameter #0 (plurality strings) should be an array literal', identInfo);
            return;
        }
        var _b = (0, utils_1.getArrayListElements)(list), items = _b.items, strings = _b.strings;
        if (items.length !== strings.length) {
            (0, _1.panic)('_npt: parameter #1 (plurality strings) should contain only string literals', identInfo);
            return;
        }
        if (!(0, utils_1.validatePluralPlaceholders)(args, strings)) {
            // TODO check %n match also, what if %1 then %5 in string?
            (0, _1.panic)('_npt: optional arguments count mismatch', identInfo);
            return;
        }
        // All ok, add to dict
        var entry = {
            type: 'plural',
            entry: [strings[0], strings[strings.length - 1]], // plural entries are identified by first and last forms
            context: context.text,
            occurences: [], // will be filled within addToDict
            translations: [],
            comments: comments
        };
        var key = (0, utils_1.makeKey)(entry);
        (0, utils_1.addToDict)(d, key, entry, identInfo);
    };
}
exports.translate = translate;
//# sourceMappingURL=_npt.js.map