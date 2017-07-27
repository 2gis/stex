import * as assert from 'assert';
import { getExtractedStrings } from './util';
import { IdentInfo } from 'i18n-proto';
import { _t } from '../src/types';

describe('Test simple extraction', () => {
  it('Extracts strings', () => {
    function simple() {
      let a = _t('Some text');
      let b = _t('Some more text');
      return { a, b };
    }

    let extracted = getExtractedStrings(simple);
    assert.equal(Object.keys(extracted).length, 2);
    assert.equal(extracted['Some text'].type, 'single');
    assert.equal(extracted['Some text'].context, undefined);
    assert.equal(extracted['Some text'].entry, 'Some text');
    assert.equal(extracted['Some more text'].type, 'single');
    assert.equal(extracted['Some more text'].context, undefined);
    assert.equal(extracted['Some more text'].entry, 'Some more text');
  });

  it('Extracts strings with valid simple placeholders of different types', () => {
    function simple() {
      let a = _t('Some text %1', [12 + 12]); // numeric binary expression
      a = _t('Some next text %1', [-12]); // numeric unary expression
      a = _t('Some more next text %1', [12]); // numeric literal
      let b = _t('Some %1 more text', ['string placeholder']); // string literal
      let c = _t('%1 more text', [a]); // variable
      c = _t('%1 more next text', [a ? '123' : '431']); // ternary expression
      c = _t('more %1 more', [Date.now()]); // call expression
      return { a, b, c };
    }

    let extracted = getExtractedStrings(simple);
    assert.equal(Object.keys(extracted).length, 7);
    assert.equal(extracted['Some text %1'].type, 'single');
    assert.equal(extracted['Some text %1'].context, undefined);
    assert.equal(extracted['Some text %1'].entry, 'Some text %1');
    assert.equal(extracted['Some next text %1'].entry, 'Some next text %1');
    assert.equal(extracted['Some more next text %1'].entry, 'Some more next text %1');
    assert.equal(extracted['Some %1 more text'].entry, 'Some %1 more text');
    assert.equal(extracted['%1 more text'].entry, '%1 more text');
    assert.equal(extracted['%1 more next text'].entry, '%1 more next text');
    assert.equal(extracted['more %1 more'].entry, 'more %1 more');
  });

  it('Extracts strings with many placeholders', () => {
    function simple() {
      let a = _t('Some %2 text %1 and %3', [12, 43, '15352']);
      let b = _t('Some %1 more %2 text', ['string placeholder', 123]);
      return { a, b };
    }

    let extracted = getExtractedStrings(simple);
    assert.equal(Object.keys(extracted).length, 2);
    assert.equal(extracted['Some %2 text %1 and %3'].type, 'single');
    assert.equal(extracted['Some %2 text %1 and %3'].context, undefined);
    assert.equal(extracted['Some %2 text %1 and %3'].entry, 'Some %2 text %1 and %3');
    assert.equal(extracted['Some %1 more %2 text'].type, 'single');
    assert.equal(extracted['Some %1 more %2 text'].context, undefined);
    assert.equal(extracted['Some %1 more %2 text'].entry, 'Some %1 more %2 text');
  });

  it('Extracts strings with valid macro placeholders', () => {
    function simple() {
      let a = _t('Some text %{Macro param1}');
      let b = _t('Some more %{Macro param2} text');
      return { a, b };
    }

    let extracted = getExtractedStrings(simple);
    assert.equal(Object.keys(extracted).length, 2);
    assert.equal(extracted['Some text %{Macro param1}'].type, 'single');
    assert.equal(extracted['Some text %{Macro param1}'].context, undefined);
    assert.equal(extracted['Some text %{Macro param1}'].entry, 'Some text %{Macro param1}');
    assert.equal(extracted['Some more %{Macro param2} text'].type, 'single');
    assert.equal(extracted['Some more %{Macro param2} text'].context, undefined);
    assert.equal(extracted['Some more %{Macro param2} text'].entry, 'Some more %{Macro param2} text');
  });

  it('Fails to extract invalid count of placeholders', () => {
    function simpleInvalid() {
      let a = _t('Some text %1 and more text %2 ololo', [12, 23, 34]); // placeholders count mismatch
      return a;
    }

    let errors: string[] = [];
    let extracted = getExtractedStrings(simpleInvalid, (m: string, _i: IdentInfo) => { errors.push(m); });
    assert.equal(errors.length, 1);
    assert.equal(Object.keys(extracted), 0);
  });

  it('Extracts comments', () => {
    let simple = `
      let b;
      //; Some comment
      let a = _t('Some text and more text ololo');
      return a;
    `;

    let extracted = getExtractedStrings(simple);
    assert.equal(Object.keys(extracted).length, 1);
    assert.equal(extracted['Some text and more text ololo'].type, 'single');
    assert.equal(extracted['Some text and more text ololo'].context, undefined);
    assert.equal(extracted['Some text and more text ololo'].entry, 'Some text and more text ololo');
    assert.equal(extracted['Some text and more text ololo'].comments[0], 'Some comment');
  });

  it('Extracts TSX comments', () => {
    let simpleTsx = `
      let a = <div>
        {/*; Some tsx comment */}
        {_t('Some text and more text ololo')}
      </div>;
      return a;
    `;

    let extracted = getExtractedStrings(simpleTsx);
    assert.equal(Object.keys(extracted).length, 1);
    assert.equal(extracted['Some text and more text ololo'].type, 'single');
    assert.equal(extracted['Some text and more text ololo'].context, undefined);
    assert.equal(extracted['Some text and more text ololo'].entry, 'Some text and more text ololo');
    assert.equal(extracted['Some text and more text ololo'].comments[0], 'Some tsx comment');
  });
});
