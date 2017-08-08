import * as ts from "typescript";
import { IdentInfo, SingleI18NEntry } from 'i18n-proto';
import { Dict } from '../types';
import { validateSinglePlaceholder, makeKey, addToDict } from '../utils';
import { panic } from './';

// Contextual translation
export function translate(d: Dict) {
  return (signatureItems: ts.Node[], identInfo: IdentInfo, comments: string[]) => {
    let [
      context, /* comma */,
      tString, /* comma */,
      args = null
    ] = signatureItems;

    // Checks
    if (!context || context.kind !== ts.SyntaxKind.StringLiteral) {
      panic('_pt: parameter #0 (context) should be a string literal', identInfo);
      return;
    }

    if (!tString || tString.kind !== ts.SyntaxKind.StringLiteral) {
      panic('_pt: parameter #1 (translated string) should be a string literal', identInfo);
      return;
    }

    if (!validateSinglePlaceholder(args, tString as ts.StringLiteral)) {
      // TODO check %n match also, what if %1 then %5 in string?
      panic('_pt: optional arguments count mismatch', identInfo);
      return;
    }

    // All ok, add to dict

    const entry: SingleI18NEntry = {
      type: 'single',
      entry: (tString as ts.StringLiteral).text,
      context: (context as ts.StringLiteral).text,
      occurences: [], // will be filled within addToDict
      comments
    };

    const key = makeKey(entry);
    addToDict(d, key, entry, identInfo);
  };
}

