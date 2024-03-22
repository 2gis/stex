import { readFileSync, writeFileSync } from 'fs';
import * as ts from "typescript";
import { extract, getDictItems } from '../src';
import { globSync } from 'glob';
import * as cli from 'cli';

const options = cli.parse({
  // -s, --src GLOB   A file or glob to process
  src: ['s', 'A source file or glob to process', 'string', '*.ts'],
  output: ['o', 'Output JSON file', 'string', '__stdout'],
  help: ['h', 'Show some help', 'bool', false]
});

if (options.help) {
  console.log(`i18n STring EXtractor

Options:
   -h / --help          Show this help
   -s / --src '*.ts'    Define which files should be processed. 
                        Accepts quoted glob string.
   -o / --output FILE   Define output JSON file name. If a file 
                        already exists, it's contents will be
                        overwritten.`);
  process.exit(0);
}

console.warn('Running extraction in glob: ', options.src);

const matches = globSync(options.src);
matches.forEach((fileName) => {
  if (fileName.includes('node_modules')) {
    return;
  }
  extract(ts.createSourceFile(
    fileName,
    readFileSync(fileName).toString(),
    ts.ScriptTarget.ES5,
    /*setParentNodes */ true
  ));
});

if (options.output === '__stdout') {
  console.log(JSON.stringify(getDictItems(), undefined, '  '));
} else {
  writeFileSync(options.output, JSON.stringify(getDictItems(), undefined, '  '));
}