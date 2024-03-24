"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExtractedStrings = void 0;
var tslib_1 = require("tslib");
var ts = tslib_1.__importStar(require("typescript"));
var src_1 = require("../src/");
function getExtractedStrings(src, panicFunction) {
    (0, src_1.clearDict)();
    var sourceFile = ts.createSourceFile('test', src.toString(), ts.ScriptTarget.ES5, /*setParentNodes */ true);
    if (panicFunction) {
        (0, src_1.overridePanic)(panicFunction);
    }
    (0, src_1.extract)(sourceFile);
    return (0, src_1.getDict)();
}
exports.getExtractedStrings = getExtractedStrings;
//# sourceMappingURL=util.js.map