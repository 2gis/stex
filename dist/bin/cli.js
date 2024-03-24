"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var fs_1 = require("fs");
var ts = tslib_1.__importStar(require("typescript"));
var src_1 = require("../src");
var glob_1 = tslib_1.__importDefault(require("glob"));
var cli = tslib_1.__importStar(require("cli"));
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
(0, glob_1.default)(options.src, function (e, matches) {
    matches.forEach(function (fileName) {
        if (fileName.includes('node_modules')) {
            return;
        }
        (0, src_1.extract)(ts.createSourceFile(fileName, (0, fs_1.readFileSync)(fileName).toString(), ts.ScriptTarget.ES5, 
        /*setParentNodes */ true));
    });
    if (options.output === '__stdout') {
        console.log(JSON.stringify((0, src_1.getDictItems)(), undefined, '  '));
    }
    else {
        (0, fs_1.writeFileSync)(options.output, JSON.stringify((0, src_1.getDictItems)(), undefined, '  '));
    }
    if (e) {
        console.error(e);
    }
});
//# sourceMappingURL=cli.js.map