import * as ts from "typescript";
import { extract, getDict, clearDict } from '../src/';

export function getExtractedStrings(src: Function) {
  clearDict();
  let sourceFile = ts.createSourceFile('test', src.toString(), ts.ScriptTarget.ES5, /*setParentNodes */ true);
  extract(sourceFile);
  return getDict();
}
