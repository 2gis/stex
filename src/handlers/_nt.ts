import * as ts from "typescript";
import { IdentInfo, PluralI18NEntry, Dict } from '../types';
import { panic } from './';
import {
  validatePluralPlaceholders,
  makeKey,
  getArrayListNode,
  getArrayListElements,
  isValidQuantifier
} from '../utils';

// Plural translation
export function translate(d: Dict) {
  return (signatureItems: ts.Node[], identInfo: IdentInfo) => {
    let [
      plurals, /* comma */,
      factor, /* comma */,
      args = null, /* comma */,
      /* macros = null */ // Macros can't be checked in compile-time :(
    ] = signatureItems;

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
