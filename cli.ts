import { readFileSync } from 'fs';
import * as ts from "typescript";
import { extract, getDict } from './src';

const fileNames = process.argv.slice(2);
fileNames.forEach(fileName => {
  let sourceFile = ts.createSourceFile(fileName, readFileSync(fileName).toString(), ts.ScriptTarget.ES5, /*setParentNodes */ true);
  extract(sourceFile);
});

console.log(getDict());
