"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addToDict = exports.validateSinglePlaceholder = exports.validatePluralPlaceholders = exports.getArrayListElements = exports.getArrayListNode = exports.isValidQuantifier = exports.filterArgs = exports.makeKey = void 0;
var tslib_1 = require("tslib");
var ts = tslib_1.__importStar(require("typescript"));
var FIELD_KEY = '^$';
function makeKey(e) {
    if (e.type === 'single') {
        return e.entry
            + (e.context ? FIELD_KEY + e.context : '');
    }
    if (e.type === 'plural') {
        return e.entry.join(FIELD_KEY)
            + (e.context ? FIELD_KEY + e.context : '');
    }
    throw new Error('i18n entry type not found');
}
exports.makeKey = makeKey;
function filterArgs(args) {
    // console.log(args.map((a) => a.kind).join(',')); // debug
    return args.filter(function (a) { return a.kind === ts.SyntaxKind.StringLiteral || isValidQuantifier(a); });
}
exports.filterArgs = filterArgs;
function isValidQuantifier(node) {
    return [
        ts.SyntaxKind.NumericLiteral,
        ts.SyntaxKind.Identifier,
        ts.SyntaxKind.ExpressionStatement,
        ts.SyntaxKind.PostfixUnaryExpression,
        ts.SyntaxKind.PrefixUnaryExpression,
        ts.SyntaxKind.BinaryExpression,
        ts.SyntaxKind.CallExpression,
        ts.SyntaxKind.PropertyAccessExpression,
        ts.SyntaxKind.ElementAccessExpression,
        ts.SyntaxKind.ConditionalExpression
    ].includes(node.kind);
}
exports.isValidQuantifier = isValidQuantifier;
function getArrayListNode(node) {
    return node.getChildren().reduce(function (acc, val) {
        if (val.kind !== ts.SyntaxKind.SyntaxList || acc) {
            return acc;
        }
        return val;
    }, null);
}
exports.getArrayListNode = getArrayListNode;
function getArrayListElements(node) {
    var items = node.getChildren().filter(function (c) { return c.kind !== ts.SyntaxKind.CommaToken; });
    var strings = items
        .filter(function (c) { return c.kind === ts.SyntaxKind.StringLiteral; })
        .map(function (c) { return c.text; });
    return { items: items, strings: strings };
}
exports.getArrayListElements = getArrayListElements;
function validatePluralPlaceholders(args, strings) {
    var _a;
    var argList = args ? getArrayListNode(args) : null;
    var argIdents = argList ? filterArgs(argList.getChildren()) : [];
    var argPlaceholders = {};
    for (var _i = 0, strings_1 = strings; _i < strings_1.length; _i++) {
        var sl = strings_1[_i];
        ((_a = sl.match(/(%\d)/g)) !== null && _a !== void 0 ? _a : []).forEach(function (i) {
            argPlaceholders[i] = true;
        });
    }
    return argIdents.length === Object.keys(argPlaceholders).length;
}
exports.validatePluralPlaceholders = validatePluralPlaceholders;
function validateSinglePlaceholder(args, tString) {
    var _a;
    var argList = args ? getArrayListNode(args) : null;
    var argIdents = argList ? filterArgs(argList.getChildren()) : [];
    var argPlaceholders = (_a = tString.text.match(/(%\d)/g)) !== null && _a !== void 0 ? _a : [];
    return argIdents.length === argPlaceholders.length;
}
exports.validateSinglePlaceholder = validateSinglePlaceholder;
function addToDict(d, key, entry, occurence) {
    var _a, _b, _c;
    if (d[key]) { // have this key -> just append comments & occurences; comments should be deduplicated
        d[key].comments = (_a = d[key].comments) === null || _a === void 0 ? void 0 : _a.concat((_b = entry.comments) !== null && _b !== void 0 ? _b : '').filter(function (value, index, self) { return self.indexOf(value) === index; });
    }
    else { // new key -> add it
        d[key] = entry;
    }
    (_c = d[key].occurences) === null || _c === void 0 ? void 0 : _c.push(
    // +1 to char & line, because they're counted from 0 inside
    "".concat(occurence.identFile, ":").concat(occurence.identLocation.line + 1, ":").concat(occurence.identLocation.character + 1));
}
exports.addToDict = addToDict;
//# sourceMappingURL=utils.js.map