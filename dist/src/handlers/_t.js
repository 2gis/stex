import * as ts from "typescript";
import { validateSinglePlaceholder, makeKey, addToDict } from '../utils';
import { panic } from './';
// Simple translation
export function translate(d) {
    return (signatureItems, identInfo, comments) => {
        const [tString, /* comma */ , args = null] = signatureItems;
        // Checks
        if (tString.kind != ts.SyntaxKind.StringLiteral) {
            panic('_t: parameter #0 should be a string literal', identInfo);
            return;
        }
        if (!validateSinglePlaceholder(args, tString)) {
            panic('_t: optional arguments count mismatch', identInfo);
            return;
        }
        // All ok, add to dict
        const entry = {
            type: 'single',
            entry: tString.text,
            occurences: [], // will be filled within addToDict
            comments
        };
        const key = makeKey(entry);
        addToDict(d, key, entry, identInfo);
    };
}
//# sourceMappingURL=_t.js.map