import { panic as _panicLog } from '../panic';
import { translate as simpleTranslate } from './_t';
import { translate as contextualTranslate } from './_pt';
import { translate as pluralTranslate } from './_nt';
import { translate as pluralContextualTranslate } from './_npt';
// Panic overriding for some testing abilities
let panicImpl = _panicLog;
export const panic = (s, ident) => panicImpl(s, ident);
export function overridePanic(cb = _panicLog) {
    panicImpl = cb;
}
export const getHandlers = (d) => ({
    _t: simpleTranslate(d),
    _pt: contextualTranslate(d),
    _nt: pluralTranslate(d),
    _npt: pluralContextualTranslate(d),
    // should not translate these at all:
    _gg: (_params, _identInfo) => { },
    _pgg: (_params, _identInfo) => { },
    _ngg: (_params, _identInfo) => { },
    _npgg: (_params, _identInfo) => { },
});
//# sourceMappingURL=index.js.map