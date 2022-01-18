//=======================
// token.js
//=======================

import { PrefixTrie } from "./prefixtrie.js";

export class TokenType {
    static Comment    = -1;
    static Error      = 0;
    static Ident      = 1;
    static Number     = 2;
    static String     = 3;
    static Bool       = 4;
    static NOT        = 5;
    static NEQUAL     = 6;
    static BWAND      = 7;
    static BWANDEQ    = 8;
    static AND        = 9;
    static ANDEQ      = 10;
    static PLUS       = 11;
    static INCRE      = 12;
    static PLUSEQ     = 13;
    static MINUS      = 14;
    static DECRE      = 15;
    static MINUSEQ    = 16;
    static MULT       = 17;
    static EXP        = 18;
    static MULTEQ     = 19;
    static EXPEQ      = 20;
    static DIV        = 21;
    static DIVEQ      = 22;
    static MOD        = 23;
    static MODEQ      = 24;
    static RARROW     = 25;
    static LTHAN      = 26;
    static LARROW     = 27;
    static LSHIFT     = 28;
    static XOR        = 29;
    static XOREQ      = 30;
    static LSHIFTEQ   = 31;
    static LTHANEQ    = 32;
    static ASSIGN     = 33;
    static EQUAL      = 34;
    static FUZZYEQUAL = 35;
    static RARROWFAT  = 36;
    static GTHAN      = 37;
    static GTHANEQ    = 38;
    static RSHIFT     = 39;
    static RSHIFTEQ   = 40;
    static BWOR       = 41;
    static BWOREQ     = 42;
    static OR         = 43;
    static OREQ       = 44;
    static BWNOT      = 45;
    static LBRACK     = 46;
    static RBRACK     = 47;
    static LBRACE     = 48;
    static RBRACE     = 49;
    static LPAREN     = 50;
    static RPAREN     = 51;
    static COLON      = 52;
    static SCOPERES   = 53;
    static WALRUS     = 54;
    static SEMICOLON  = 55;
    static CLASS      = 56;
    static ELIF       = 57;
    static ELSE       = 58;
    static ENUM       = 59;
    static FINAL      = 60;
    static FN         = 61;
    static FOR        = 62;
    static IF         = 63;
    static LET        = 64;
    static IMPORT     = 65;
    static IN         = 66;
    static RETURN     = 67;
    static STRUCT     = 68;
    static WHILE      = 69;
    static TYPEOF     = 70;
    static TYPEDEF    = 71;
    static COMMA      = 72;
    static DOT        = 73;
    static DOTDOT     = 74;
    static ELLIPSIS   = 75;
    static TNumber    = 76;
    static TString    = 77;
    static TArray     = 78;
    static TObject    = 79;
    static TFunction  = 80;
    static END        = 81;
}

