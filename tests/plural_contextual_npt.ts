import * as assert from 'assert';
import { getExtractedStrings } from './util';
import { IdentInfo, _npt } from '../src/types';

describe('Test plural extraction', () => {
  it('Extracts same plural strings with different contexts', () => {
    function simple() {
      let n = 1;
      let a = _npt('ctx1', ['Some text', 'Some texts', 'Some teksty'], n);
      let b = _npt('ctx2', ['Some text', 'Some texts', 'Some teksty'], n);
      return { a, b };
    }

    let extracted = getExtractedStrings(simple);
    assert.equal(Object.keys(extracted).length, 2);
    let [t1, t2] = Object.keys(extracted);
    assert.equal(extracted[t1].type, 'plural');
    assert.equal(extracted[t1].context, 'ctx1');
    assert.equal(extracted[t1].entry[0], 'Some text');
    assert.equal(extracted[t1].entry[1], 'Some texts');
    assert.equal(extracted[t1].entry[2], 'Some teksty');
    assert.equal(extracted[t2].type, 'plural');
    assert.equal(extracted[t2].context, 'ctx2');
    assert.equal(extracted[t2].entry[0], 'Some text');
    assert.equal(extracted[t2].entry[1], 'Some texts');
    assert.equal(extracted[t2].entry[2], 'Some teksty');
  });

  it('Extracts plural strings with valid simple placeholders', () => {
    function simple() {
      let n = 1;
      let a = _npt('ctx1', ['Some %% text', 'Some %% texts', 'Some %% teksty'], n);
      let b = _npt('ctx2', [
        'Some %% %2 more %1 text',
        'Some %% %2 more %1 texts',
        'Some %% %2 more %1 teksty'
      ], n, [n, 'some string']);
      return { a, b };
    }

    let extracted = getExtractedStrings(simple);
    assert.equal(Object.keys(extracted).length, 2);
    let [t1, t2] = Object.keys(extracted);
    assert.equal(extracted[t1].type, 'plural');
    assert.equal(extracted[t1].context, 'ctx1');
    assert.equal(extracted[t1].entry[0], 'Some %% text');
    assert.equal(extracted[t1].entry[1], 'Some %% texts');
    assert.equal(extracted[t1].entry[2], 'Some %% teksty');
    assert.equal(extracted[t2].type, 'plural');
    assert.equal(extracted[t2].context, 'ctx2');
    assert.equal(extracted[t2].entry[0], 'Some %% %2 more %1 text');
    assert.equal(extracted[t2].entry[1], 'Some %% %2 more %1 texts');
    assert.equal(extracted[t2].entry[2], 'Some %% %2 more %1 teksty');
  });

  it('Fails to extract invalid placeholders', () => {
    function simpleInvalid() {
      let a = _npt('ctx', [
        'Some text %1 and more text %2 ololo',
        'Some texts %1 and more texts %2 ololo',
        'Some texty %1 and more texty %2 ololo',
      ], 12, [23, 34, 45]); // placeholders count mismatch
      return a;
    }

    let errors: string[] = [];
    let extracted = getExtractedStrings(simpleInvalid, (m: string, _i: IdentInfo) => { errors.push(m); });
    assert.equal(errors.length, 1);
    assert.equal(Object.keys(extracted), 0);
  });

  it('Extracts comments', () => {
    function simple() {
      //; Some comment
      let a = _npt('ctx', [
        'Some text %1 and more text ololo',
        'Some texts %1 and more text ololo',
        'Some texty %1 and more text ololo',
      ], 11, []);
      return a;
    }

    let extracted = getExtractedStrings(simple);
    assert.equal(Object.keys(extracted).length, 1);
    let [t1] = Object.keys(extracted);
    assert.equal(extracted[t1].type, 'plural');
    assert.equal(extracted[t1].context, 'ctx');
    assert.equal(extracted[t1].comment, 'Some comment');
  });

  it('Extracts TSX comments', () => {
    let simpleTsx = `
      let a = <div>
        {/*; Some tsx comment */}
        {_npt('ctx', [
        'Some text %1 and more text ololo',
        'Some texts %1 and more text ololo',
        'Some texty %1 and more text ololo',
      ], 11, [])}
      </div>;
      return a;
    `;

    let extracted = getExtractedStrings(simpleTsx);
    assert.equal(Object.keys(extracted).length, 1);
    let [t1] = Object.keys(extracted);
    assert.equal(extracted[t1].type, 'plural');
    assert.equal(extracted[t1].context, 'ctx');
    assert.equal(extracted[t1].comment, 'Some tsx comment');
  });
});

