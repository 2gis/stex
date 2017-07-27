import * as ts from "typescript";
import { Dict } from '../types';
import { IdentInfo, PluralI18NEntry } from 'i18n-proto';
import { panic } from './';
import {
  validatePluralPlaceholders,
  makeKey,
  getArrayListNode,
  getArrayListElements,
  isValidQuantifier,
  addToDict,
} from '../utils';

// Plural contextual translation
export function translate(d: Dict) {
  return (signatureItems: ts.Node[], identInfo: IdentInfo, comments: string[]) => {
    let [
      context, /* comma */,
      plurals, /* comma */,
      factor, /* comma */,
      args = null, /* comma */,
      /* macros = null */ // Macros can't be checked in compile-time :(
    ] = signatureItems;

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
      context: (context as ts.StringLiteral).text,
      occurences: [], // will be filled within addToDict
      translations: [],
      comments
    };

    const key = makeKey(entry);
    addToDict(d, key, entry, identInfo);
  };
}
