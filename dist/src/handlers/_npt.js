"use strict";
exports.__esModule = true;
var ts = require("typescript");
var _1 = require("./");
var utils_1 = require("../utils");
// Plural contextual translation
function translate(d) {
    return function (signatureItems, identInfo, comments) {
        var context = signatureItems[0], plurals = signatureItems[2], factor = signatureItems[4], _a = signatureItems[6], args = _a === void 0 ? null : _a;
        // Checks
        if (!context || context.kind !== ts.SyntaxKind.StringLiteral) {
            _1.panic('_npt: parameter #0 (context) should be a string literal', identInfo);
            return;
        }
        if (!factor || !utils_1.isValidQuantifier(factor)) {
            _1.panic('_npt: parameter #2 (factor) should be a numeric literal, value or expression', identInfo);
            return;
        }
        if (!plurals || plurals.kind !== ts.SyntaxKind.ArrayLiteralExpression) {
            _1.panic('_npt: parameter #1 (plurality strings) should be an array literal', identInfo);
            return;
        }
        var list = utils_1.getArrayListNode(plurals);
        if (!list) {
            _1.panic('_nt: parameter #0 (plurality strings) should be an array literal', identInfo);
            return;
        }
        var _b = utils_1.getArrayListElements(list), items = _b.items, strings = _b.strings;
        if (items.length !== strings.length) {
            _1.panic('_npt: parameter #1 (plurality strings) should contain only string literals', identInfo);
            return;
        }
        if (!utils_1.validatePluralPlaceholders(args, strings)) {
            // TODO check %n match also, what if %1 then %5 in string?
            _1.panic('_npt: optional arguments count mismatch', identInfo);
            return;
        }
        // All ok, add to dict
        var entry = {
            type: 'plural',
            entry: [strings[0], strings[strings.length - 1]],
            context: context.text,
            occurences: [],
            translations: [],
            comments: comments
        };
        var key = utils_1.makeKey(entry);
        utils_1.addToDict(d, key, entry, identInfo);
    };
}
exports.translate = translate;
