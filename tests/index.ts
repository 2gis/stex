//import * as assert from 'assert';
import { getExtractedStrings } from './util';
import { _t /*, _nt, _pt, _npt*/ } from '../src/types';

describe('Test simple extraction', () => {
  it('Extracts simple strings', () => {
    function simple() {
      let a = _t('Some text');
      let b = _t('Some more text');
      return { a, b };
    }

    let extracted = getExtractedStrings(simple);
    console.log(extracted);
  });
});

