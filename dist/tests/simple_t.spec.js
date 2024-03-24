"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var assert = tslib_1.__importStar(require("assert"));
var util_1 = require("./util");
describe('Test simple extraction', function () {
    it('Extracts strings', function () {
        var func = "\n    function simple() {\n      const a = _t('Some text');\n      const b = _t('Some more text');\n      return { a, b };\n    }";
        var extracted = (0, util_1.getExtractedStrings)(func);
        assert.strictEqual(Object.keys(extracted).length, 2);
        assert.strictEqual(extracted['Some text'].type, 'single');
        assert.strictEqual(extracted['Some text'].context, undefined);
        assert.strictEqual(extracted['Some text'].entry, 'Some text');
        assert.strictEqual(extracted['Some more text'].type, 'single');
        assert.strictEqual(extracted['Some more text'].context, undefined);
        assert.strictEqual(extracted['Some more text'].entry, 'Some more text');
    });
    it('Extracts strings from complex syntax context', function () {
        var func = "\n    function simple() {\n      const i18n = { _t };\n      function func(_a: any) { return _a; }\n      const a = func({\n        k0: 'some untranslated',\n        k1: i18n._t('Some text'),\n        k2: i18n._t('Some more text')\n      });\n      return a;\n    }";
        var extracted = (0, util_1.getExtractedStrings)(func);
        assert.strictEqual(Object.keys(extracted).length, 2);
        assert.strictEqual(extracted['Some text'].type, 'single');
        assert.strictEqual(extracted['Some text'].context, undefined);
        assert.strictEqual(extracted['Some text'].entry, 'Some text');
        assert.strictEqual(extracted['Some more text'].type, 'single');
        assert.strictEqual(extracted['Some more text'].context, undefined);
        assert.strictEqual(extracted['Some more text'].entry, 'Some more text');
    });
    it('Extracts strings with valid simple placeholders of different types', function () {
        var func = "\n    function simple() {\n      let a = _t('Some text %1', [12 + 12]); // numeric binary expression\n      a = _t('Some next text %1', [-12]); // numeric unary expression\n      a = _t('Some more next text %1', [12]); // numeric literal\n      const b = _t('Some %1 more text', ['string placeholder']); // string literal\n      let c = _t('%1 more text', [a]); // variable\n      c = _t('%1 more next text', [a ? '123' : '431']); // ternary expression\n      c = _t('more %1 more', [Date.now()]); // call expression\n      return { a, b, c };\n    }";
        var extracted = (0, util_1.getExtractedStrings)(func);
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
    it('Extracts strings with many placeholders', function () {
        var func = "\n    function simple() {\n      const a = _t('Some %2 text %1 and %3', [12, 43, '15352']);\n      const b = _t('Some %1 more %2 text', ['string placeholder', 123]);\n      return { a, b };\n    }";
        var extracted = (0, util_1.getExtractedStrings)(func);
        assert.strictEqual(Object.keys(extracted).length, 2);
        assert.strictEqual(extracted['Some %2 text %1 and %3'].type, 'single');
        assert.strictEqual(extracted['Some %2 text %1 and %3'].context, undefined);
        assert.strictEqual(extracted['Some %2 text %1 and %3'].entry, 'Some %2 text %1 and %3');
        assert.strictEqual(extracted['Some %1 more %2 text'].type, 'single');
        assert.strictEqual(extracted['Some %1 more %2 text'].context, undefined);
        assert.strictEqual(extracted['Some %1 more %2 text'].entry, 'Some %1 more %2 text');
    });
    it('Extracts strings with valid macro placeholders', function () {
        var func = "\n    function simple() {\n      const a = _t('Some text %{Macro param1}');\n      const b = _t('Some more %{Macro param2} text');\n      return { a, b };\n    }";
        var extracted = (0, util_1.getExtractedStrings)(func);
        assert.strictEqual(Object.keys(extracted).length, 2);
        assert.strictEqual(extracted['Some text %{Macro param1}'].type, 'single');
        assert.strictEqual(extracted['Some text %{Macro param1}'].context, undefined);
        assert.strictEqual(extracted['Some text %{Macro param1}'].entry, 'Some text %{Macro param1}');
        assert.strictEqual(extracted['Some more %{Macro param2} text'].type, 'single');
        assert.strictEqual(extracted['Some more %{Macro param2} text'].context, undefined);
        assert.strictEqual(extracted['Some more %{Macro param2} text'].entry, 'Some more %{Macro param2} text');
    });
    it('Fails to extract invalid count of placeholders', function () {
        var func = "\n    function simpleInvalid() {\n      const a = _t('Some text %1 and more text %2 ololo', [12, 23, 34]); // placeholders count mismatch\n      return a;\n    }";
        var errors = [];
        var extracted = (0, util_1.getExtractedStrings)(func, function (m, _i) { errors.push(m); });
        assert.strictEqual(errors.length, 1);
        assert.strictEqual(Object.keys(extracted).length, 0);
    });
    it('Extracts comments', function () {
        var _a;
        var simple = "\n      const b;\n      //; Some comment\n      const a = _t('Some text and more text ololo');\n      return a;\n    ";
        var extracted = (0, util_1.getExtractedStrings)(simple);
        assert.strictEqual(Object.keys(extracted).length, 1);
        assert.strictEqual(extracted['Some text and more text ololo'].type, 'single');
        assert.strictEqual(extracted['Some text and more text ololo'].context, undefined);
        assert.strictEqual(extracted['Some text and more text ololo'].entry, 'Some text and more text ololo');
        assert.strictEqual((_a = extracted['Some text and more text ololo'].comments) === null || _a === void 0 ? void 0 : _a[0], 'Some comment');
    });
    it('Extracts TSX comments', function () {
        var _a;
        var simpleTsx = "\n      const a = <div>\n        {/*; Some tsx comment */}\n        {_t('Some text and more text ololo')}\n      </div>;\n      return a;\n    ";
        var extracted = (0, util_1.getExtractedStrings)(simpleTsx);
        assert.strictEqual(Object.keys(extracted).length, 1);
        assert.strictEqual(extracted['Some text and more text ololo'].type, 'single');
        assert.strictEqual(extracted['Some text and more text ololo'].context, undefined);
        assert.strictEqual(extracted['Some text and more text ololo'].entry, 'Some text and more text ololo');
        assert.strictEqual((_a = extracted['Some text and more text ololo'].comments) === null || _a === void 0 ? void 0 : _a[0], 'Some tsx comment');
    });
});
//# sourceMappingURL=simple_t.spec.js.map