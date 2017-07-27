"use strict";
exports.__esModule = true;
var ts = require("typescript");
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
        ts.SyntaxKind.ConditionalExpression
    ].indexOf(node.kind) !== -1;
}
exports.isValidQuantifier = isValidQuantifier;
function getArrayListNode(node) {
    return node.getChildren().reduce(function (acc, val) {
        if (acc || val.kind !== ts.SyntaxKind.SyntaxList) {
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
    var argList = args ? getArrayListNode(args) : null;
    var argIdents = argList ? filterArgs(argList.getChildren()) : [];
    var argPlaceholders = {};
    for (var _i = 0, strings_1 = strings; _i < strings_1.length; _i++) {
        var sl = strings_1[_i];
        (sl.match(/(%\d)/g) || []).forEach(function (i) {
            argPlaceholders[i] = true;
        });
    }
    return argIdents.length === Object.keys(argPlaceholders).length;
}
exports.validatePluralPlaceholders = validatePluralPlaceholders;
function validateSinglePlaceholder(args, tString) {
    var argList = args ? getArrayListNode(args) : null;
    var argIdents = argList ? filterArgs(argList.getChildren()) : [];
    var argPlaceholders = tString.text.match(/(%\d)/g) || [];
    return argIdents.length === argPlaceholders.length;
}
exports.validateSinglePlaceholder = validateSinglePlaceholder;
function addToDict(d, key, entry, occurence) {
    if (d[key]) {
        d[key].comments = d[key].comments.concat(entry.comments)
            .filter(function (value, index, self) { return self.indexOf(value) === index; });
    }
    else {
        d[key] = entry;
    }
    d[key].occurences.push(
    // +1 to char & line, because they're counted from 0 inside
    occurence.identFile + ":" + (occurence.identLocation.line + 1) + ":" + (occurence.identLocation.character + 1));
}
exports.addToDict = addToDict;
