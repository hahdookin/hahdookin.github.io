//=======================
// charstream.js
//=======================

// Creates a stream of characters from
// a string to be used by the lexer
export class StringStream {
    constructor(s) {
        this.s = s + " ";
        this.pos = 0;
        this.column = 0;
        this.line = 1;
    }

    getc() {
        if (this.pos === this.s.length)
            return null;
        return this.s[this.pos++];
    }

    ungetc() {
        if (this.pos > 0)
            this.pos--;
    }

    peek() {
        const ch = this.getc();
        if (ch !== null)
            this.ungetc();
        return ch;
    }

    reset() {
        this.pos = 0;
    }
}


