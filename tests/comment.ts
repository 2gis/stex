import * as assert from 'assert';
import { getExtractedStrings } from './util';
import { IdentInfo, _t } from '../src/types';

describe('Test comment extraction edge cases', () => {
  it('Extracts multiline comments', () => {
    let simple = `
      let b;
      //; Some comment
      //; Comment on new line
      //; And third comment too
      let a = _t('Some text and more text ololo', []);
      return a;
    `;

    let extracted = getExtractedStrings(simple);
    assert.equal(Object.keys(extracted).length, 1);
    assert.equal(extracted['Some text and more text ololo'].type, 'single');
    assert.equal(extracted['Some text and more text ololo'].context, undefined);
    assert.equal(extracted['Some text and more text ololo'].entry, 'Some text and more text ololo');
    assert.equal(extracted['Some text and more text ololo'].comments[0], 'Some comment');
    assert.equal(extracted['Some text and more text ololo'].comments[1], 'Comment on new line');
    assert.equal(extracted['Some text and more text ololo'].comments[2], 'And third comment too');
  });

  it('Aborts comment parsing if any other line is encountered', () => {
    let simple = `
      //; Some comment
      //; Comment on new line
      console.log('Translation comment for b should stop here and be empty');
      let b = _t('Some text for b ololo', []);
      return [a, b];
    `;

    let extracted = getExtractedStrings(simple);
    assert.equal(Object.keys(extracted).length, 1);
    assert.equal(extracted['Some text for b ololo'].comments.length, 0);
  });

  it('Extracts comments from several translations', () => {
    let simple = `
      //; Some comment
      //; Comment on new line
      let a = _t('Some text and more text ololo', []);
      //; Some comment for b
      //; Comment on new line for b
      let b = _t('Some text for b ololo', []);
      return [a, b];
    `;

    let extracted = getExtractedStrings(simple);
    assert.equal(Object.keys(extracted).length, 2);
    assert.equal(extracted['Some text and more text ololo'].comments[0], 'Some comment');
    assert.equal(extracted['Some text and more text ololo'].comments[1], 'Comment on new line');
    assert.equal(extracted['Some text and more text ololo'].occurences.length, 1);
    assert.equal(extracted['Some text for b ololo'].comments[0], 'Some comment for b');
    assert.equal(extracted['Some text for b ololo'].comments[1], 'Comment on new line for b');
    assert.equal(extracted['Some text for b ololo'].occurences.length, 1);
  });

  it('Merges comments & occurences from several similar translations', () => {
    let simple = `

      //; Some comment
      //; Comment on new line
      let a = _t('Some text', []);

      //; Some comment for b
      //; Comment on new line for b
      let b = _t('Some text', []);

      return [a, b];
    `;

    let extracted = getExtractedStrings(simple);
    assert.equal(Object.keys(extracted).length, 1);
    assert.equal(extracted['Some text'].comments[0], 'Some comment');
    assert.equal(extracted['Some text'].comments[1], 'Comment on new line');
    assert.equal(extracted['Some text'].comments[2], 'Some comment for b');
    assert.equal(extracted['Some text'].comments[3], 'Comment on new line for b');
    assert.equal(extracted['Some text'].occurences.length, 2);
  });
});
