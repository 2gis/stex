import * as ts from "typescript";
import { getHandlers } from './handlers';
export { overridePanic } from './handlers';
import { CommentHandle } from './commentExtractor';
const dict = {};
const handlers = getHandlers(dict);
export function extract(sourceFile) {
    const commentHandle = (new CommentHandle())
        .extractRawComments(sourceFile.getFullText(), sourceFile.fileName);
    extractNode(sourceFile);
    function extractNode(node) {
        switch (node.kind) {
            case ts.SyntaxKind.CallExpression:
                let ident;
                let params;
                let identLocation;
                let identFile;
                // шото с обходом AST, понять что не так - скорее всего что-то в typescript api поменялось
                for (const c of node.getChildren()) {
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
                    const handler = handlers[ident];
                    if (handler) {
                        const pos = { identLocation, identFile };
                        handler(params ?? [], pos, commentHandle.findAdjacentComments(pos));
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
export function getDictItems() {
    return {
        items: Object.keys(dict).map((key) => dict[key])
    };
}
export function getDict() {
    return dict;
}
export function clearDict() {
    for (const i in dict) {
        delete dict[i];
    }
}
//# sourceMappingURL=index.js.map