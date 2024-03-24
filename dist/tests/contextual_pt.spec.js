"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var assert = tslib_1.__importStar(require("assert"));
var util_1 = require("./util");
var src_1 = require("../src/");
describe('Test contextual extraction', function () {
    beforeEach(function () { return (0, src_1.overridePanic)(); });
    it('Extracts same string with different contexts', function () {
        var func = "\n    function simple() {\n      const a = _pt('ctx', 'Some text');\n      const b = _pt('ctx2', 'Some text');\n      return { a, b };\n    }";
        var extracted = (0, util_1.getExtractedStrings)(func);
        assert.strictEqual(Object.keys(extracted).length, 2);
        var _a = Object.keys(extracted), t1 = _a[0], t2 = _a[1];
        assert.strictEqual(extracted[t1].type, 'single');
        assert.strictEqual(extracted[t1].context, 'ctx');
        assert.strictEqual(extracted[t1].entry, 'Some text');
        assert.strictEqual(extracted[t2].type, 'single');
        assert.strictEqual(extracted[t2].context, 'ctx2');
        assert.strictEqual(extracted[t2].entry, 'Some text');
    });
    it('Extracts strings with valid simple placeholders', function () {
        var func = "\n    function simple() {\n      let a = _pt('ctx', 'Some text %1', [12 + 12]); // numeric binary expression\n      a = _pt('ctx', 'Some next text %1', [-12]); // numeric unary expression\n      a = _pt('ctx', 'Some more next text %1', [12]); // numeric literal\n      const b = _pt('ctx', 'Some %1 more text', ['string placeholder']); // string literal\n      let c = _pt('ctx', '%1 more text', [a]); // variable\n      c = _pt('ctx', '%1 more next text', [a ? '123' : '431']); // ternary expression\n      c = _pt('ctx', 'more %1 more', [Date.now()]); // call expression\n      return { a, b, c };\n    }";
        var extracted = (0, util_1.getExtractedStrings)(func);
        assert.strictEqual(Object.keys(extracted).length, 7);
        var _a = Object.keys(extracted), t1 = _a[0], t2 = _a[1], t3 = _a[2], t4 = _a[3], t5 = _a[4], t6 = _a[5], t7 = _a[6];
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
    it('Extracts strings with many placeholders', function () {
        var func = "\n    function simple() {\n      const a = _pt('ctx', 'Some %2 text %1 and %3', [12, 43, '15352']);\n      const b = _pt('ctx', 'Some %1 more %2 text', ['string placeholder', 123]);\n      return { a, b };\n    }";
        var extracted = (0, util_1.getExtractedStrings)(func);
        assert.strictEqual(Object.keys(extracted).length, 2);
        var _a = Object.keys(extracted), t1 = _a[0], t2 = _a[1];
        assert.strictEqual(extracted[t1].type, 'single');
        assert.strictEqual(extracted[t1].context, 'ctx');
        assert.strictEqual(extracted[t1].entry, 'Some %2 text %1 and %3');
        assert.strictEqual(extracted[t2].type, 'single');
        assert.strictEqual(extracted[t2].context, 'ctx');
        assert.strictEqual(extracted[t2].entry, 'Some %1 more %2 text');
    });
    it('Fails to extract invalid placeholders', function () {
        var func = "\n    function simpleInvalid() {\n      const a = _pt('ctx', 'Some text %1 and more text %2 ololo', [12, 23, 34]); // placeholders count mismatch\n      return a;\n    }";
        var errors = [];
        var extracted = (0, util_1.getExtractedStrings)(func, function (m, _i) { errors.push(m); });
        assert.strictEqual(errors.length, 1);
        assert.strictEqual(Object.keys(extracted).length, 0);
    });
    it('Extracts comments', function () {
        var _a;
        var simple = "\n      //; Some comment\n      const a = _pt('ctx', 'Some text and more text ololo');\n      return a;\n    ";
        var extracted = (0, util_1.getExtractedStrings)(simple);
        assert.strictEqual(Object.keys(extracted).length, 1);
        var t1 = Object.keys(extracted)[0];
        assert.strictEqual(extracted[t1].type, 'single');
        assert.strictEqual(extracted[t1].context, 'ctx');
        assert.strictEqual(extracted[t1].entry, 'Some text and more text ololo');
        assert.strictEqual((_a = extracted[t1].comments) === null || _a === void 0 ? void 0 : _a[0], 'Some comment');
    });
    it('Extracts TSX comments', function () {
        var _a;
        var simpleTsx = "\n      const a = <div>\n        {/*; Some tsx comment */}\n        {_pt('ctx', 'Some text and more text ololo')}\n      </div>;\n      return a;\n    ";
        var extracted = (0, util_1.getExtractedStrings)(simpleTsx);
        assert.strictEqual(Object.keys(extracted).length, 1);
        var t1 = Object.keys(extracted)[0];
        assert.strictEqual(extracted[t1].type, 'single');
        assert.strictEqual(extracted[t1].context, 'ctx');
        assert.strictEqual(extracted[t1].entry, 'Some text and more text ololo');
        assert.strictEqual((_a = extracted[t1].comments) === null || _a === void 0 ? void 0 : _a[0], 'Some tsx comment');
    });
});
//# sourceMappingURL=contextual_pt.spec.js.map