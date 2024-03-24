import * as ts from "typescript";
import { extract, getDict, clearDict, overridePanic } from '../src/';
export function getExtractedStrings(src, panicFunction) {
    clearDict();
    const sourceFile = ts.createSourceFile('test', src.toString(), ts.ScriptTarget.ES5, /*setParentNodes */ true);
    if (panicFunction) {
        overridePanic(panicFunction);
    }
    extract(sourceFile);
    return getDict();
}
//# sourceMappingURL=util.js.map