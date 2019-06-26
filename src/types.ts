import * as ts from 'typescript';
import { IdentInfo, I18NEntry } from 'i18n-proto';

export type Handlers = {
  _t: (params: ts.Node[], identInfo: IdentInfo, comments: string[]) => void;
  _pt: (params: ts.Node[], identInfo: IdentInfo, comments: string[]) => void;
  _nt: (params: ts.Node[], identInfo: IdentInfo, comments: string[]) => void;
  _npt: (params: ts.Node[], identInfo: IdentInfo, comments: string[]) => void;
  _gg: (params: ts.Node[], identInfo: IdentInfo, comments: string[]) => void;
  _pgg: (params: ts.Node[], identInfo: IdentInfo, comments: string[]) => void;
  _ngg: (params: ts.Node[], identInfo: IdentInfo, comments: string[]) => void;
  _npgg: (params: ts.Node[], identInfo: IdentInfo, comments: string[]) => void;
};

export type HTypes = keyof Handlers;
export type Dict = { [key: string]: I18NEntry };
export type Scalar = number | string | null | undefined;
export type SubstitutionList = Scalar[];

// i18n globals

// Mocks, these functions should not be implemented in extractor
export const _t = (
  _str: string,
  _substitutions: SubstitutionList = []
) => '';
export const _pt = (
  _context: string,
  _str: string,
  _substitutions: SubstitutionList = []
) => '';
export const _nt = (
  _plurals: string[],
  _factor: number,
  _substitutions: SubstitutionList = []
) => '';
export const _npt = (
  _context: string,
  _plurals: string[],
  _factor: number,
  _substitutions: SubstitutionList = []
) => '';

export type SimpleTranslation = typeof _t;
export type ContextualTranslation = typeof _pt;
export type PluralTranslation = typeof _nt;
export type PluralContextualTranslation = typeof _npt;
