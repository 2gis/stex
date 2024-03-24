import * as ts from "typescript";
import { panic } from './';
import { validatePluralPlaceholders, makeKey, getArrayListNode, getArrayListElements, isValidQuantifier, addToDict, } from '../utils';
// Plural contextual translation
export function translate(d) {
    return (signatureItems, identInfo, comments) => {
        const [context, /* comma */ , plurals, /* comma */ , factor, /* comma */ , args = null] = signatureItems;
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
        const list = getArrayListNode(plurals);
        if (!list) {
            panic('_nt: parameter #0 (plurality strings) should be an array literal', identInfo);
            return;
        }
        const { items, strings } = getArrayListElements(list);
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
        const entry = {
            type: 'plural',
            entry: [strings[0], strings[strings.length - 1]], // plural entries are identified by first and last forms
            context: context.text,
            occurences: [], // will be filled within addToDict
            translations: [],
            comments
        };
        const key = makeKey(entry);
        addToDict(d, key, entry, identInfo);
    };
}
//# sourceMappingURL=_npt.js.map