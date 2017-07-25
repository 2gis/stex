import * as ts from "typescript";

export type SingleI18NEntry = {
  type: 'single';
  entry: string;
  context?: string;
  occurence: IdentInfo;
  comment?: string;
};

export type PluralI18NEntry = {
  type: 'plural';
  entry: string[];
  context?: string;
  occurence: IdentInfo;
  comment?: string;
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
export type SubstitutionList = Scalar[];
export type MacroParams = { [key: string]: Scalar };
export type MacroParamsList = { [key: string]: MacroParams };

// i18n globals

// Mocks, these functions should not be implemented in extractor
export const _t = (
  _str: string,
  _substitutions: SubstitutionList = [],
  _macroParams: MacroParamsList = {}
) => '';
export const _pt = (
  _context: string,
  _str: string,
  _substitutions: SubstitutionList = [],
  _macroParams: MacroParamsList = {}
) => '';
export const _nt = (
  _plurals: string[],
  _factor: number,
  _substitutions: SubstitutionList = [],
  _macroParams: MacroParamsList = {}
) => '';
export const _npt = (
  _context: string,
  _plurals: string[],
  _factor: number,
  _substitutions: SubstitutionList = [],
  _macroParams: MacroParamsList = {}
) => '';

export type SimpleTranslation = typeof _t;
export type ContextualTranslation = typeof _pt;
export type PluralTranslation = typeof _nt;
export type PluralContextualTranslation = typeof _npt;
