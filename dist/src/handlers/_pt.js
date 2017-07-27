"use strict";
exports.__esModule = true;
var ts = require("typescript");
var utils_1 = require("../utils");
var _1 = require("./");
// Contextual translation
function translate(d) {
    return function (signatureItems, identInfo, comments) {
        var context = signatureItems[0], tString = signatureItems[2], _a = signatureItems[4], args = _a === void 0 ? null : _a;
        // Checks
        if (!context || context.kind !== ts.SyntaxKind.StringLiteral) {
            _1.panic('_pt: parameter #0 (context) should be a string literal', identInfo);
            return;
        }
        if (!tString || tString.kind !== ts.SyntaxKind.StringLiteral) {
            _1.panic('_pt: parameter #1 (translated string) should be a string literal', identInfo);
            return;
        }
        if (!utils_1.validateSinglePlaceholder(args, tString)) {
            // TODO check %n match also, what if %1 then %5 in string?
            _1.panic('_pt: optional arguments count mismatch', identInfo);
            return;
        }
        // All ok, add to dict
        var entry = {
            type: 'single',
            entry: tString.text,
            context: context.text,
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
