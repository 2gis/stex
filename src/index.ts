import { readFileSync } from "fs";
import * as ts from "typescript";
import { HTypes, Dict } from './types';
import { getHandlers } from './handlers';

let dict: Dict = {};
let handlers = getHandlers(dict);

export function extract(sourceFile: ts.SourceFile) {
  extractNode(sourceFile);

  function extractNode(node: ts.Node) {
    switch (node.kind) {
      case ts.SyntaxKind.CallExpression:
        let ident;
        let params;
        let identLocation;
        let identFile;
        for (let c of node.getChildren()) {
          switch (c.kind) {
            case ts.SyntaxKind.PropertyAccessExpression:
              // TODO: для всех объектов? или ограничить по именам?
              ident = ((c as ts.PropertyAccessExpression).name as ts.Identifier).text;
              identFile = sourceFile.fileName;
              identLocation = c.getSourceFile().getLineAndCharacterOfPosition(c.getStart()) || { line: 0, character: 0 };
              break;
            case ts.SyntaxKind.Identifier:
              ident = (c as ts.Identifier).text;
              identFile = sourceFile.fileName;
              identLocation = c.getSourceFile().getLineAndCharacterOfPosition(c.getStart()) || { line: 0, character: 0 };
              break;
            case ts.SyntaxKind.SyntaxList:
              params = c.getChildren();
              break;
            default:
              ts.forEachChild(node, extractNode);
          }
        }

        if (ident && identFile && identLocation) {
          const handler = handlers[ident as HTypes];
          if (handler) {
            handler(params || [], { identLocation, identFile });
          }
        }
        break;
      default:
        ts.forEachChild(node, extractNode);
    }
  }
}

const fileNames = process.argv.slice(2);
fileNames.forEach(fileName => {
  let sourceFile = ts.createSourceFile(fileName, readFileSync(fileName).toString(), ts.ScriptTarget.ES5, /*setParentNodes */ true);
  extract(sourceFile);
  console.log(dict);
});
