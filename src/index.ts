import * as ts from "typescript";
import { HTypes, Dict } from './types';
import { getHandlers } from './handlers';
export { overridePanic } from './handlers';
import { CommentHandle } from './commentExtractor';
import { TranslationJson } from 'i18n-proto';

let dict: Dict = {};
let handlers = getHandlers(dict);

export function extract(sourceFile: ts.SourceFile) {
  let commentHandle = (new CommentHandle())
    .extractRawComments(sourceFile.getFullText(), sourceFile.fileName);
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
              // no filter by object name, might be useful with transpiled sources
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
            default: ;
          }
        }

        if (ident && identFile && identLocation && handlers.hasOwnProperty(ident)) {
          const handler = handlers[ident as HTypes];
          if (handler) {
            const pos = { identLocation, identFile };
            handler(params || [], pos, commentHandle.findAdjacentComments(pos));
          }
        } else {
          ts.forEachChild(node, extractNode);
        }
        break;
      default:
        ts.forEachChild(node, extractNode);
    }
  }
}

export function getDictItems(): TranslationJson {
  return {
    items: Object.keys(dict).map((key) => dict[key])
  };
}

export function getDict() {
  return dict;
}

export function clearDict() {
  for (let i in dict) {
    delete dict[i];
  }
}
