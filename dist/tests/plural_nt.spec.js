"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var assert = tslib_1.__importStar(require("assert"));
var util_1 = require("./util");
describe('Test plural extraction', function () {
    it('Extracts plural strings', function () {
        var func = "\n    function simple() {\n      const n = 1;\n      const a = _nt(['Some text', 'Some texts', 'Some teksty'], n);\n      const b = _nt(['Some more text', 'Some more texts', 'Some more teksty'], n);\n      return { a, b };\n    }";
        var extracted = (0, util_1.getExtractedStrings)(func);
        assert.strictEqual(Object.keys(extracted).length, 2);
        var _a = Object.keys(extracted), t1 = _a[0], t2 = _a[1];
        assert.strictEqual(extracted[t1].type, 'plural');
        assert.strictEqual(extracted[t1].context, undefined);
        assert.strictEqual(extracted[t1].entry[0], 'Some text');
        assert.strictEqual(extracted[t1].entry[1], 'Some teksty'); // last form
        assert.strictEqual(extracted[t2].type, 'plural');
        assert.strictEqual(extracted[t2].context, undefined);
        assert.strictEqual(extracted[t2].entry[0], 'Some more text');
        assert.strictEqual(extracted[t2].entry[1], 'Some more teksty'); // last form
    });
    it('Extracts plural strings with expressions as parameters', function () {
        var func = "\n    function simple() {\n      const n = { a: { b: 1 } }; // nested object expression\n      const a = _nt(['Some text', 'Some texts', 'Some teksty'], n.a.b);\n      const b = _nt(['Some more text', 'Some more texts', 'Some more teksty'], n.a.b);\n      return { a, b };\n    }";
        var extracted = (0, util_1.getExtractedStrings)(func);
        assert.strictEqual(Object.keys(extracted).length, 2);
        var _a = Object.keys(extracted), t1 = _a[0], t2 = _a[1];
        assert.strictEqual(extracted[t1].type, 'plural');
        assert.strictEqual(extracted[t1].context, undefined);
        assert.strictEqual(extracted[t1].entry[0], 'Some text');
        assert.strictEqual(extracted[t1].entry[1], 'Some teksty'); // last form
        assert.strictEqual(extracted[t2].type, 'plural');
        assert.strictEqual(extracted[t2].context, undefined);
        assert.strictEqual(extracted[t2].entry[0], 'Some more text');
        assert.strictEqual(extracted[t2].entry[1], 'Some more teksty'); // last form
    });
    it('Extracts plural strings with valid simple placeholders', function () {
        var func = "\n    function simple() {\n      const n = 1;\n      const a = _nt(['Some %% text', 'Some %% texts', 'Some %% teksty'], n);\n      const b = _nt([\n        'Some %% %2 more %1 text',\n        'Some %% %2 more %1 texts',\n        'Some %% %2 more %1 teksty'\n      ], n, [n, 'some string']);\n      return { a, b };\n    }";
        var extracted = (0, util_1.getExtractedStrings)(func);
        assert.strictEqual(Object.keys(extracted).length, 2);
        var _a = Object.keys(extracted), t1 = _a[0], t2 = _a[1];
        assert.strictEqual(extracted[t1].type, 'plural');
        assert.strictEqual(extracted[t1].context, undefined);
        assert.strictEqual(extracted[t1].entry[0], 'Some %% text');
        assert.strictEqual(extracted[t1].entry[1], 'Some %% teksty'); // last form
        assert.strictEqual(extracted[t2].type, 'plural');
        assert.strictEqual(extracted[t2].context, undefined);
        assert.strictEqual(extracted[t2].entry[0], 'Some %% %2 more %1 text');
        assert.strictEqual(extracted[t2].entry[1], 'Some %% %2 more %1 teksty'); // last form
    });
    it('Fails to extract invalid placeholders', function () {
        var func = "\n    function simpleInvalid() {\n      const a = _nt([\n        'Some text %1 and more text %2 ololo',\n        'Some texts %1 and more texts %2 ololo',\n        'Some texty %1 and more texty %2 ololo',\n      ], 12, [23, 34, 45]); // placeholders count mismatch\n      return a;\n    }";
        var errors = [];
        var extracted = (0, util_1.getExtractedStrings)(func, function (m, _i) { errors.push(m); });
        assert.strictEqual(errors.length, 1);
        assert.strictEqual(Object.keys(extracted).length, 0);
    });
    it('Extracts comments', function () {
        var _a;
        var simple = "\n      //; Some comment\n      const a = _nt([\n        'Some text %1 and more text ololo',\n        'Some texts %1 and more text ololo',\n        'Some texty %1 and more text ololo',\n      ], 11, ['321']);\n      return a;\n    ";
        var extracted = (0, util_1.getExtractedStrings)(simple);
        assert.strictEqual(Object.keys(extracted).length, 1);
        var t1 = Object.keys(extracted)[0];
        assert.strictEqual(extracted[t1].type, 'plural');
        assert.strictEqual((_a = extracted[t1].comments) === null || _a === void 0 ? void 0 : _a[0], 'Some comment');
    });
    it('Extracts TSX comments', function () {
        var _a;
        var simpleTsx = "\n      const a = <div>\n        {/*; Some tsx comment */}\n        {_nt([\n        'Some text %1 and more text ololo',\n        'Some texts %1 and more text ololo',\n        'Some texty %1 and more text ololo',\n      ], 11, ['321'])}\n      </div>;\n      return a;\n    ";
        var extracted = (0, util_1.getExtractedStrings)(simpleTsx);
        assert.strictEqual(Object.keys(extracted).length, 1);
        var t1 = Object.keys(extracted)[0];
        assert.strictEqual(extracted[t1].type, 'plural');
        assert.strictEqual((_a = extracted[t1].comments) === null || _a === void 0 ? void 0 : _a[0], 'Some tsx comment');
    });
});
//# sourceMappingURL=plural_nt.spec.js.map