export function token_type_str(tt) {
    if (tt == TokenType.Comment)
        return "comment";
    if (tt == TokenType.Error)
        return "error";
    if (tt == TokenType.Ident)
        return "ident";
    if (tt == TokenType.Number)
        return "number";
    if (tt == TokenType.String)
        return "string";
    if (tt == TokenType.CLASS)
        return "class";
    if (tt == TokenType.ELIF)
        return "elif";
    if (tt == TokenType.ELSE)
        return "else";
    if (tt == TokenType.ENUM)
        return "enum";
    if (tt == TokenType.FINAL)
        return "final";
    if (tt == TokenType.FN)
        return "fn";
    if (tt == TokenType.FOR)
        return "for";
    if (tt == TokenType.IF)
        return "if";
    if (tt == TokenType.IMPORT)
        return "import";
    if (tt == TokenType.IN)
        return "in";
    if (tt == TokenType.LET)
        return "let";
    if (tt == TokenType.RETURN)
        return "return";
    if (tt == TokenType.STRUCT)
        return "struct";
    if (tt == TokenType.TYPEDEF)
        return "typedef";
    if (tt == TokenType.TYPEOF)
        return "typeof";
    if (tt == TokenType.WHILE)
        return "while";
    if (tt == TokenType.NOT)
        return "NOT";
    if (tt == TokenType.NEQUAL)
        return "NEQUAL";
    if (tt == TokenType.BWAND)
        return "BWAND";
    if (tt == TokenType.BWANDEQ)
        return "BWANDEQ";
    if (tt == TokenType.AND)
        return "AND";
    if (tt == TokenType.ANDEQ)
        return "ANDEQ";
    if (tt == TokenType.PLUS)
        return "PLUS";
    if (tt == TokenType.INCRE)
        return "INCRE";
    if (tt == TokenType.PLUSEQ)
        return "PLUSEQ";
    if (tt == TokenType.MINUS)
        return "MINUS";
    if (tt == TokenType.DECRE)
        return "DECRE";
    if (tt == TokenType.MINUSEQ)
        return "MINUSEQ";
    if (tt == TokenType.MULT)
        return "MULT";
    if (tt == TokenType.EXP)
        return "EXP";
    if (tt == TokenType.MULTEQ)
        return "MULTEQ";
    if (tt == TokenType.EXPEQ)
        return "EXPEQ";
    if (tt == TokenType.DIV)
        return "DIV";
    if (tt == TokenType.DIVEQ)
        return "DIVEQ";
    if (tt == TokenType.MOD)
        return "MOD";
    if (tt == TokenType.MODEQ)
        return "MODEQ";
    if (tt == TokenType.RARROW)
        return "RARROW";
    if (tt == TokenType.LTHAN)
        return "LTHAN";
    if (tt == TokenType.LARROW)
        return "LARROW";
    if (tt == TokenType.LSHIFT)
        return "LSHIFT";
    if (tt == TokenType.XOR)
        return "XOR";
    if (tt == TokenType.XOREQ)
        return "XOREQ";
    if (tt == TokenType.LSHIFTEQ)
        return "LSHIFTEQ";
    if (tt == TokenType.LTHANEQ)
        return "LTHANEQ";
    if (tt == TokenType.ASSIGN)
        return "ASSIGN";
    if (tt == TokenType.EQUAL)
        return "EQUAL";
    if (tt == TokenType.FUZZYEQUAL)
        return "FUZZYEQUAL";
    if (tt == TokenType.RARROWFAT)
        return "RARROWFAT";
    if (tt == TokenType.GTHAN)
        return "GTHAN";
    if (tt == TokenType.GTHANEQ)
        return "GTHANEQ";
    if (tt == TokenType.RSHIFT)
        return "RSHIFT";
    if (tt == TokenType.RSHIFTEQ)
        return "RSHIFTEQ";
    if (tt == TokenType.BWOR)
        return "BWOR";
    if (tt == TokenType.BWOREQ)
        return "BWOREQ";
    if (tt == TokenType.OR)
        return "OR";
    if (tt == TokenType.OREQ)
        return "OREQ";
    if (tt == TokenType.BWNOT)
        return "BWNOT";
    if (tt == TokenType.BWNOTEQ)
        return "BWNOTEQ";
    if (tt == TokenType.LBRACK)
        return "LBRACK";
    if (tt == TokenType.RBRACK)
        return "RBRACK";
    if (tt == TokenType.LBRACE)
        return "LBRACE";
    if (tt == TokenType.RBRACE)
        return "RBRACE";
    if (tt == TokenType.LPAREN)
        return "LPAREN";
    if (tt == TokenType.RPAREN)
        return "RPAREN";
    if (tt == TokenType.COLON)
        return "COLON";
    if (tt == TokenType.SCOPERES)
        return "SCOPERES";
    if (tt == TokenType.WALRUS)
        return "WALRUS";
    if (tt == TokenType.SEMICOLON)
        return "SEMICOLON";
    if (tt == TokenType.COMMA)
        return "COMMA";
    if (tt == TokenType.DOT)
        return "DOT";
    if (tt == TokenType.DOTDOT)
        return "DOTDOT";
    if (tt == TokenType.ELLIPSIS)
        return "ELLIPSIS";
    if (tt == TokenType.END)
        return "END";
    return "none";
}

export class Token {
    constructor(lexeme, tt, linenumber, col) {
        this.lexeme = lexeme;
        this.tt = tt;
        this.linenumber = linenumber;
        this.start = col;
        this.end = col + this.lexeme.length - 1;
    }

    print() {
        if (keywords.find(this.lexeme) !== null || operators.find(this.lexeme) !== null)
            console.log(`${token_type_str(this.tt)}:[${this.start}:${this.end}]`);
        else
            console.log(`${token_type_str(this.tt)}(${this.lexeme}):[${this.start}:${this.end}]`);
    }
}

