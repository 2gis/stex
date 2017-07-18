import * as ts from "typescript";
import { IdentInfo, I18NEntry, SingleI18NEntry, PluralI18NEntry, Handlers, Dict } from './types';
import { panic } from './panic';

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

// Translation parsing handlers

function simpleTranslate(d: Dict) {
  return (params: ts.Node[], identInfo: IdentInfo) => {
    let [tString, ...args] = params; // args should contain commas + identifiers

    // Checks
    if (tString.kind != ts.SyntaxKind.StringLiteral) {
      panic('_t: parameter #0 should be a string literal', identInfo);
      return;
    }

    const argIdents = args.filter((a) => [
      ts.SyntaxKind.Identifier,
      ts.SyntaxKind.StringLiteral,
      ts.SyntaxKind.NumericLiteral,
      ts.SyntaxKind.ExpressionStatement
    ].indexOf(a.kind) !== -1);

    const argPlaceholders = ((tString as ts.StringLiteral).text.match(/(%\d)/) || []).slice(1);
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

// TODO: eliminate copypaste
function contextualTranslate(d: Dict) {
  return (params: ts.Node[], identInfo: IdentInfo) => {
    let [context, /* comma */, tString, ...args] = params;

    // Checks
    if (!context || context.kind !== ts.SyntaxKind.StringLiteral) {
      panic('_pt: parameter #0 (context) should be a string literal', identInfo);
      return;
    }

    if (!tString || tString.kind !== ts.SyntaxKind.StringLiteral) {
      panic('_pt: parameter #1 (translated string) should be a string literal', identInfo);
      return;
    }

    const argIdents = args.filter((a) => [
      ts.SyntaxKind.Identifier,
      ts.SyntaxKind.StringLiteral,
      ts.SyntaxKind.NumericLiteral,
      ts.SyntaxKind.ExpressionStatement
    ].indexOf(a.kind) !== -1);

    const argPlaceholders = ((tString as ts.StringLiteral).text.match(/(%\d)/) || []).slice(1);
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
    let [plurals, /* comma */, factor, ...args] = params;

    // Checks
    if (!factor || factor.kind !== ts.SyntaxKind.NumericLiteral) {
      panic('_nt: parameter #1 (factor) should be a numeric literal', identInfo);
      return;
    }

    if (!plurals || plurals.kind !== ts.SyntaxKind.ArrayLiteralExpression) {
      panic('_nt: parameter #0 (plurality strings) should be a array literal', identInfo);
      return;
    }

    let arrayItems: ts.Node[] = plurals.getChildren().filter((c) => c.kind !== ts.SyntaxKind.CommaToken);
    let arrayStrings: string[] = (arrayItems as ts.StringLiteral[])
      .filter((c: ts.Node) => c.kind === ts.SyntaxKind.StringLiteral)
      .map((c: ts.StringLiteral) => c.text);

    if (arrayItems.length !== arrayStrings.length) {
      panic('_nt: parameter #0 (plurality strings) should contain only strings', identInfo);
      return;
    }

    const argIdents = args.filter((a) => [
      ts.SyntaxKind.Identifier,
      ts.SyntaxKind.StringLiteral,
      ts.SyntaxKind.NumericLiteral,
      ts.SyntaxKind.ExpressionStatement
    ].indexOf(a.kind) !== -1);

    let argPlaceholders: { [key: string]: any } = {};
    for (let sl of arrayStrings) {
      (sl.match(/(%\d)/) || []).slice(1).forEach((i) => {
        argPlaceholders[i] = true;
      });
    }

    if (argIdents.length !== Object.keys(argPlaceholders).length) {
      // TODO check %n match also, what if %1 then %5 in string?
      panic('_nt: optional arguments count mismatch', identInfo);
      return;
    }

    // All ok, add to dict

    const entry: PluralI18NEntry = {
      type: 'plural',
      entry: arrayStrings,
    }

    d[makeKey(entry)] = entry;
  };
}

// TODO: eliminate copypaste
function pluralContextualTranslate(d: Dict) {
  return (params: ts.Node[], identInfo: IdentInfo) => {
    let [context, /* comma */, plurals, /* comma */, factor, ...args] = params;

    // Checks
    if (!context || context.kind !== ts.SyntaxKind.StringLiteral) {
      panic('_npt: parameter #0 (context) should be a string literal', identInfo);
      return;
    }

    if (!factor || factor.kind !== ts.SyntaxKind.NumericLiteral) {
      panic('_npt: parameter #2 (factor) should be a numeric literal', identInfo);
      return;
    }

    if (!plurals || plurals.kind !== ts.SyntaxKind.ArrayLiteralExpression) {
      panic('_npt: parameter #1 (plurality strings) should be an array literal', identInfo);
      return;
    }

    let arrayItems: ts.Node[] = plurals.getChildren().filter((c) => c.kind !== ts.SyntaxKind.CommaToken);
    let arrayStrings: string[] = (arrayItems as ts.StringLiteral[])
      .filter((c: ts.Node) => c.kind === ts.SyntaxKind.StringLiteral)
      .map((c: ts.StringLiteral) => c.text);

    if (arrayItems.length !== arrayStrings.length) {
      panic('_npt: parameter #1 (plurality strings) should contain only string literals', identInfo);
      return;
    }

    const argIdents = args.filter((a) => [
      ts.SyntaxKind.Identifier,
      ts.SyntaxKind.StringLiteral,
      ts.SyntaxKind.NumericLiteral,
      ts.SyntaxKind.ExpressionStatement
    ].indexOf(a.kind) !== -1);
    let argPlaceholders: { [key: string]: any } = {};
    for (let sl of arrayStrings) {
      (sl.match(/(%\d)/) || []).slice(1).forEach((i) => {
        argPlaceholders[i] = true;
      });
    }

    if (argIdents.length !== Object.keys(argPlaceholders).length) {
      // TODO check %n match also, what if %1 then %5 in string?
      panic('_npt: optional arguments count mismatch', identInfo);
      return;
    }

    // All ok, add to dict

    const entry: PluralI18NEntry = {
      type: 'plural',
      entry: arrayStrings,
      context: (context as ts.StringLiteral).text
    }

    d[makeKey(entry)] = entry;
  };
}
