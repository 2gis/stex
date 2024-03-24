"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var assert = tslib_1.__importStar(require("assert"));
var util_1 = require("./util");
describe('Test comment extraction edge cases', function () {
    it('Extracts multiline comments', function () {
        var _a, _b, _c;
        var simple = "\n      let b;\n      //; Some comment\n      //; Comment on new line\n      //; And third comment too\n      let a = _t('Some text and more text ololo', []);\n      return a;\n    ";
        var extracted = (0, util_1.getExtractedStrings)(simple);
        assert.strictEqual(Object.keys(extracted).length, 1);
        assert.strictEqual(extracted['Some text and more text ololo'].type, 'single');
        assert.strictEqual(extracted['Some text and more text ololo'].context, undefined);
        assert.strictEqual(extracted['Some text and more text ololo'].entry, 'Some text and more text ololo');
        assert.strictEqual((_a = extracted['Some text and more text ololo'].comments) === null || _a === void 0 ? void 0 : _a[0], 'Some comment');
        assert.strictEqual((_b = extracted['Some text and more text ololo'].comments) === null || _b === void 0 ? void 0 : _b[1], 'Comment on new line');
        assert.strictEqual((_c = extracted['Some text and more text ololo'].comments) === null || _c === void 0 ? void 0 : _c[2], 'And third comment too');
    });
    it('Aborts comment parsing if any other line is encountered', function () {
        var _a;
        var simple = "\n      //; Some comment\n      //; Comment on new line\n      console.log('Translation comment for b should stop here and be empty');\n      let b = _t('Some text for b ololo', []);\n      return [a, b];\n    ";
        var extracted = (0, util_1.getExtractedStrings)(simple);
        assert.strictEqual(Object.keys(extracted).length, 1);
        assert.strictEqual((_a = extracted['Some text for b ololo'].comments) === null || _a === void 0 ? void 0 : _a.length, 0);
    });
    it('Extracts comments from several translations', function () {
        var _a, _b, _c, _d, _e, _f;
        var simple = "\n      //; Some comment\n      //; Comment on new line\n      let a = _t('Some text and more text ololo', []);\n      //; Some comment for b\n      //; Comment on new line for b\n      let b = _t('Some text for b ololo', []);\n      return [a, b];\n    ";
        var extracted = (0, util_1.getExtractedStrings)(simple);
        assert.strictEqual(Object.keys(extracted).length, 2);
        assert.strictEqual((_a = extracted['Some text and more text ololo'].comments) === null || _a === void 0 ? void 0 : _a[0], 'Some comment');
        assert.strictEqual((_b = extracted['Some text and more text ololo'].comments) === null || _b === void 0 ? void 0 : _b[1], 'Comment on new line');
        assert.strictEqual((_c = extracted['Some text and more text ololo'].occurences) === null || _c === void 0 ? void 0 : _c.length, 1);
        assert.strictEqual((_d = extracted['Some text for b ololo'].comments) === null || _d === void 0 ? void 0 : _d[0], 'Some comment for b');
        assert.strictEqual((_e = extracted['Some text for b ololo'].comments) === null || _e === void 0 ? void 0 : _e[1], 'Comment on new line for b');
        assert.strictEqual((_f = extracted['Some text for b ololo'].occurences) === null || _f === void 0 ? void 0 : _f.length, 1);
    });
    it('Merges comments & occurences from several similar translations', function () {
        var _a, _b, _c, _d, _e;
        var simple = "\n\n      //; Some comment\n      //; Comment on new line\n      let a = _t('Some text', []);\n\n      //; Some comment for b\n      //; Comment on new line for b\n      let b = _t('Some text', []);\n\n      return [a, b];\n    ";
        var extracted = (0, util_1.getExtractedStrings)(simple);
        assert.strictEqual(Object.keys(extracted).length, 1);
        assert.strictEqual((_a = extracted['Some text'].comments) === null || _a === void 0 ? void 0 : _a[0], 'Some comment');
        assert.strictEqual((_b = extracted['Some text'].comments) === null || _b === void 0 ? void 0 : _b[1], 'Comment on new line');
        assert.strictEqual((_c = extracted['Some text'].comments) === null || _c === void 0 ? void 0 : _c[2], 'Some comment for b');
        assert.strictEqual((_d = extracted['Some text'].comments) === null || _d === void 0 ? void 0 : _d[3], 'Comment on new line for b');
        assert.strictEqual((_e = extracted['Some text'].occurences) === null || _e === void 0 ? void 0 : _e.length, 2);
    });
});
//# sourceMappingURL=comment.spec.js.map