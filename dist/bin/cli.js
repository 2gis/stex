"use strict";
exports.__esModule = true;
var fs_1 = require("fs");
var ts = require("typescript");
var src_1 = require("../src");
var glob = require("glob");
var cli = require("cli");
var options = cli.parse({
    // -s, --src GLOB   A file or glob to process
    src: ['s', 'A source file or glob to process', 'string', '*.ts'],
    output: ['o', 'Output JSON file', 'string', '__stdout'],
    help: ['h', 'Show some help', 'bool', false]
});
if (options.help) {
    console.log("i18n STring EXtractor\n\nOptions:\n   -h / --help          Show this help\n   -s / --src '*.ts'    Define which files should be processed. \n                        Accepts quoted glob string.\n   -o / --output FILE   Define output JSON file name. If a file \n                        already exists, it's contents will be\n                        overwritten.");
    process.exit(0);
}
console.warn('Running extraction in glob: ', options.src);
glob(options.src, function (e, matches) {
    if (e) {
        console.error(e);
        return;
    }
    matches.forEach(function (fileName) {
        src_1.extract(ts.createSourceFile(fileName, fs_1.readFileSync(fileName).toString(), ts.ScriptTarget.ES5, 
        /*setParentNodes */ true));
    });
    if (options.output === '__stdout') {
        console.log(JSON.stringify(src_1.getDictItems(), undefined, '  '));
    }
    else {
        fs_1.writeFileSync(options.output, JSON.stringify(src_1.getDictItems(), undefined, '  '));
    }
});
