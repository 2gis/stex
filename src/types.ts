import * as ts from "typescript";

export type SingleI18NEntry = {
  type: 'single';
  entry: string;
  context?: string;
};

export type PluralI18NEntry = {
  type: 'plural';
  entry: string[];
  context?: string;
};

export type I18NEntry = SingleI18NEntry | PluralI18NEntry;

export type Handlers = {
  _t: (params: ts.Node[], identInfo: IdentInfo) => void;
  _pt: (params: ts.Node[], identInfo: IdentInfo) => void;
  _nt: (params: ts.Node[], identInfo: IdentInfo) => void;
  _npt: (params: ts.Node[], identInfo: IdentInfo) => void;
  _gg: (params: ts.Node[], identInfo: IdentInfo) => void;
  _pgg: (params: ts.Node[], identInfo: IdentInfo) => void;
  _ngg: (params: ts.Node[], identInfo: IdentInfo) => void;
  _npgg: (params: ts.Node[], identInfo: IdentInfo) => void;
};

export type HTypes = keyof Handlers;

export type IdentInfo = {
  identLocation: { line: number, character: number };
  identFile: string;
};

export type Dict = { [key: string]: I18NEntry };
export type Scalar = number | string | null | undefined;

// i18n globals
export type _t = (s: string, ...args: Scalar[]) => string;
export type _pt = (ctx: string, s: string, ...args: Scalar[]) => string;
export type _nt = (plurals: string[], factor: number, ...args: Scalar[]) => string;
export type _npt = (ctx: string, plurals: string[], factor: number, ...args: Scalar[]) => string;

// Mocks, these functions should not be implemented in extractor
export const _t: _t = (_s, ..._args) => '';
export const _pt: _pt = (_ctx, _s, ..._args) => '';
export const _nt: _nt = (_plurals, _factor, ..._args) => '';
export const _npt: _npt = (_ctx, _plurals, _factor, ..._args) => '';
