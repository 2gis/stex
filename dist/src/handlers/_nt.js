"use strict";
exports.__esModule = true;
var ts = require("typescript");
var _1 = require("./");
var utils_1 = require("../utils");
// Plural translation
function translate(d) {
    return function (signatureItems, identInfo, comments) {
        var plurals = signatureItems[0], factor = signatureItems[2], _a = signatureItems[4], args = _a === void 0 ? null : _a;
        // Checks
        if (!factor || !utils_1.isValidQuantifier(factor)) {
            _1.panic('_nt: parameter #1 (factor) should be a numeric literal, value or expression', identInfo);
            return;
        }
        if (!plurals || plurals.kind !== ts.SyntaxKind.ArrayLiteralExpression) {
            _1.panic('_nt: parameter #0 (plurality strings) should be an array literal', identInfo);
            return;
        }
        var list = utils_1.getArrayListNode(plurals);
        if (!list) {
            _1.panic('_nt: parameter #0 (plurality strings) should be an array literal', identInfo);
            return;
        }
        var _b = utils_1.getArrayListElements(list), items = _b.items, strings = _b.strings;
        if (items.length !== strings.length) {
            _1.panic('_nt: parameter #0 (plurality strings) should contain only strings', identInfo);
            return;
        }
        if (!utils_1.validatePluralPlaceholders(args, strings)) {
            // TODO check %n match also, what if %1 then %5 in string?
            _1.panic('_nt: optional arguments count mismatch', identInfo);
            return;
        }
        // All ok, add to dict
        var entry = {
            type: 'plural',
            entry: strings,
            occurences: [identInfo],
            translations: [],
            comments: comments
        };
        var key = utils_1.makeKey(entry);
        if (d[key]) {
            d[key].comments = d[key].comments.concat(entry.comments)
                .filter(function (value, index, self) { return self.indexOf(value) === index; });
            d[key].occurences.push(identInfo);
        }
        else {
            d[key] = entry;
        }
    };
}
exports.translate = translate;
