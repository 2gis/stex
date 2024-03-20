import * as ts from "typescript";
import { IdentInfo, PluralI18NEntry } from 'i18n-proto';
import { Dict } from '../types';
import { panic } from './';
import {
  validatePluralPlaceholders,
  makeKey,
  getArrayListNode,
  getArrayListElements,
  isValidQuantifier,
  addToDict
} from '../utils';

// Plural translation
export function translate(d: Dict) {
  return (signatureItems: ts.Node[], identInfo: IdentInfo, comments: string[]) => {
    const [
      plurals, /* comma */,
      factor, /* comma */,
      args = null
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

    const list = getArrayListNode(plurals);
    if (!list) {
      panic('_nt: parameter #0 (plurality strings) should be an array literal', identInfo);
      return;
    }

    const { items, strings } = getArrayListElements(list);
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
      entry: [strings[0], strings[strings.length - 1]], // plural entries are identified by first and last forms
      occurences: [], // will be filled within addToDict
      translations: [],
      comments
    };

    const key = makeKey(entry);
    addToDict(d, key, entry, identInfo);
  };
}
