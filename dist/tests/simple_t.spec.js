import * as assert from 'assert';
import { getExtractedStrings } from './util';
describe('Test simple extraction', () => {
    it('Extracts strings', () => {
        const func = `
    function simple() {
      const a = _t('Some text');
      const b = _t('Some more text');
      return { a, b };
    }`;
        const extracted = getExtractedStrings(func);
        assert.strictEqual(Object.keys(extracted).length, 2);
        assert.strictEqual(extracted['Some text'].type, 'single');
        assert.strictEqual(extracted['Some text'].context, undefined);
        assert.strictEqual(extracted['Some text'].entry, 'Some text');
        assert.strictEqual(extracted['Some more text'].type, 'single');
        assert.strictEqual(extracted['Some more text'].context, undefined);
        assert.strictEqual(extracted['Some more text'].entry, 'Some more text');
    });
    it('Extracts strings from complex syntax context', () => {
        const func = `
    function simple() {
      const i18n = { _t };
      function func(_a: any) { return _a; }
      const a = func({
        k0: 'some untranslated',
        k1: i18n._t('Some text'),
        k2: i18n._t('Some more text')
      });
      return a;
    }`;
        const extracted = getExtractedStrings(func);
        assert.strictEqual(Object.keys(extracted).length, 2);
        assert.strictEqual(extracted['Some text'].type, 'single');
        assert.strictEqual(extracted['Some text'].context, undefined);
        assert.strictEqual(extracted['Some text'].entry, 'Some text');
        assert.strictEqual(extracted['Some more text'].type, 'single');
        assert.strictEqual(extracted['Some more text'].context, undefined);
        assert.strictEqual(extracted['Some more text'].entry, 'Some more text');
    });
    it('Extracts strings with valid simple placeholders of different types', () => {
        const func = `
    function simple() {
      let a = _t('Some text %1', [12 + 12]); // numeric binary expression
      a = _t('Some next text %1', [-12]); // numeric unary expression
      a = _t('Some more next text %1', [12]); // numeric literal
      const b = _t('Some %1 more text', ['string placeholder']); // string literal
      let c = _t('%1 more text', [a]); // variable
      c = _t('%1 more next text', [a ? '123' : '431']); // ternary expression
      c = _t('more %1 more', [Date.now()]); // call expression
      return { a, b, c };
    }`;
        const extracted = getExtractedStrings(func);
        assert.strictEqual(Object.keys(extracted).length, 7);
        assert.strictEqual(extracted['Some text %1'].type, 'single');
        assert.strictEqual(extracted['Some text %1'].context, undefined);
        assert.strictEqual(extracted['Some text %1'].entry, 'Some text %1');
        assert.strictEqual(extracted['Some next text %1'].entry, 'Some next text %1');
        assert.strictEqual(extracted['Some more next text %1'].entry, 'Some more next text %1');
        assert.strictEqual(extracted['Some %1 more text'].entry, 'Some %1 more text');
        assert.strictEqual(extracted['%1 more text'].entry, '%1 more text');
        assert.strictEqual(extracted['%1 more next text'].entry, '%1 more next text');
        assert.strictEqual(extracted['more %1 more'].entry, 'more %1 more');
    });
    it('Extracts strings with many placeholders', () => {
        const func = `
    function simple() {
      const a = _t('Some %2 text %1 and %3', [12, 43, '15352']);
      const b = _t('Some %1 more %2 text', ['string placeholder', 123]);
      return { a, b };
    }`;
        const extracted = getExtractedStrings(func);
        assert.strictEqual(Object.keys(extracted).length, 2);
        assert.strictEqual(extracted['Some %2 text %1 and %3'].type, 'single');
        assert.strictEqual(extracted['Some %2 text %1 and %3'].context, undefined);
        assert.strictEqual(extracted['Some %2 text %1 and %3'].entry, 'Some %2 text %1 and %3');
        assert.strictEqual(extracted['Some %1 more %2 text'].type, 'single');
        assert.strictEqual(extracted['Some %1 more %2 text'].context, undefined);
        assert.strictEqual(extracted['Some %1 more %2 text'].entry, 'Some %1 more %2 text');
    });
    it('Extracts strings with valid macro placeholders', () => {
        const func = `
    function simple() {
      const a = _t('Some text %{Macro param1}');
      const b = _t('Some more %{Macro param2} text');
      return { a, b };
    }`;
        const extracted = getExtractedStrings(func);
        assert.strictEqual(Object.keys(extracted).length, 2);
        assert.strictEqual(extracted['Some text %{Macro param1}'].type, 'single');
        assert.strictEqual(extracted['Some text %{Macro param1}'].context, undefined);
        assert.strictEqual(extracted['Some text %{Macro param1}'].entry, 'Some text %{Macro param1}');
        assert.strictEqual(extracted['Some more %{Macro param2} text'].type, 'single');
        assert.strictEqual(extracted['Some more %{Macro param2} text'].context, undefined);
        assert.strictEqual(extracted['Some more %{Macro param2} text'].entry, 'Some more %{Macro param2} text');
    });
    it('Fails to extract invalid count of placeholders', () => {
        const func = `
    function simpleInvalid() {
      const a = _t('Some text %1 and more text %2 ololo', [12, 23, 34]); // placeholders count mismatch
      return a;
    }`;
        const errors = [];
        const extracted = getExtractedStrings(func, (m, _i) => { errors.push(m); });
        assert.strictEqual(errors.length, 1);
        assert.strictEqual(Object.keys(extracted).length, 0);
    });
    it('Extracts comments', () => {
        const simple = `
      const b;
      //; Some comment
      const a = _t('Some text and more text ololo');
      return a;
    `;
        const extracted = getExtractedStrings(simple);
        assert.strictEqual(Object.keys(extracted).length, 1);
        assert.strictEqual(extracted['Some text and more text ololo'].type, 'single');
        assert.strictEqual(extracted['Some text and more text ololo'].context, undefined);
        assert.strictEqual(extracted['Some text and more text ololo'].entry, 'Some text and more text ololo');
        assert.strictEqual(extracted['Some text and more text ololo'].comments?.[0], 'Some comment');
    });
    it('Extracts TSX comments', () => {
        const simpleTsx = `
      const a = <div>
        {/*; Some tsx comment */}
        {_t('Some text and more text ololo')}
      </div>;
      return a;
    `;
        const extracted = getExtractedStrings(simpleTsx);
        assert.strictEqual(Object.keys(extracted).length, 1);
        assert.strictEqual(extracted['Some text and more text ololo'].type, 'single');
        assert.strictEqual(extracted['Some text and more text ololo'].context, undefined);
        assert.strictEqual(extracted['Some text and more text ololo'].entry, 'Some text and more text ololo');
        assert.strictEqual(extracted['Some text and more text ololo'].comments?.[0], 'Some tsx comment');
    });
});
//# sourceMappingURL=simple_t.spec.js.map