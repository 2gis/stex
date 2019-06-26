"use strict";
exports.__esModule = true;
var CommentHandle = /** @class */ (function () {
    function CommentHandle() {
        this.comments = {};
    }
    CommentHandle.prototype.addComment = function (str, filename, lineNumber) {
        if (!this.comments[filename]) {
            this.comments[filename] = {};
        }
        this.comments[filename][lineNumber] = str;
    };
    CommentHandle.prototype.extractRawComments = function (src, filename) {
        var lines = src.split('\n'); // No regex here! We should precisely keep line numbers.
        for (var line = 0; line < lines.length; line++) {
            var trimmedLine = lines[line].trim();
            if (trimmedLine.split(/\s*\/\/\s?;\s*|\s*$/g)[1]) { // single line //; or // ; comments
                this.addComment(trimmedLine.split(/\s*\/\/\s?;\s*|\s*$/g)[1], filename, line); // trim & add
                continue;
            }
            if (trimmedLine.match(/^\s*\{?\s*\/\*\s?;(.+?)\s*\*\/\s*\}?\s*$/)) { // single line /*; comments */, also support {} for TSX
                this.addComment(trimmedLine.replace(/^\s*\{?\s*\/\*\s?;\s*|\s*\*\/\s*\}?\s*$/g, ''), filename, line); // trim & add
                continue;
            }
        }
        return this;
    };
    CommentHandle.prototype.findAdjacentComments = function (pos) {
        if (!this.comments[pos.identFile]) {
            return [];
        }
        var comments = [];
        var currentLine = pos.identLocation.line;
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
    };
    return CommentHandle;
}());
exports.CommentHandle = CommentHandle;
