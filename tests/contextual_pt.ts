import * as assert from 'assert';
import { getExtractedStrings } from './util';
import { overridePanic } from '../src/';
import { IdentInfo, _pt } from '../src/types';

describe('Test contextual extraction', () => {
  beforeEach(() => overridePanic());

  it('Extracts same string with different contexts', () => {
    function simple() {
      let a = _pt('ctx', 'Some text');
      let b = _pt('ctx2', 'Some text');
      return { a, b };
    }

    let extracted = getExtractedStrings(simple);
    assert.equal(Object.keys(extracted).length, 2);
    let [t1, t2] = Object.keys(extracted);
    assert.equal(extracted[t1].type, 'single');
    assert.equal(extracted[t1].context, 'ctx');
    assert.equal(extracted[t1].entry, 'Some text');
    assert.equal(extracted[t2].type, 'single');
    assert.equal(extracted[t2].context, 'ctx2');
    assert.equal(extracted[t2].entry, 'Some text');
  });

  it('Extracts strings with valid simple placeholders', () => {
    function simple() {
      let a = _pt('ctx', 'Some text %1', [12 + 12]); // numeric binary expression
      a = _pt('ctx', 'Some next text %1', [-12]); // numeric unary expression
      a = _pt('ctx', 'Some more next text %1', [12]); // numeric literal
      let b = _pt('ctx', 'Some %1 more text', ['string placeholder']); // string literal
      let c = _pt('ctx', '%1 more text', [a]); // variable
      c = _pt('ctx', '%1 more next text', [a ? '123' : '431']); // ternary expression
      c = _pt('ctx', 'more %1 more', [Date.now()]); // call expression
      return { a, b, c };
    }

    let extracted = getExtractedStrings(simple);
    assert.equal(Object.keys(extracted).length, 7);
    let [t1, t2, t3, t4, t5, t6, t7] = Object.keys(extracted);
    assert.equal(extracted[t1].type, 'single');
    assert.equal(extracted[t1].context, 'ctx');
    assert.equal(extracted[t1].entry, 'Some text %1');
    assert.equal(extracted[t2].entry, 'Some next text %1');
    assert.equal(extracted[t3].entry, 'Some more next text %1');
    assert.equal(extracted[t4].entry, 'Some %1 more text');
    assert.equal(extracted[t5].entry, '%1 more text');
    assert.equal(extracted[t6].entry, '%1 more next text');
    assert.equal(extracted[t7].entry, 'more %1 more');
  });

  it('Extracts strings with many placeholders', () => {
    function simple() {
      let a = _pt('ctx', 'Some %2 text %1 and %3', [12, 43, '15352']);
      let b = _pt('ctx', 'Some %1 more %2 text', ['string placeholder', 123]);
      return { a, b };
    }

    let extracted = getExtractedStrings(simple);
    assert.equal(Object.keys(extracted).length, 2);
    let [t1, t2] = Object.keys(extracted);
    assert.equal(extracted[t1].type, 'single');
    assert.equal(extracted[t1].context, 'ctx');
    assert.equal(extracted[t1].entry, 'Some %2 text %1 and %3');
    assert.equal(extracted[t2].type, 'single');
    assert.equal(extracted[t2].context, 'ctx');
    assert.equal(extracted[t2].entry, 'Some %1 more %2 text');
  });

  it('Fails to extract invalid placeholders', () => {
    function simpleInvalid() {
      let a = _pt('ctx', 'Some text %1 and more text %2 ololo', [12, 23, 34]); // placeholders count mismatch
      return a;
    }

    let errors: string[] = [];
    let extracted = getExtractedStrings(simpleInvalid, (m: string, _i: IdentInfo) => { errors.push(m); });
    assert.equal(errors.length, 1);
    assert.equal(Object.keys(extracted), 0);
  });

  it('Extracts comments', () => {
    const simple = `
      //; Some comment
      let a = _pt('ctx', 'Some text and more text ololo');
      return a;
    `;

    let extracted = getExtractedStrings(simple);
    assert.equal(Object.keys(extracted).length, 1);
    let [t1] = Object.keys(extracted);
    assert.equal(extracted[t1].type, 'single');
    assert.equal(extracted[t1].context, 'ctx');
    assert.equal(extracted[t1].entry, 'Some text and more text ololo');
    assert.equal(extracted[t1].comments[0], 'Some comment');
  });

  it('Extracts TSX comments', () => {
    let simpleTsx = `
      let a = <div>
        {/*; Some tsx comment */}
        {_pt('ctx', 'Some text and more text ololo')}
      </div>;
      return a;
    `;

    let extracted = getExtractedStrings(simpleTsx);
    assert.equal(Object.keys(extracted).length, 1);
    let [t1] = Object.keys(extracted);
    assert.equal(extracted[t1].type, 'single');
    assert.equal(extracted[t1].context, 'ctx');
    assert.equal(extracted[t1].entry, 'Some text and more text ololo');
    assert.equal(extracted[t1].comments[0], 'Some tsx comment');
  });

});

