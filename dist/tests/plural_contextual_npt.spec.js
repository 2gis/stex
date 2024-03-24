import * as assert from 'assert';
import { getExtractedStrings } from './util';
describe('Test plural extraction', () => {
    it('Extracts same plural strings with different contexts', () => {
        const func = `
    function simple() {
      const n = 1;
      const a = _npt('ctx1', ['Some text', 'Some texts', 'Some teksty'], n);
      const b = _npt('ctx2', ['Some text', 'Some texts', 'Some teksty'], n);
      return { a, b };
    }`;
        const extracted = getExtractedStrings(func);
        assert.strictEqual(Object.keys(extracted).length, 2);
        const [t1, t2] = Object.keys(extracted);
        assert.strictEqual(extracted[t1].type, 'plural');
        assert.strictEqual(extracted[t1].context, 'ctx1');
        assert.strictEqual(extracted[t1].entry[0], 'Some text');
        assert.strictEqual(extracted[t1].entry[1], 'Some teksty'); // last form
        assert.strictEqual(extracted[t2].type, 'plural');
        assert.strictEqual(extracted[t2].context, 'ctx2');
        assert.strictEqual(extracted[t2].entry[0], 'Some text');
        assert.strictEqual(extracted[t2].entry[1], 'Some teksty'); // last form
    });
    it('Extracts plural strings with valid simple placeholders', () => {
        const func = `
    function simple() {
      const n = 1;
      const a = _npt('ctx1', ['Some %% text', 'Some %% texts', 'Some %% teksty'], n);
      const b = _npt('ctx2', [
        'Some %% %2 more %1 text',
        'Some %% %2 more %1 texts',
        'Some %% %2 more %1 teksty'
      ], n, [n, 'some string']);
      return { a, b };
    }`;
        const extracted = getExtractedStrings(func);
        assert.strictEqual(Object.keys(extracted).length, 2);
        const [t1, t2] = Object.keys(extracted);
        assert.strictEqual(extracted[t1].type, 'plural');
        assert.strictEqual(extracted[t1].context, 'ctx1');
        assert.strictEqual(extracted[t1].entry[0], 'Some %% text');
        assert.strictEqual(extracted[t1].entry[1], 'Some %% teksty'); // last form
        assert.strictEqual(extracted[t2].type, 'plural');
        assert.strictEqual(extracted[t2].context, 'ctx2');
        assert.strictEqual(extracted[t2].entry[0], 'Some %% %2 more %1 text');
        assert.strictEqual(extracted[t2].entry[1], 'Some %% %2 more %1 teksty'); // last form
    });
    it('Fails to extract invalid placeholders', () => {
        const func = `
    function simpleInvalid() {
      const a = _npt('ctx', [
        'Some text %1 and more text %2 ololo',
        'Some texts %1 and more texts %2 ololo',
        'Some texty %1 and more texty %2 ololo',
      ], 12, [23, 34, 45]); // placeholders count mismatch
      return a;
    }
    `;
        const errors = [];
        const extracted = getExtractedStrings(func, (m, _i) => { errors.push(m); });
        assert.strictEqual(errors.length, 1);
        assert.strictEqual(Object.keys(extracted).length, 0);
    });
    it('Extracts comments', () => {
        const simple = `
      //; Some comment
      const a = _npt('ctx', [
        'Some text %1 and more text ololo',
        'Some texts %1 and more text ololo',
        'Some texty %1 and more text ololo',
      ], 11, ['321']);
      return a;
    `;
        const extracted = getExtractedStrings(simple);
        assert.strictEqual(Object.keys(extracted).length, 1);
        const [t1] = Object.keys(extracted);
        assert.strictEqual(extracted[t1].type, 'plural');
        assert.strictEqual(extracted[t1].context, 'ctx');
        assert.strictEqual(extracted[t1].comments?.[0], 'Some comment');
    });
    it('Extracts TSX comments', () => {
        const simpleTsx = `
      const a = <div>
        {/*; Some tsx comment */}
        {_npt('ctx', [
        'Some text %1 and more text ololo',
        'Some texts %1 and more text ololo',
        'Some texty %1 and more text ololo',
      ], 11, ['321'])}
      </div>;
      return a;
    `;
        const extracted = getExtractedStrings(simpleTsx);
        assert.strictEqual(Object.keys(extracted).length, 1);
        const [t1] = Object.keys(extracted);
        assert.strictEqual(extracted[t1].type, 'plural');
        assert.strictEqual(extracted[t1].context, 'ctx');
        assert.strictEqual(extracted[t1].comments?.[0], 'Some tsx comment');
    });
});
//# sourceMappingURL=plural_contextual_npt.spec.js.map