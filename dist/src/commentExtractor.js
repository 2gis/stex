"use strict";
exports.__esModule = true;
var CommentHandle = (function () {
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
        var lines = src.split("\n"); // No regex here! We should precisely keep line numbers.
        for (var line = 0; line < lines.length; line++) {
            if (lines[line].match(/^\s*\/\/\s?;/)) {
                this.addComment(lines[line].replace(/^\s*\/\/\s?;\s*|\s*$/g, ''), filename, line); // trim & add
                continue;
            }
            if (lines[line].match(/^\s*\{?\s*\/\*\s?;(.+?)\s*\*\/\s*\}?\s*$/)) {
                this.addComment(lines[line].replace(/^\s*\{?\s*\/\*\s?;\s*|\s*\*\/\s*\}?\s*$/g, ''), filename, line); // trim & add
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
