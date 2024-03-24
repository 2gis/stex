import * as assert from 'assert';
import { getExtractedStrings } from './util';
import { overridePanic } from '../src/';
describe('Test contextual extraction', () => {
    beforeEach(() => overridePanic());
    it('Extracts same string with different contexts', () => {
        const func = `
    function simple() {
      const a = _pt('ctx', 'Some text');
      const b = _pt('ctx2', 'Some text');
      return { a, b };
    }`;
        const extracted = getExtractedStrings(func);
        assert.strictEqual(Object.keys(extracted).length, 2);
        const [t1, t2] = Object.keys(extracted);
        assert.strictEqual(extracted[t1].type, 'single');
        assert.strictEqual(extracted[t1].context, 'ctx');
        assert.strictEqual(extracted[t1].entry, 'Some text');
        assert.strictEqual(extracted[t2].type, 'single');
        assert.strictEqual(extracted[t2].context, 'ctx2');
        assert.strictEqual(extracted[t2].entry, 'Some text');
    });
    it('Extracts strings with valid simple placeholders', () => {
        const func = `
    function simple() {
      let a = _pt('ctx', 'Some text %1', [12 + 12]); // numeric binary expression
      a = _pt('ctx', 'Some next text %1', [-12]); // numeric unary expression
      a = _pt('ctx', 'Some more next text %1', [12]); // numeric literal
      const b = _pt('ctx', 'Some %1 more text', ['string placeholder']); // string literal
      let c = _pt('ctx', '%1 more text', [a]); // variable
      c = _pt('ctx', '%1 more next text', [a ? '123' : '431']); // ternary expression
      c = _pt('ctx', 'more %1 more', [Date.now()]); // call expression
      return { a, b, c };
    }`;
        const extracted = getExtractedStrings(func);
        assert.strictEqual(Object.keys(extracted).length, 7);
        const [t1, t2, t3, t4, t5, t6, t7] = Object.keys(extracted);
        assert.strictEqual(extracted[t1].type, 'single');
        assert.strictEqual(extracted[t1].context, 'ctx');
        assert.strictEqual(extracted[t1].entry, 'Some text %1');
        assert.strictEqual(extracted[t2].entry, 'Some next text %1');
        assert.strictEqual(extracted[t3].entry, 'Some more next text %1');
        assert.strictEqual(extracted[t4].entry, 'Some %1 more text');
        assert.strictEqual(extracted[t5].entry, '%1 more text');
        assert.strictEqual(extracted[t6].entry, '%1 more next text');
        assert.strictEqual(extracted[t7].entry, 'more %1 more');
    });
    it('Extracts strings with many placeholders', () => {
        const func = `
    function simple() {
      const a = _pt('ctx', 'Some %2 text %1 and %3', [12, 43, '15352']);
      const b = _pt('ctx', 'Some %1 more %2 text', ['string placeholder', 123]);
      return { a, b };
    }`;
        const extracted = getExtractedStrings(func);
        assert.strictEqual(Object.keys(extracted).length, 2);
        const [t1, t2] = Object.keys(extracted);
        assert.strictEqual(extracted[t1].type, 'single');
        assert.strictEqual(extracted[t1].context, 'ctx');
        assert.strictEqual(extracted[t1].entry, 'Some %2 text %1 and %3');
        assert.strictEqual(extracted[t2].type, 'single');
        assert.strictEqual(extracted[t2].context, 'ctx');
        assert.strictEqual(extracted[t2].entry, 'Some %1 more %2 text');
    });
    it('Fails to extract invalid placeholders', () => {
        const func = `
    function simpleInvalid() {
      const a = _pt('ctx', 'Some text %1 and more text %2 ololo', [12, 23, 34]); // placeholders count mismatch
      return a;
    }`;
        const errors = [];
        const extracted = getExtractedStrings(func, (m, _i) => { errors.push(m); });
        assert.strictEqual(errors.length, 1);
        assert.strictEqual(Object.keys(extracted).length, 0);
    });
    it('Extracts comments', () => {
        const simple = `
      //; Some comment
      const a = _pt('ctx', 'Some text and more text ololo');
      return a;
    `;
        const extracted = getExtractedStrings(simple);
        assert.strictEqual(Object.keys(extracted).length, 1);
        const [t1] = Object.keys(extracted);
        assert.strictEqual(extracted[t1].type, 'single');
        assert.strictEqual(extracted[t1].context, 'ctx');
        assert.strictEqual(extracted[t1].entry, 'Some text and more text ololo');
        assert.strictEqual(extracted[t1].comments?.[0], 'Some comment');
    });
    it('Extracts TSX comments', () => {
        const simpleTsx = `
      const a = <div>
        {/*; Some tsx comment */}
        {_pt('ctx', 'Some text and more text ololo')}
      </div>;
      return a;
    `;
        const extracted = getExtractedStrings(simpleTsx);
        assert.strictEqual(Object.keys(extracted).length, 1);
        const [t1] = Object.keys(extracted);
        assert.strictEqual(extracted[t1].type, 'single');
        assert.strictEqual(extracted[t1].context, 'ctx');
        assert.strictEqual(extracted[t1].entry, 'Some text and more text ololo');
        assert.strictEqual(extracted[t1].comments?.[0], 'Some tsx comment');
    });
});
//# sourceMappingURL=contextual_pt.spec.js.map