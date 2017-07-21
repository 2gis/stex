import * as ts from "typescript";
import { IdentInfo, I18NEntry, SingleI18NEntry, PluralI18NEntry, Handlers, Dict } from './types';
import { panic as _panicLog } from './panic';

let panic = _panicLog;
export function overridePanic(cb: (message: string, info: IdentInfo) => void = _panicLog) {
  panic = cb;
}

export const getHandlers: (d: Dict) => Handlers = (d: Dict) => ({
  _t: simpleTranslate(d),
  _pt: contextualTranslate(d),
  _nt: pluralTranslate(d),
  _npt: pluralContextualTranslate(d),

  // should not translate these at all:
  _gg: (_params: ts.Node[], _identInfo: IdentInfo) => { },
  _pgg: (_params: ts.Node[], _identInfo: IdentInfo) => { },
  _ngg: (_params: ts.Node[], _identInfo: IdentInfo) => { },
  _npgg: (_params: ts.Node[], _identInfo: IdentInfo) => { },
});

// Dict management related

const FIELD_KEY = '^$';
function makeKey(e: I18NEntry): string {
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

function filterArgs(args: ts.Node[]): ts.Node[] {
  // console.log(args.map((a) => a.kind).join(',')); // debug
  return args.filter((a) => a.kind === ts.SyntaxKind.StringLiteral || isValidQuantifier(a));
}

function isValidQuantifier(node: ts.Node): boolean {
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

function getArrayListNode(node: ts.Node): ts.Node | null {
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

function getArrayListElements(node: ts.Node): { items: ts.Node[], strings: string[] } {
  let items: ts.Node[] = node.getChildren().filter((c) => c.kind !== ts.SyntaxKind.CommaToken);
  let strings: string[] = (items as ts.StringLiteral[])
    .filter((c: ts.Node) => c.kind === ts.SyntaxKind.StringLiteral)
    .map((c: ts.StringLiteral) => c.text);
  return { items, strings };
}

function validatePluralPlaceholders(args: ts.Node | null, strings: string[]) {
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

// Translation parsing handlers

function simpleTranslate(d: Dict) {
  return (params: ts.Node[], identInfo: IdentInfo) => {
    let [tString, /* comma */, args = null, /* comma */, macros = null] = params;
    macros = macros;

    // Checks
    if (tString.kind != ts.SyntaxKind.StringLiteral) {
      panic('_t: parameter #0 should be a string literal', identInfo);
      return;
    }

    const argList = args ? getArrayListNode(args) : null;
    const argIdents = argList ? filterArgs(argList.getChildren()) : [];
    const argPlaceholders = (tString as ts.StringLiteral).text.match(/(%\d)/g) || [];
    if (argIdents.length !== argPlaceholders.length) {
      panic('_t: optional arguments count mismatch', identInfo);
      return;
    }

    // All ok, add to dict

    const entry: SingleI18NEntry = {
      type: 'single',
      entry: (tString as ts.StringLiteral).text
    }

    d[makeKey(entry)] = entry;
  };
}

function contextualTranslate(d: Dict) {
  return (params: ts.Node[], identInfo: IdentInfo) => {
    let [context, /* comma */, tString, /* comma */, args = null, /* comma */, macros = null] = params;
    macros = macros;

    // Checks
    if (!context || context.kind !== ts.SyntaxKind.StringLiteral) {
      panic('_pt: parameter #0 (context) should be a string literal', identInfo);
      return;
    }

    if (!tString || tString.kind !== ts.SyntaxKind.StringLiteral) {
      panic('_pt: parameter #1 (translated string) should be a string literal', identInfo);
      return;
    }

    const argList = args ? getArrayListNode(args) : null;
    const argIdents = argList ? filterArgs(argList.getChildren()) : [];
    const argPlaceholders = (tString as ts.StringLiteral).text.match(/(%\d)/g) || [];
    if (argIdents.length !== argPlaceholders.length) {
      // TODO check %n match also, what if %1 then %5 in string?
      panic('_pt: optional arguments count mismatch', identInfo);
      return;
    }

    // All ok, add to dict

    const entry: SingleI18NEntry = {
      type: 'single',
      entry: (tString as ts.StringLiteral).text,
      context: (context as ts.StringLiteral).text
    }

    d[makeKey(entry)] = entry;
  };
}

function pluralTranslate(d: Dict) {
  return (params: ts.Node[], identInfo: IdentInfo) => {
    let [plurals, /* comma */, factor, /* comma */, args = null, /* comma */, macros = null] = params;
    macros = macros;

    // Checks
    if (!factor || !isValidQuantifier(factor)) {
      panic('_nt: parameter #1 (factor) should be a numeric literal, value or expression', identInfo);
      return;
    }

    if (!plurals || plurals.kind !== ts.SyntaxKind.ArrayLiteralExpression) {
      panic('_nt: parameter #0 (plurality strings) should be an array literal', identInfo);
      return;
    }

    let list = getArrayListNode(plurals);
    if (!list) {
      panic('_nt: parameter #0 (plurality strings) should be an array literal', identInfo);
      return;
    }

    let { items, strings } = getArrayListElements(list);
    if (items.length !== strings.length) {
      panic('_nt: parameter #0 (plurality strings) should contain only strings', identInfo);
      return;
    }

    if (!validatePluralPlaceholders(args, strings)) {
      // TODO check %n match also, what if %1 then %5 in string?
      panic('_nt: optional arguments count mismatch', identInfo);
      return;
    }

    // All ok, add to dict

    const entry: PluralI18NEntry = {
      type: 'plural',
      entry: strings,
    }

    d[makeKey(entry)] = entry;
  };
}

function pluralContextualTranslate(d: Dict) {
  return (params: ts.Node[], identInfo: IdentInfo) => {
    let [context, /* comma */, plurals, /* comma */, factor, /* comma */, args = null, /* comma */, macros = null] = params;
    macros = macros;

    // Checks
    if (!context || context.kind !== ts.SyntaxKind.StringLiteral) {
      panic('_npt: parameter #0 (context) should be a string literal', identInfo);
      return;
    }

    if (!factor || !isValidQuantifier(factor)) {
      panic('_npt: parameter #2 (factor) should be a numeric literal, value or expression', identInfo);
      return;
    }

    if (!plurals || plurals.kind !== ts.SyntaxKind.ArrayLiteralExpression) {
      panic('_npt: parameter #1 (plurality strings) should be an array literal', identInfo);
      return;
    }

    let list = getArrayListNode(plurals);
    if (!list) {
      panic('_nt: parameter #0 (plurality strings) should be an array literal', identInfo);
      return;
    }

    let { items, strings } = getArrayListElements(list);
    if (items.length !== strings.length) {
      panic('_npt: parameter #1 (plurality strings) should contain only string literals', identInfo);
      return;
    }

    if (!validatePluralPlaceholders(args, strings)) {
      // TODO check %n match also, what if %1 then %5 in string?
      panic('_npt: optional arguments count mismatch', identInfo);
      return;
    }

    // All ok, add to dict

    const entry: PluralI18NEntry = {
      type: 'plural',
      entry: strings,
      context: (context as ts.StringLiteral).text
    }

    d[makeKey(entry)] = entry;
  };
}
