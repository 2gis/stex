export class CommentHandle {
    constructor() {
        this.comments = {};
    }
    addComment(str, filename, lineNumber) {
        if (!this.comments[filename]) {
            this.comments[filename] = {};
        }
        this.comments[filename][lineNumber] = str;
    }
    extractRawComments(src, filename) {
        const lines = src.split("\n"); // No regex here! We should precisely keep line numbers.
        for (let line = 0; line < lines.length; line++) {
            if (lines[line].match(/^\s*\/\/\s?;/)) { // single line //; or // ; comments
                this.addComment(lines[line].replace(/^\s*\/\/\s?;\s*|\s*$/g, ''), filename, line); // trim & add
                continue;
            }
            if (lines[line].match(/^\s*\{?\s*\/\*\s?;(.+?)\s*\*\/\s*\}?\s*$/)) { // single line /*; comments */, also support {} for TSX
                this.addComment(lines[line].replace(/^\s*\{?\s*\/\*\s?;\s*|\s*\*\/\s*\}?\s*$/g, ''), filename, line); // trim & add
            }
        }
        return this;
    }
    findAdjacentComments(pos) {
        if (!this.comments[pos.identFile]) {
            return [];
        }
        const comments = [];
        let currentLine = pos.identLocation.line;
        // eslint-disable-next-line no-constant-condition
        while (true) {
            currentLine--;
            // Reached beginning of file
            if (currentLine < 0) {
                break;
            }
            // Reached beginning of i18n comment block
            if (!this.comments[pos.identFile][currentLine]) {
                break;
            }
            comments.unshift(this.comments[pos.identFile][currentLine]);
        }
        return comments;
    }
}
//# sourceMappingURL=commentExtractor.js.map