import * as ts from "typescript";
import { IdentInfo, Handlers, Dict } from '../types';
import { panic as _panicLog } from '../panic';
import { translate as simpleTranslate } from './_t';
import { translate as contextualTranslate } from './_pt';
import { translate as pluralTranslate } from './_nt';
import { translate as pluralContextualTranslate } from './_npt';

// Panic overriding for some testing abilities
let panicImpl = _panicLog;
export const panic: typeof _panicLog = (s: string, ident: IdentInfo) => panicImpl(s, ident);
export function overridePanic(cb: (message: string, info: IdentInfo) => void = _panicLog) {
  panicImpl = cb;
}

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
