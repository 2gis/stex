import * as ts from "typescript";
import { IdentInfo, SingleI18NEntry } from 'i18n-proto';
import { Dict } from '../types';
import { validateSinglePlaceholder, makeKey, addToDict } from '../utils';
import { panic } from './';

// Simple translation
export function translate(d: Dict) {
  return (signatureItems: ts.Node[], identInfo: IdentInfo, comments: string[]) => {
    let [
      tString, /* comma */,
      args = null, /* comma */,
      /* macros = null */ // Macros can't be checked in compile-time :(
    ] = signatureItems;

    // Checks
    if (tString.kind != ts.SyntaxKind.StringLiteral) {
      panic('_t: parameter #0 should be a string literal', identInfo);
      return;
    }

    if (!validateSinglePlaceholder(args, tString as ts.StringLiteral)) {
      panic('_t: optional arguments count mismatch', identInfo);
      return;
    }

    // All ok, add to dict

    const entry: SingleI18NEntry = {
      type: 'single',
      entry: (tString as ts.StringLiteral).text,
      occurences: [], // will be filled within addToDict
      translations: [],
      comments
    };

    const key = makeKey(entry);
    addToDict(d, key, entry, identInfo);
  };
}
