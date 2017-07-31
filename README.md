# i18n-stex
i18n STrings EXtractor

Stex is an utility to extract i18n strings from JS & TS source code. It's written in Typescript and is distributed as standalone package.

## How it works

Stex walks through all files and traverses their ASTs with typescript API searching for any of these function or method calls:
- `_t('Simple translation')`
- `_pt('Context', 'Contextual translation')`
- `_nt(['Plural translation', 'Plural translations'], pluralityFactor)`
- `_npt('Context', ['Contextual plural translation', 'Contextual plural translations'], pluralityFactor)`

`pluralityFactor` is a numeric literal, variable or expression, evaluating as number, which is used to determine which plural form should be used in runtime. This logic is not implemented in stex, but it should know about it to provide consistent interface.

Any of `_t`, `_pt`, `_nt` and `_npt` may have additional parameters, which will be substituted into strings. Example:
```
_t('This translation is %1', 'simple') // Should output "This translation is simple" in runtime
```
Again, this logic is not implemented in stex, but on parsing stage it checks if count of substitution markers matches count of additional parameters and throws an error on mismatch.

Plural `_nt` and `_npt` calls may also have a `%%` substitution marker, which should be replaced with `pluralityFactor` value in runtime.

i18n calls may be imported as object, and stex will still recognize it: for example, `$i18n._t('Something')` is fine.

Stex also extracts comments for translators. Such comments should be strictly on previous line relative to i18n call and should begin with `// ;` or `/* ;`. Multiline translation comments are not allowed, but stacking single-line comments are allowed, like this:
```
// ; This is some text
// ; This line of comment will also get into translation file
_t('Some text')
```

## Output data expectations

- All i18n strings are extracted as i18n entries.
- Entries are deduplicated using `context`+`string` as a key, so many occurences of same string will be treated as one in translation file.
- Comments are deduplicated by content, but if different comments are provided for same entry, they will be merged together.
- String occurence places are also saved within output data in format of `fileName:lineNumber:character`.

## Command-line usage

To install stex system-wide, run:
```
$ sudo npm install -g i18n-stex
```
Then you can use it like this:
```
$ stex --help

i18n STring EXtractor

Options:
   -h / --help          Show this help
   -s / --src '*.ts'    Define which files should be processed.
                        Accepts quoted glob string.
   -o / --output FILE   Define output JSON file name. If a file
                        already exists, it's contents will be
                        overwritten.
```
Input files string is a glob, so you may pass not only a single file name, but also something like `src/**/*.ts` to parse every .ts file in a folder and all its subfolders.
Output defaults to stdout, so you can use standard unix stream redirection syntax.

## API usage

Stex uses typescript API to walk through the AST, so you should have typescript installed in your project's `node_modules`. Basic way to use stex is importing and calling it as follows:

```
import { readFileSync } from 'fs';
import * as ts from "typescript";
import { extract, getDictItems } from 'stex/src';

let fileName = '[whatever file you want]';
let sources = ts.createSourceFile(fileName, readFileSync(fileName).toString(), ts.ScriptTarget.ES5, /*setParentNodes */ true);

// Here is where we run stex
extract(sources);
console.log(getDictItems());
```

**function extract(file: _ts.SourceFile_): void**
Input: Source file object created with `ts.createSourceFile`.
Output: none; strings dictionary is filled inside module's scope. You may run `extract` several times on multiple files to get strings dictionary of all source files at once.

**function getDictItems(): I18NEntry[]**
Input: none.
Output: array of entries extracted with `extract`. Exact format of `I18NEntry` is listed [here](https://github.com/2gis/i18n-proto/blob/master/index.ts).

Another example of using AST traversal may be found [here](https://basarat.gitbooks.io/typescript/docs/compiler/parser.html).

## Contributing

Stex uses github-flow to accept & merge fixes and improvements. Basic process is:
- Fork the repo.
- Create a branch.
- Add or fix some code.
- **Run Karma testing suite with `npm run test` and make sure nothing is broken**
- Add some tests for your new code or fix broken tests.
- Run `npm run build` to build pure-js distribution files.
- Commit & push.
- Create a new pull request to original repo.

Pull requests with failing tests will not be accepted. Also, if you add or modify packages to `package.json`, make sure you use `yarn` and update `yarn.lock`.
