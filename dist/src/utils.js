import * as ts from "typescript";
const FIELD_KEY = '^$';
export function makeKey(e) {
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
export function filterArgs(args) {
    // console.log(args.map((a) => a.kind).join(',')); // debug
    return args.filter((a) => a.kind === ts.SyntaxKind.StringLiteral || isValidQuantifier(a));
}
export function isValidQuantifier(node) {
    return [
        ts.SyntaxKind.NumericLiteral,
        ts.SyntaxKind.Identifier,
        ts.SyntaxKind.ExpressionStatement,
        ts.SyntaxKind.PostfixUnaryExpression,
        ts.SyntaxKind.PrefixUnaryExpression,
        ts.SyntaxKind.BinaryExpression,
        ts.SyntaxKind.CallExpression,
        ts.SyntaxKind.PropertyAccessExpression,
        ts.SyntaxKind.ElementAccessExpression,
        ts.SyntaxKind.ConditionalExpression
    ].includes(node.kind);
}
export function getArrayListNode(node) {
    return node.getChildren().reduce((acc, val) => {
        if (val.kind !== ts.SyntaxKind.SyntaxList || acc) {
            return acc;
        }
        return val;
    }, null);
}
export function getArrayListElements(node) {
    const items = node.getChildren().filter((c) => c.kind !== ts.SyntaxKind.CommaToken);
    const strings = items
        .filter((c) => c.kind === ts.SyntaxKind.StringLiteral)
        .map((c) => c.text);
    return { items, strings };
}
export function validatePluralPlaceholders(args, strings) {
    const argList = args ? getArrayListNode(args) : null;
    const argIdents = argList ? filterArgs(argList.getChildren()) : [];
    const argPlaceholders = {};
    for (const sl of strings) {
        (sl.match(/(%\d)/g) ?? []).forEach((i) => {
            argPlaceholders[i] = true;
        });
    }
    return argIdents.length === Object.keys(argPlaceholders).length;
}
export function validateSinglePlaceholder(args, tString) {
    const argList = args ? getArrayListNode(args) : null;
    const argIdents = argList ? filterArgs(argList.getChildren()) : [];
    const argPlaceholders = tString.text.match(/(%\d)/g) ?? [];
    return argIdents.length === argPlaceholders.length;
}
export function addToDict(d, key, entry, occurence) {
    if (d[key]) { // have this key -> just append comments & occurences; comments should be deduplicated
        d[key].comments = d[key].comments?.concat(entry.comments ?? '')
            .filter((value, index, self) => self.indexOf(value) === index);
    }
    else { // new key -> add it
        d[key] = entry;
    }
    d[key].occurences?.push(
    // +1 to char & line, because they're counted from 0 inside
    `${occurence.identFile}:${occurence.identLocation.line + 1}:${occurence.identLocation.character + 1}`);
}
//# sourceMappingURL=utils.js.map