import * as assert from 'assert';
import { getExtractedStrings } from './util';
import { IdentInfo, _nt } from '../src/types';

describe('Test plural extraction', () => {
  it('Extracts plural strings', () => {
    function simple() {
      let n = 1;
      let a = _nt(['Some text', 'Some texts', 'Some teksty'], n);
      let b = _nt(['Some more text', 'Some more texts', 'Some more teksty'], n);
      return { a, b };
    }

    let extracted = getExtractedStrings(simple);
    assert.equal(Object.keys(extracted).length, 2);
    let [t1, t2] = Object.keys(extracted);
    assert.equal(extracted[t1].type, 'plural');
    assert.equal(extracted[t1].context, undefined);
    assert.equal(extracted[t1].entry[0], 'Some text');
    assert.equal(extracted[t1].entry[1], 'Some texts');
    assert.equal(extracted[t1].entry[2], 'Some teksty');
    assert.equal(extracted[t2].type, 'plural');
    assert.equal(extracted[t2].context, undefined);
    assert.equal(extracted[t2].entry[0], 'Some more text');
    assert.equal(extracted[t2].entry[1], 'Some more texts');
    assert.equal(extracted[t2].entry[2], 'Some more teksty');
  });

  it('Extracts plural strings with valid simple placeholders', () => {
    function simple() {
      let n = 1;
      let a = _nt(['Some %% text', 'Some %% texts', 'Some %% teksty'], n);
      let b = _nt([
        'Some %% %2 more %1 text',
        'Some %% %2 more %1 texts',
        'Some %% %2 more %1 teksty'
      ], n, n, 'some string');
      return { a, b };
    }

    let extracted = getExtractedStrings(simple);
    assert.equal(Object.keys(extracted).length, 2);
    let [t1, t2] = Object.keys(extracted);
    assert.equal(extracted[t1].type, 'plural');
    assert.equal(extracted[t1].context, undefined);
    assert.equal(extracted[t1].entry[0], 'Some %% text');
    assert.equal(extracted[t1].entry[1], 'Some %% texts');
    assert.equal(extracted[t1].entry[2], 'Some %% teksty');
    assert.equal(extracted[t2].type, 'plural');
    assert.equal(extracted[t2].context, undefined);
    assert.equal(extracted[t2].entry[0], 'Some %% %2 more %1 text');
    assert.equal(extracted[t2].entry[1], 'Some %% %2 more %1 texts');
    assert.equal(extracted[t2].entry[2], 'Some %% %2 more %1 teksty');
  });

  it('Fails to extract invalid placeholders', () => {
    function simpleInvalid() {
      let a = _nt([
        'Some text %1 and more text %2 ololo',
        'Some texts %1 and more texts %2 ololo',
        'Some texty %1 and more texty %2 ololo',
      ], 12, 23, 34, 45); // placeholders count mismatch
      return a;
    }

    let errors: string[] = [];
    let extracted = getExtractedStrings(simpleInvalid, (m: string, _i: IdentInfo) => { errors.push(m); });
    assert.equal(errors.length, 1);
    assert.equal(Object.keys(extracted), 0);
  });
});

