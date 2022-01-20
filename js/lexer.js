//=======================
// lexer.js
//=======================

import { StringStream } from "./charstream.js";
import {
    Token,
    TokenType,
    operator_symbols,
    keywords,
    operators,
    types
} from "./token.js";

function isalpha(ch) {
    return ch.match(/[a-zA-Z]/);
}
function isalnum(ch) {
    return ch.match(/[a-zA-Z0-9]/);
}
function isdigit(ch) {
    return ch.match(/[0-9]/);
}
function isspace(ch) {
    return !ch.trim();
}
function isbackslash(ch) {
    return ch.charCodeAt(0) === 92;
}

const seperator = '_';
function valid_number_seperated(number) {
    number = number.toLowerCase();
    if (number.match(/^0[xb].*/)) number = number.substring(2);
    let seperator_allowed = true;
    if (number[0] === seperator || number[number.length - 1] === seperator)
        return false;
    for (const digit of number) {
        if (digit === seperator || digit === '.') {
            if (seperator_allowed)
                seperator_allowed = false;
            else
                return false;
        } else {
            seperator_allowed = true;
        }
    }
    return true;
}

export function remove_seperator(number) {
    return number.replaceAll(seperator, "");
}

function lex_error(msg) {
    console.log(msg);
}

class LexState {
    static Start     = 0;
    static Number    = 1;
    static String    = 2;
    static Ident     = 3;
    static Comment   = 4;
    static Operator  = 5;
    static Float     = 6;
    static HexNumber = 7;
    static BinNumber = 8;
}

let linenr = 1;
let column = 0;

