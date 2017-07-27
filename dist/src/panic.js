"use strict";
exports.__esModule = true;
var __reset = "\x1b[0m";
var __fgRed = "\x1b[31m";
var ERROR_PREP = __fgRed + "[i18n extractor ERROR] " + __reset;
function panic(message, info) {
    console.error(ERROR_PREP + message);
    console.error(ERROR_PREP + 'Location: ' + info.identFile + ':'
        + (info.identLocation.line + 1) + ':' + info.identLocation.character);
}
exports.panic = panic;
