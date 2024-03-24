import * as ts from "typescript";
import { validateSinglePlaceholder, makeKey, addToDict } from '../utils';
import { panic } from './';
// Contextual translation
export function translate(d) {
    return (signatureItems, identInfo, comments) => {
        const [context, /* comma */ , tString, /* comma */ , args = null] = signatureItems;
        // Checks
        if (!context || context.kind !== ts.SyntaxKind.StringLiteral) {
            panic('_pt: parameter #0 (context) should be a string literal', identInfo);
            return;
        }
        if (!tString || tString.kind !== ts.SyntaxKind.StringLiteral) {
            panic('_pt: parameter #1 (translated string) should be a string literal', identInfo);
            return;
        }
        if (!validateSinglePlaceholder(args, tString)) {
            // TODO check %n match also, what if %1 then %5 in string?
            panic('_pt: optional arguments count mismatch', identInfo);
            return;
        }
        // All ok, add to dict
        const entry = {
            type: 'single',
            entry: tString.text,
            context: context.text,
            occurences: [], // will be filled within addToDict
            comments
        };
        const key = makeKey(entry);
        addToDict(d, key, entry, identInfo);
    };
}
//# sourceMappingURL=_pt.js.map