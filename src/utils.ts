import * as ts from "typescript";
import { I18NEntry } from 'i18n-proto';

const FIELD_KEY = '^$';
export function makeKey(e: I18NEntry): string {
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

export function filterArgs(args: ts.Node[]): ts.Node[] {
  // console.log(args.map((a) => a.kind).join(',')); // debug
  return args.filter((a) => a.kind === ts.SyntaxKind.StringLiteral || isValidQuantifier(a));
}

export function isValidQuantifier(node: ts.Node): boolean {
  return [
    ts.SyntaxKind.NumericLiteral,
    ts.SyntaxKind.Identifier,
    ts.SyntaxKind.ExpressionStatement,
    ts.SyntaxKind.PostfixUnaryExpression,
    ts.SyntaxKind.PrefixUnaryExpression,
    ts.SyntaxKind.BinaryExpression,
    ts.SyntaxKind.CallExpression,
    ts.SyntaxKind.ConditionalExpression
  ].indexOf(node.kind) !== -1;
}

export function getArrayListNode(node: ts.Node): ts.Node | null {
  return node.getChildren().reduce(
    (acc: ts.Node | null, val: ts.Node) => {
      if (acc || val.kind !== ts.SyntaxKind.SyntaxList) {
        return acc;
      }
      return val;
    },
    null
  );
}

export function getArrayListElements(node: ts.Node): { items: ts.Node[], strings: string[] } {
  let items: ts.Node[] = node.getChildren().filter((c) => c.kind !== ts.SyntaxKind.CommaToken);
  let strings: string[] = (items as ts.StringLiteral[])
    .filter((c: ts.Node) => c.kind === ts.SyntaxKind.StringLiteral)
    .map((c: ts.StringLiteral) => c.text);
  return { items, strings };
}

export function validatePluralPlaceholders(args: ts.Node | null, strings: string[]) {
  const argList = args ? getArrayListNode(args) : null;
  const argIdents = argList ? filterArgs(argList.getChildren()) : [];
  let argPlaceholders: { [key: string]: any } = {};
  for (let sl of strings) {
    (sl.match(/(%\d)/g) || []).forEach((i) => {
      argPlaceholders[i] = true;
    });
  }

  return argIdents.length === Object.keys(argPlaceholders).length;
}

export function validateSinglePlaceholder(args: ts.Node | null, tString: ts.StringLiteral) {
  const argList = args ? getArrayListNode(args) : null;
  const argIdents = argList ? filterArgs(argList.getChildren()) : [];
  const argPlaceholders = tString.text.match(/(%\d)/g) || [];
  return argIdents.length === argPlaceholders.length;
}
