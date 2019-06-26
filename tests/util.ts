import * as ts from 'typescript';
import { extract, getDict, clearDict, overridePanic } from '../src/';
import { IdentInfo } from 'i18n-proto';

export function getExtractedStrings(src: Function | string, panicFunction?: (message: string, ident: IdentInfo) => void) {
  clearDict();
  let sourceFile = ts.createSourceFile('test', src.toString(), ts.ScriptTarget.ES5, /*setParentNodes */ true);
  if (panicFunction) {
    overridePanic(panicFunction);
  }
  extract(sourceFile);
  return getDict();
}
