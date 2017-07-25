import { IdentInfo } from './types';

export class CommentHandle {
  private comments: {
    [key: string]: { // filename in key
      [key: number]: string // line number in key
    }
  } = {};

  private addComment(str: string, filename: string, lineNumber: number): void {
    if (!this.comments[filename]) {
      this.comments[filename] = {};
    }

    this.comments[filename][lineNumber] = str;
  }

  public extractRawComments(src: string, filename: string): CommentHandle {
    let lines = src.split("\n"); // No regex here! We should precisely keep line numbers.
    for (let line = 0; line < lines.length; line++) {
      if (!lines[line].match(/^\s+\/\/;/)) {
        continue;
      }

      this.addComment(lines[line].replace(/^\s+\/\/;|\s+$/, ''), filename, line); // trim & add
    }

    return this;
  }

  public findAdjacentComments(pos: IdentInfo): string[] {
    if (!this.comments[pos.identFile]) {
      return [];
    }

    let comments: string[] = [];
    let currentLine = pos.identLocation.line;
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
