const __reset = "\x1b[0m";
const __fgRed = "\x1b[31m";
const ERROR_PREP = __fgRed + "[i18n extractor ERROR] " + __reset;
export function panic(message, info) {
    console.error(ERROR_PREP + message);
    console.error(ERROR_PREP + 'Location: ' + info.identFile + ':'
        + (info.identLocation.line + 1) + ':' + info.identLocation.character);
}
//# sourceMappingURL=panic.js.map