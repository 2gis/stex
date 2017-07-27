"use strict";
exports.__esModule = true;
var ts = require("typescript");
var handlers_1 = require("./handlers");
var handlers_2 = require("./handlers");
exports.overridePanic = handlers_2.overridePanic;
var commentExtractor_1 = require("./commentExtractor");
var dict = {};
var handlers = handlers_1.getHandlers(dict);
function extract(sourceFile) {
    var commentHandle = (new commentExtractor_1.CommentHandle())
        .extractRawComments(sourceFile.getFullText(), sourceFile.fileName);
    extractNode(sourceFile);
    function extractNode(node) {
        switch (node.kind) {
            case ts.SyntaxKind.CallExpression:
                var ident = void 0;
                var params = void 0;
                var identLocation = void 0;
                var identFile = void 0;
                for (var _i = 0, _a = node.getChildren(); _i < _a.length; _i++) {
                    var c = _a[_i];
                    switch (c.kind) {
                        case ts.SyntaxKind.PropertyAccessExpression:
                            // no filter by object name, might be useful with transpiled sources
                            ident = c.name.text;
                            identFile = sourceFile.fileName;
                            identLocation = c.getSourceFile().getLineAndCharacterOfPosition(c.getStart()) || { line: 0, character: 0 };
                            break;
                        case ts.SyntaxKind.Identifier:
                            ident = c.text;
                            identFile = sourceFile.fileName;
                            identLocation = c.getSourceFile().getLineAndCharacterOfPosition(c.getStart()) || { line: 0, character: 0 };
                            break;
                        case ts.SyntaxKind.SyntaxList:
                            params = c.getChildren();
                            break;
                        default: ;
                    }
                }
                if (ident && identFile && identLocation && handlers.hasOwnProperty(ident)) {
                    var handler = handlers[ident];
                    if (handler) {
                        var pos = { identLocation: identLocation, identFile: identFile };
                        handler(params || [], pos, commentHandle.findAdjacentComments(pos));
                    }
                }
                else {
                    ts.forEachChild(node, extractNode);
                }
                break;
            default:
                ts.forEachChild(node, extractNode);
        }
    }
}
exports.extract = extract;
function getDictItems() {
    return Object.keys(dict).map(function (key) { return dict[key]; });
    ;
}
exports.getDictItems = getDictItems;
function getDict() {
    return dict;
}
exports.getDict = getDict;
function clearDict() {
    for (var i in dict) {
        delete dict[i];
    }
}
exports.clearDict = clearDict;