export const operator_symbols = "+-*/%=<>!&|^~()[]{}:;,.";

export const keywords_symbols = [
    "class",
    "elif",
    "else",
    "enum",
    "final",
    "fn",
    "for",
    "if",
    "import",
    "in",
    "let",
    "struct",
    "typedef",
    "typeof",
    "while",
];

export const operators = new PrefixTrie();
export const keywords = new PrefixTrie();
export const types = new PrefixTrie();

// All recongized operators
operators.insert("!", TokenType.NOT);
operators.insert("!=", TokenType.NEQUAL);
operators.insert("&", TokenType.BWAND);
operators.insert("&=", TokenType.BWANDEQ);
operators.insert("&&", TokenType.AND);
operators.insert("&&=", TokenType.ANDEQ);
operators.insert("+", TokenType.PLUS);
operators.insert("++", TokenType.INCRE);
operators.insert("+=", TokenType.PLUSEQ);
operators.insert("-", TokenType.MINUS);
operators.insert("--", TokenType.DECRE);
operators.insert("-=", TokenType.MINUSEQ);
operators.insert("*", TokenType.MULT);
operators.insert("**", TokenType.EXP);
operators.insert("*=", TokenType.MULTEQ);
operators.insert("**=", TokenType.EXPEQ);
operators.insert("/", TokenType.DIV);
operators.insert("/=", TokenType.DIVEQ);
operators.insert("%", TokenType.MOD);
operators.insert("%=", TokenType.MODEQ);
operators.insert("->", TokenType.RARROW);
operators.insert("<", TokenType.LTHAN);
operators.insert("<-", TokenType.LARROW);
operators.insert("<<", TokenType.LSHIFT);
operators.insert("^", TokenType.XOR);
operators.insert("^=", TokenType.XOREQ);
operators.insert("<<=", TokenType.LSHIFTEQ);
operators.insert("<=", TokenType.LTHANEQ);
operators.insert("=", TokenType.ASSIGN);
operators.insert("==", TokenType.EQUAL);
operators.insert("=~", TokenType.FUZZYEQUAL);
operators.insert("=>", TokenType.RARROWFAT);
operators.insert(">", TokenType.GTHAN);
operators.insert(">=", TokenType.GTHANEQ);
operators.insert(">>", TokenType.RSHIFT);
operators.insert(">>=", TokenType.RSHIFTEQ);
operators.insert("|", TokenType.BWOR);
operators.insert("|=", TokenType.BWOREQ);
operators.insert("||", TokenType.OR);
operators.insert("||=", TokenType.OREQ);
operators.insert("~", TokenType.BWNOT);
operators.insert("~=", TokenType.BWNOTEQ);
operators.insert("[", TokenType.LBRACK);
operators.insert("]", TokenType.RBRACK);
operators.insert("{", TokenType.LBRACE);
operators.insert("}", TokenType.RBRACE);
operators.insert("(", TokenType.LPAREN);
operators.insert(")", TokenType.RPAREN);
operators.insert(":", TokenType.COLON);
operators.insert("::", TokenType.SCOPERES);
operators.insert(":=", TokenType.WALRUS);
operators.insert(";", TokenType.SEMICOLON);
operators.insert(",", TokenType.COMMA);
operators.insert(".", TokenType.DOT);
operators.insert("..", TokenType.DOTDOT);
operators.insert("...", TokenType.ELLIPSIS);

// All recongized keywords
keywords.insert("class", TokenType.CLASS);
keywords.insert("elif", TokenType.ELIF);
keywords.insert("else", TokenType.ELSE);
keywords.insert("enum", TokenType.ENUM);
keywords.insert("final", TokenType.FINAL);
keywords.insert("fn", TokenType.FN);
keywords.insert("for", TokenType.FOR);
keywords.insert("if", TokenType.IF);
keywords.insert("let", TokenType.LET);
keywords.insert("import", TokenType.IMPORT);
keywords.insert("in", TokenType.IN);
keywords.insert("return", TokenType.RETURN);
keywords.insert("struct", TokenType.STRUCT);
keywords.insert("while", TokenType.WHILE);
keywords.insert("typeof", TokenType.TYPEOF);
keywords.insert("typedef", TokenType.TYPEDEF);

// All recongized types
types.insert("Number");
types.insert("String");
types.insert("Array");
types.insert("Object");
types.insert("Function");
