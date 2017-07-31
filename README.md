# i18n-stex
i18n STrings EXtractor

Stex is an utility to extract i18n strings from JS & TS source code. It's written in Typescript and is distributed as standalone package.

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