function get_next_token(stream, original_tokens=false) {
    let token_start_index = null;
    let lexeme = "";
    let lexstate = LexState.Start;
    let ch = "", peek = "";
    while ( ch = stream.getc() ) {
        peek = stream.peek();

        if (lexstate === LexState.Start) {
            if (isspace(ch) || isbackslash(ch))
                continue;

            if (ch === '\n') {
                linenr++;
                continue;
            }

            lexeme = ch;
            token_start_index = stream.pos - 1;

            if (isalpha(ch) || ch === '_')
                lexstate = LexState.Ident
            else if (isdigit(ch)) {
                if (ch === '0' && peek?.toLowerCase() === 'x') {
                    // add the 'x' and next iter check the rest
                    ch = stream.getc();
                    lexeme += ch;
                    lexstate = LexState.HexNumber;
                }
                else if (ch === '0' && peek?.toLowerCase() === 'b') {
                    // add the 'b' and next iter check the rest
                    ch = stream.getc();
                    lexeme += ch;
                    lexstate = LexState.BinNumber;
                }
                else
                    lexstate = LexState.Number;
            }
            else if (ch === '"')
                lexstate = LexState.String;
            else if (ch === '#')
                lexstate = LexState.Comment;
            else if (operator_symbols.includes(ch))
                lexstate = LexState.Operator;
            else
                // lex_error(`Unrecognized symbol: \`${ch}\``);
                return new Token(lexeme, TokenType.Error, linenr, token_start_index);
        }

        else if (lexstate === LexState.Number) {
            if (isdigit(ch) || ch === seperator)
                lexeme += ch;
            else if (ch === '.') {
                lexeme += ch;
                lexstate = LexState.Float;
            }
            else if (isalpha(ch))
                // lex_error(`Unrecognized symbol after \`${lexeme}\`: \`${ch}\``)
                return new Token(lexeme, TokenType.Error, linenr, token_start_index);
            else {
                if (!valid_number_seperated(lexeme))
                    // lex_error(`Bad number literal seperation \`${lexeme}\``);
                    return new Token(lexeme, TokenType.Error, linenr, token_start_index);
                else {
                    stream.ungetc();
                    if (original_tokens)
                        return new Token(lexeme, TokenType.Number, linenr, token_start_index);
                    else
                        return new Token(remove_seperator(lexeme), TokenType.Number, linenr, token_start_index);
                }
            }
        }

        else if (lexstate === LexState.Float) {
            if (ch === '.')
                // lex_error(`Too many \`.\` in token: \`${lexeme}\``)
                return new Token(lexeme, TokenType.Error, linenr, token_start_index);
            if (isdigit(ch) || ch === seperator)
                lexeme += ch;
            else {
                if (!valid_number_seperated(lexeme))
                    // lex_error(`Bad float literal seperation \`${lexeme}\``);
                    return new Token(lexeme, TokenType.Error, linenr, token_start_index);
                else {
                    stream.ungetc();
                    if (original_tokens)
                        return new Token(lexeme, TokenType.Number, linenr, token_start_index);
                    else
                        return new Token(remove_seperator(lexeme), TokenType.Number, linenr, token_start_index);
                }
            }
        }

        else if (lexstate === LexState.BinNumber) {
            if ("01".includes(ch) || ch === seperator)
                lexeme += ch
            else {
                if (isalnum(ch))
                    // lex_error(`Trailing symbol after \`${lexeme}\`: \`${ch}\``)
                    return new Token(lexeme, TokenType.Error, linenr, token_start_index);
                else if (!valid_number_seperated(lexeme))
                    // lex_error(`Bad binary literal seperation \`${lexeme}\``);
                    return new Token(lexeme, TokenType.Error, linenr, token_start_index);
                else {
                    stream.ungetc();
                    if (original_tokens)
                        return new Token(lexeme, TokenType.Number, linenr, token_start_index);
                    else
                        return new Token(remove_seperator(lexeme), TokenType.Number, linenr, token_start_index);
                }
            }
        }

        else if (lexstate === LexState.HexNumber) {
            if ("0123456789abcdef".includes(ch.toLowerCase()) || ch === seperator)
                lexeme += ch;
            else {
                if (!valid_number_seperated(lexeme)) {
                    // lex_error(`Bad hex literal seperation \`${lexeme}\``);
                    return new Token(lexeme, TokenType.Error, linenr, token_start_index);
                }
                else {
                    stream.ungetc();
                    if (original_tokens)
                        return new Token(lexeme, TokenType.Number, linenr, token_start_index);
                    else
                        return new Token(remove_seperator(lexeme), TokenType.Number, linenr, token_start_index);
                }
            }
        }

        else if (lexstate === LexState.String) {
            if (ch === '\n')
                // lex_error(`Missing end delim in token \`${lexeme}\``);
                return new Token(lexeme, TokenType.Error, linenr, token_start_index);
            if (ch !== '"')
                lexeme += ch;
            else {
                lexeme += '"';
                if (original_tokens)
                    return new Token(lexeme, TokenType.String, linenr, token_start_index);
                else {
                    // TODO: We were letting the lexer handle
                    // chopping off the '"'s from the string
                    // literal, but that job has been offloaded
                    // to the parser because of how token storage
                    // works most functions and bodies.
                    return new Token(lexeme, TokenType.String, linenr, token_start_index);
                }
            }
        }

        else if (lexstate === LexState.Ident) {
            if (isalnum(ch) || ch === '_')
                lexeme += ch
            else {
                stream.ungetc()
                let keyword_tt = keywords.find(lexeme);
                let type_tt = types.find(lexeme);
                if (keyword_tt !== null)
                    return new Token(lexeme, keyword_tt, linenr, token_start_index);
                else if (type_tt !== null)
                    return new Token(lexeme, type_tt, linenr, token_start_index);
                else
                    return new Token(lexeme, TokenType.Ident, linenr, token_start_index);
            }
        }

        else if (lexstate === LexState.Comment) {
            if (ch === '\n' || peek === null) {
                stream.ungetc()
                if (original_tokens)
                    return new Token(lexeme, TokenType.Comment, linenr, token_start_index);
                else
                    return get_next_token(stream);
            }
            else
                lexeme += ch
        }

        else if (lexstate === LexState.Operator) {
            // Keep trying to build an operator until we can't
            // i.e. character sequence **= will make **=, not ** or *
            if (operators.find(lexeme + ch) !== null)
                lexeme += ch
            else {
                stream.ungetc();
                return new Token(lexeme, operators.find(lexeme), linenr, token_start_index);
            }
        }
    }

    // No more characters to contruct tokens!
    return null;
}

// Uses a StringStream to create a flow of tokens
export class TokenStream {
    constructor(content, original_tokens=false) {
        this.stream = new StringStream(content);
        this.pushback_stack = [];
        // Typically, the parser wants to ignore
        // comment tokens and remove seperators
        // from number tokens. However, when doing
        // syntax highlighting, we want to have
        // these tokens to be returned as they
        // are read, without any modifications
        // for the lexer.
        this.original_tokens = original_tokens;
    }
    next(stream = this.stream) {
        if (this.pushback_stack.length !== 0) {
            let token = this.pushback_stack.pop();
            return token;
        }

        let token = get_next_token(this.stream, this.original_tokens);
        return token ?? new Token("" , TokenType.END, 0);
    }
    peek(stream = this.stream) {
        let tok = this.next();
        this.pushback(tok);
        return tok;
    }
    pushback(token) {
        this.pushback_stack.push(token);
    }
    reset() {
        this.pushback_stack = [];
        this.stream.reset();
    }
}
