import { TokenStream } from "./lexer.js";
import {
    Token,
    TokenType,
} from "./token.js";
import {
    Value,
    Param
} from "./value.js";
import { Type } from "./type.js";
import { intrinsic_fns } from "./intrinsics.js";
import { token_type_str } from "./token.js";
import {
    zip,
    unreachable,
} from "./utils.js";

class IdentTable {
    constructor() {
        this.scopes = [{}];
    }
    addScope() {
        this.scopes.push({});
    }
    popScope() {
        this.scopes.pop();
        if (this.scopes.length === 0)
            throw new Error("Just popped global scope!");
    }
    currentScope() {
        return this.scopes[this.scopes.length - 1];
    }
    // Try to find a symbol in the current scope,
    // if it can't be found, search previous scopes.
    // Returns: Value | null
    find(symbolname) {
        for (const scope of [...this.scopes].reverse())
            for (const ident in scope)
                if (ident === symbolname)
                    return scope[ident];
        return null;
    }
    findInCurrentScope(symbolname) {
        return this.currentScope()[symbolname];
    }
    add(key, value) {
        this.currentScope()[key] = value;
    }
}

export const symbolTable = new IdentTable();
export const typeTable = new IdentTable();
// Define all intrinsic fns as fns in
// the global scope
for (const intrinsic in intrinsic_fns)
    symbolTable.add(intrinsic, intrinsic_fns[intrinsic]);

class FunctionState {
    constructor() {
        // Allow the use of function specific
        // keywords like 'return'
        this.in_function = false;
        // Let the parser know to expect a
        // return val, pop it from the stack
        this.fn_returning = false;
        // When a function calls a function,
        // return values are pushed and popped
        // from the stack when execution ends.
        this.return_stack = [];
    }
}

export const fnState = new FunctionState();

let block_depth = 0;

export function debug_info(tstream) {
    console.log("--------DEBUG--------");
    console.log(tstream.stream.s);
    console.log(symbolTable);
    for (const scope of symbolTable.scopes)
        for (const ident in scope)
            if (!scope[ident].isFunction())
                console.log(ident, '=', scope[ident].printFmt(true));
    console.log("Block Depth: " + block_depth);
    console.log("---------END---------");
}

function parse_error(msg) {
    //console.log(`ERROR: ${msg}`);
    function formatted_time() {
        const now = new Date();
        let hrs = now.getHours();
        hrs = hrs < 10 ? "0" + hrs : hrs;
        let mns = now.getMinutes();
        mns = mns < 10 ? "0" + mns : mns;
        let scs = now.getSeconds();
        scs = scs < 10 ? "0" + scs : scs;
        return `[${hrs}:${mns}:${scs}]`;
    }
    const stream = document.getElementsByClassName("stream")[0];
    const output = document.createElement("div");
    const time = document.createElement("p");
    const location = document.createElement("p");
    const stuff = document.createElement("p");

    output.classList.add('line');
    time.classList.add('time');
    location.classList.add('location', 'error');
    stuff.classList.add('info')

    time.innerText = formatted_time();
    location.innerText = "ERROR";

    stuff.innerText = Value.fromString(msg).printFmt();

    output.append(time);
    output.append(location);
    output.append(stuff);
    stream.append(output);
    return false;
}

// Starts when a '{', end when matching '}' is read
// Closing '}' is pushed back and handled by nonterminal
// Store body tokens in body_tokens
function readTillBlockEnd(stream, body_tokens) {
    let token = stream.next();
    if (token.tt === TokenType.RBRACE) {
        stream.pushback(token);
        return true;
    }
    let lbrace_count = 0;
    while (token.tt !== TokenType.END) {
        if (token.tt === TokenType.RBRACE) {
            if (lbrace_count === 0)
                break;
            lbrace_count--;
        }
        if (token.tt === TokenType.LBRACE)
            lbrace_count++;
        body_tokens.push(token.lexeme);
        token = stream.next();
    }
    // Push the closing '}' back into the stream
    stream.pushback(token);
    return true;
}

// Stmt -> ;
// Stmt -> Expr ;
// Stmt -> LetStmt ;
// Stmt -> ReturnStmt ;
// Stmt -> FunctionDef
// Stmt -> EnumDef
// Stmt -> Block
// Stmt -> IfStmt
// Stmt -> WhileStmt
export function Stmt(stream) {
    let token = stream.next();
    let status = false;
    let from_block = false;
    let from_return = false;
    let value = new Value();
    let typeval = new Type();

    switch (token.tt) {
        // Empty statment
        case TokenType.SEMICOLON:
            return true;

        case TokenType.FINAL:
        case TokenType.LET:
            status = LetStmt(stream, token.tt);
            break;

        case TokenType.LBRACE:
            stream.pushback(token);
            status = Block(stream);
            from_block = true;
            break;

        case TokenType.FN:
            status = FunctionDef(stream);
            from_block = true;
            break;

        case TokenType.ENUM:
            status = EnumDef(stream);
            from_block = true;
            break;

        case TokenType.IF:
            status = IfStmt(stream);
            from_block = true;
            break;

        case TokenType.FOR:
            status = ForStmt(stream);
            from_block = true;
            break;

        case TokenType.WHILE:
            status = WhileStmt(stream);
            from_block = true;
            break;

        case TokenType.RETURN:
            if (!fnState.in_function)
                return parse_error("Unexpected 'return' call");
            status = ReturnStmt(stream, value);
            from_return = true;
            fnState.fn_returning = true;
            break;


        case TokenType.TYPEDEF:
            status = TypeDef(stream, typeval);
            console.log(typeval.printFmt()); // TODO: remove me
            //console.log(typeTable); // TODO: remove me
            break;

        default:
            stream.pushback(token);
            status = Expr(stream, value);
            // This line below makes the interpreter
            // more interactive. TODO: Consider using this.
            call(intrinsic_fns["print"], [value]);
            break;
    }
    if (!status)
        return false;

    token = stream.next();

    if (!from_block)
        if (token.tt != TokenType.SEMICOLON)
            return parse_error("Missing ; at end of stmt");

    // End the execution of a subroutine
    // by inserting an END token at the end
    // of a valid statement.
    // Additionally, close out remaining blocks
    // that the return statement may have been in.
    // TODO: This is a hack, read the tokens to validate
    // that the blocks do close correctly.
    if (from_return) {
        stream.pushback(new Token("" , TokenType.END, 0));
        for (let i = 0; i < block_depth; i++) {
            stream.pushback(new Token("}", TokenType.RBRACE, 0));
        }
        block_depth = 0;
    }

    return status;
}

// Starting non-terminal for a valid program
// Stmts -> empty | Stmt Stmts
export function Stmts(stream) {
    let token = stream.next();
    // The empty case
    if (
        (token.tt === TokenType.RBRACE && block_depth !== 0) ||
        token.tt === TokenType.END
    ) {
        stream.pushback(token);
        return true;
    }
    stream.pushback(token);
    let status = Stmt(stream);
    if (!status)
        return false;
    token = stream.next();
    while (
        token.tt != TokenType.RBRACE &&
        token.tt != TokenType.END
    ) {
        stream.pushback(token);
        status = Stmt(stream);
        token = stream.next();
        if (!status)
            return false;
    }
    stream.pushback(token);
    return true;
}

// Block is implemented weirdly. When a block
// is expanded to { Stmts }, it will read and
// execute until the closing '}' is read, and
// then that '}' is pushed back into the token
// stream to be handled by whatever calling
// non-terminal. This has lead to some needless
// checks for closing '}'s all over the program.
// This should be handled explicitly by this
// non-terminal.
// Block -> Stmt | { Stmts }
export function Block(stream) {
    let token = stream.next();
    let status = false;
    if (token.tt === TokenType.LBRACE) {
        block_depth++;
        symbolTable.addScope();
        typeTable.addScope();
        status = Stmts(stream);
        symbolTable.popScope();
        typeTable.popScope();
        token = stream.next();
        if (token.tt !== TokenType.RBRACE)
            return parse_error("Missing closing `}` in block");
        block_depth--;
    } else {
        stream.pushback(token);
        status = Stmt(stream);
    }
    stream.pushback(token);
    return true;
}

// Starts with the assumption a 'for' has already been read.
// for ident in iterable Block
export function ForStmt(stream) {
    let token = stream.next();
    if (token.tt !== TokenType.Ident)
        return parse_error("Missing ident in for stmt");
    const loop_ident = token.lexeme;
    token = stream.next();
    if (token.tt !== TokenType.IN)
        return parse_error("Missing 'in' in for stmt");
    let iter_value = new Value();
    let status = Expr(stream, iter_value);
    if (!status)
        return false;
    if (!iter_value.iterable())
        return parse_error(`Type ${iter_value.typeStr()} not iterable`);
    token = stream.next();
    if (token.tt !== TokenType.LBRACE)
        return parse_error("Missing '{' in for stmt")

    // Save tokens for the body
    let body_tokens = [];
    // debugger;
    readTillBlockEnd(stream, body_tokens);
    const body = new TokenStream(body_tokens.join(' '));
    symbolTable.addScope();
    for (const val of iter_value.Atemp) {
        symbolTable.add(loop_ident, Value.from(val));
        symbolTable.addScope();
        typeTable.addScope();
        body.reset();
        status = Stmts(body);
        symbolTable.popScope();
        if (!status)
            return parse_error("Error in for body");
    }
    symbolTable.popScope();
    return true;
}

// Starts with the assumption a 'while' has already been read.
// WhileStmt -> while Expr Block
export function WhileStmt(stream) {
    // Save tokens for the conditional
    let token = stream.next();
    let expr_tokens = [];
    while ( token.tt !== TokenType.LBRACE ) {
        expr_tokens.push(token.lexeme);
        token = stream.next();
    }

    // Save tokens for the body
    let body_tokens = [];
    readTillBlockEnd(stream, body_tokens);

    const cond = new TokenStream(expr_tokens.join(' '));
    const body = new TokenStream(body_tokens.join(' '));
    // debugger;
    let value = new Value();
    let status = Expr(cond, value);
    while (value.Ntemp) {
        symbolTable.addScope();
        typeTable.addScope();
        body.reset();
        status = Stmts(body);
        symbolTable.popScope();
        typeTable.popScope();
        if (!status)
            return parse_error("Error in while body");
        // Reevaluate conditional
        cond.reset();
        status = Expr(cond, value);
        if (!status)
            return parse_error("Error in while cond");
    }
    return true;
}

// Starts with the assumption an 'if' has already been read.
// IfStmt -> if Expr Block
export function IfStmt(stream) {
    // debugger;
    let token;
    let value = new Value();
    let status = Expr(stream, value);
    if (!status)
        return parse_error("Bad conditional in if");
    if (!value.isNumber())
        return parse_error("Condition must evaluate to number");

    if (value.Ntemp) {
        // If is true, execute block
        status = Block(stream);
        if (!status)
            return false;
    }
    else {
        // Skip 'if' block
        token = stream.next();
        if (token.tt !== TokenType.LBRACE)
            return parse_error("Expected '{'");
        readTillBlockEnd(stream, []);
    }

    let rbrace = stream.next();
    if (rbrace.tt !== TokenType.RBRACE)
        return false;
    let elsetoken = stream.next();
    if (elsetoken.tt !== TokenType.ELSE) {
        stream.pushback(elsetoken);
        stream.pushback(rbrace);
        return true;
    }

    // At beginning of else block '{'
    if (value.Ntemp) {
        // If was executed, skip else
        token = stream.next();
        if (token.tt !== TokenType.LBRACE)
            return parse_error("Expected '{'");
        // Skip 'if' block
        readTillBlockEnd(stream, []);
        return true;
    }
    else {
        // Execute else block
        status = Block(stream);
        if (!status)
            return false;
    }
    return true;
}

// Starts with the assumption a `let` has already been read.
// (let | final) ident {= Expr}{, ident {= Expr}}*
export function LetStmt(stream, decl_type) {
    // debugger;
    let decl_str = token_type_str(decl_type);
    let status = true;
    let token = stream.next();

    while (token.tt !== TokenType.SEMICOLON) {
        let val = new Value();
        val.constant = decl_type === TokenType.FINAL;
        if (token.tt !== TokenType.Ident)
            return parse_error("Missing ident in variable decl");
        let symbolname = token.lexeme;
        if (symbolTable.findInCurrentScope(symbolname))
            return parse_error(`Redeclaration of ${symbolname}`);

        // debugger;
        token = stream.next();
        if (token.tt === TokenType.ASSIGN) {
            status = Expr(stream, val);
            token = stream.next();
        }
        if (token.tt === TokenType.COMMA) {
            token = stream.next();
        }
        symbolTable.add(symbolname, val);
    }

    // Push back ';' to conclude a statement
    stream.pushback(token);
    return true;
}

// Starts with the assumption a `return` has already been read.
// ReturnStmt -> return Expr
export function ReturnStmt(stream, retval) {
    let val = new Value();
    let status = Expr(stream, val);
    fnState.return_stack.push(val);
    retval.setFromValue(val);
    return status;
}

//===========================
// Function decl
//===========================

// Starts with the assumption a `fn` has already been read.
// FunctionDef -> fn ident ( ParamList ) Block
export function FunctionDef(stream) {
    let status;
    // Grab ident
    let token = stream.next();
    if (token.tt !== TokenType.Ident)
        return parse_error("Missing ident in function def");
    let ident = token.lexeme;
    let cur_scope = symbolTable.currentScope();
    if (cur_scope[ident])
        return parse_error(`Redeclaration of ${ident}`)

    token = stream.next();
    if (token.tt !== TokenType.LPAREN)
        return parse_error("Missing `(` in fn param list");
    let params = [];
    status = ParamList(stream, params);
    if (!status)
        return false;
    token = stream.next();
    if (token.tt !== TokenType.RPAREN)
        return parse_error("Missing `)` in fn param list");
    token = stream.next();
    let rettype = Type.Void();
    if (token.tt === TokenType.COLON) {
        // Define type of return
        status = TypeExpr(stream, rettype);
        if (!status)
            return false;
        token = stream.next();
    }
    if (token.tt !== TokenType.LBRACE)
        return parse_error("Missing '{' in fn def");

    // Start saving tokens for fn body
    // until the closing '}' is read.
    // Don't save the closing '}'.
    let tokens_read = [];
    readTillBlockEnd(stream, tokens_read);
    let val = Value.fromFunction(tokens_read, params, ident);
    symbolTable.add(ident, val);
    return true;
}

// Starts with the assumption a `fn` has already been read.
// FunctionLiteral -> fn {ident} ( ParamList ) Block
export function FunctionLiteral(stream, retval) {
    let status;
    let token = stream.next();
    let symbolname = null;
    if (token.tt === TokenType.Ident) {
        // TODO: Handle this optional ident
        symbolname = token.lexeme;
        token = stream.next();
    }
    if (token.tt !== TokenType.LPAREN)
        return parse_error("Missing `(` in fn param list");
    let params = [];
    status = ParamList(stream, params);
    token = stream.next();
    if (token.tt !== TokenType.RPAREN)
        return parse_error("Missing `)` in fn param list");
    token = stream.next();
    if (token.tt !== TokenType.LBRACE)
        return parse_error("Missing '{' in fn def");

    // Start saving tokens for fn body
    // until the closing '}' is read.
    // Don't save the closing '}'.
    // let lbrace_count = 0;
    // token = stream.next();
    let tokens_read = [];
    readTillBlockEnd(stream, tokens_read);
    let val = Value.fromFunction(tokens_read, params);
    retval.setFromValue(val);
    // Confirm closing '}'
    token = stream.next();
    if (token.tt !== TokenType.RBRACE)
        return parse_error("Missing closing '}' in function literal");
    return true;
}

// ParamList -> Empty | ident{, ident}*
export function ParamList(stream, params) {
    let token = stream.next();
    let status, type, name;

    // Empty param list
    if (token.tt === TokenType.RPAREN) {
        stream.pushback(token);
        return true;
    }

    while (token.tt !== TokenType.RPAREN) {
        type = null;
        if (token.tt !== TokenType.Ident)
            return parse_error("Expected ident in param list");
        if (params.map(p => p.name).includes(token.lexeme))
            return parse_error(`Redeclaration of param '${token.lexeme}'`)
        name = token.lexeme;
        token = stream.next();
        if (token.tt === TokenType.COLON) {
            type = new Type();
            status = TypeExpr(stream, type);
            if (!status)
                return false;
            token = stream.next();
        } else {
            type = Type.Any();
        }
        params.push(new Param(name, type));
        if (token.tt !== TokenType.COMMA && token.tt !== TokenType.RPAREN)
            return parse_error("Param list error");
        if (token.tt == TokenType.RPAREN)
            stream.pushback(token)
        else
            token = stream.next();
    }
    return true;
}

//===========================
// Enum decl
//===========================

// Starts with the assumption an `enum` has already been read.
// EnumDef -> enum { EnumList }
export function EnumDef(stream) {
    let token = stream.next();
    let enum_ident = null;
    if (token.tt === TokenType.Ident) {
        if (symbolTable.findInCurrentScope(token.lexeme))
            return parse_error(`Redeclaration of ${token.lexeme} in enum def`);
        enum_ident = token.lexeme;
        token = stream.next();
    }
    if (token.tt !== TokenType.LBRACE)
        return parse_error("Missing opening '{' in enum def");
    let status = EnumList(stream, enum_ident);
    if (!status)
        return false;
    return true;
}

// EnumList -> Empty | ident {= OrExpr}{, EnumList}
export function EnumList(stream, enum_ident) {
    let cur_enum_value = 0;
    let token = stream.next();

    // Empty enum list
    if (token.tt === TokenType.RBRACE)
        return parse_error("Empty enum not allowed.");

    let scopedval = new Value();
    scopedval.setObject({});
    scopedval.constant = true;
    let scoped_idents = [];
    while (token.tt !== TokenType.RBRACE) {
        if (token.tt !== TokenType.Ident)
            return parse_error("Expected ident in enum list");

        let symbolname = token.lexeme;
        if (enum_ident === null) {
            // Unscoped Enum
            if (symbolTable.findInCurrentScope(symbolname))
                return parse_error(`Redeclaration of '${symbolname}' in enum list`);
        } else {
            // Scoped Enum
            //if (scoped_idents.includes(symbolname))
            if (scopedval.hasKey(symbolname))
                return parse_error(`Redeclaration of '${symbolname}' in scoped enum list`);
            //scoped_idents.push(symbolname);
        }

        token = stream.next();
        if (token.tt === TokenType.ASSIGN) {
            let expr_val = new Value();
            let status = OrExpr(stream, expr_val);
            if (!expr_val.isNumber())
                return parse_error("Enum expr must eval to number");
            cur_enum_value = expr_val.Ntemp;
            if (!status)
                return false;
        } else {
            stream.pushback(token);
        }
        // Enum values can only be number,
        // and cannot be reassigned. (Constant)
        let value = new Value();
        value.setNumber(cur_enum_value);
        value.constant = true;
        cur_enum_value++;

        if (enum_ident === null) {
            // Unscoped enum, add to current scope
            symbolTable.add(symbolname, value);
        } else {
            // Scoped enum, add as read-only member of object
            scopedval.setObjectValue(symbolname, value);
        }

        token = stream.next();
        if (token.tt !== TokenType.COMMA && token.tt !== TokenType.RBRACE)
            return parse_error("Enum list error");
        if (token.tt == TokenType.RBRACE)
            stream.pushback(token)
        else
            token = stream.next();
    }
    if (enum_ident !== null) {
        symbolTable.add(enum_ident, scopedval);
    }
    return true;
}

//===========================
// Type Expression
//===========================

// Starts with the assumption a 'typedef' has already been read.
// TypeDef -> typedef TypeExpr ident ;
export function TypeDef(stream, typeval) {
    let status = TypeExpr(stream, typeval);
    if (!status)
        return false;
    let token = stream.next();
    if (token.tt !== TokenType.Ident)
        return parse_error("Expected ident in type definition");
    if (typeTable.findInCurrentScope(token.lexeme))
        return parse_error(`Redefintion of type ${token.lexeme}`);
    typeTable.add(token.lexeme, typeval);
    return true;
}

// TypeExpr -> Number
//       | String
//       | Any
//       | ArrayType
//       | ObjectType
//       | FunctionType
//
// ArrayType    -> Array[TypeExpr]
// ObjectType   -> Object{ident: TypeExpr{, ident: TypeExpr}*}
// FunctionType -> Function{(TypeExpr{, TypeExpr}*)}{: TypeExpr}
export function TypeExpr(stream, typeval) {
    let token = stream.next();
    let status;
    switch (token.tt) {
        case TokenType.Ident:
            const identval = typeTable.find(token.lexeme);
            if (!identval)
                return parse_error(`Use of undeclared type '${token.lexeme}'`);
            typeval.setFrom(identval);
            return true;
        case TokenType.TNumber:
            typeval.setNumber();
            return true;
        case TokenType.TString:
            typeval.setString();
            return true;
        case TokenType.TAny:
            typeval.setAny();
            return true;
        case TokenType.TVoid:
            typeval.setVoid();
            return true;
        case TokenType.TArray:
            let arrtype = new Type();
            status = ArrayType(stream, arrtype);
            typeval.setArray(arrtype);
            return status;
        case TokenType.TObject:
            let keys = [], types = [];
            status = ObjectType(stream, keys, types);
            typeval.setObject(keys, types);
            return status;
        case TokenType.TFunction:
            let paramstypes = [], returntype = new Type();
            status = FunctionType(stream, paramstypes, returntype);
            typeval.setFunction(paramstypes, returntype);
            return status;
    }
    return false;
}

// ArrayType -> Array[TypeExpr]
export function ArrayType(stream, arrtype) {
    let token = stream.next();
    if (token.tt !== TokenType.LBRACK) {
        // Array is just Array[Any]
        arrtype.setAny();
        stream.pushback(token);
        return true;
    }
    let status = TypeExpr(stream, arrtype);
    token = stream.next();
    if (token.tt !== TokenType.RBRACK)
        return parse_error("Expected ']' in Array type expression");
    return true;
}

// ObjectType -> Object{ident: TypeExpr{, ident: TypeExpr}*}
export function ObjectType(stream, keys, types) {
    let token = stream.next();
    if (token.tt !== TokenType.LBRACE) {
        stream.pushback(token);
        // Object is just Object{{anyident: Any}*}
        return true;
    }

    while (token.tt !== TokenType.RBRACE) {
        token = stream.next();
        if (token.tt !== TokenType.Ident)
            return parse_error("Expected ident in obj type expression");
        keys.push(token.lexeme);
        token = stream.next();
        if (token.tt !== TokenType.COLON)
            return parse_error("Expected ':' in obj type expression");
        let type = new Type();
        status = TypeExpr(stream, type);
        types.push(type);
        token = stream.next();
        if (
            token.tt !== TokenType.COMMA &&
            token.tt !== TokenType.RBRACE
        )
            return parse_error("Object type entry list error");
    }
    return true;
}

// FunctionType -> Function{(TypeExpr{, TypeExpr}*)}{: TypeExpr}
export function FunctionType(stream, paramtypes, returntype) {
    let token = stream.next();
    let status;
    if (token.tt === TokenType.LPAREN) {
        while (token.tt !== TokenType.RPAREN) {
            let type = new Type();
            status = TypeExpr(stream, type);
            paramtypes.push(type);
            token = stream.next();
            if (
                token.tt !== TokenType.COMMA &&
                token.tt !== TokenType.RPAREN
            )
                return parse_error("Function type param list error");
        }
        token = stream.next();
    }

    if (token.tt === TokenType.COLON) {
        status = TypeExpr(stream, returntype);
    } else {
        returntype.setAny();
        stream.pushback(token);
    }
    return true;
}

//===========================
// Expression
//===========================

function isAssignOp(tokentype) {
    switch (tokentype) {
        case TokenType.ASSIGN:   // =
        case TokenType.PLUSEQ:   // +=
        case TokenType.MINUSEQ:  // -=
        case TokenType.BWANDEQ:  // &=
        case TokenType.ANDEQ:    // &&=
        case TokenType.MULTEQ:   // *=
        case TokenType.EXPEQ:    // **=
        case TokenType.DIVEQ:    // /=
        case TokenType.MODEQ:    // %=
        case TokenType.XOREQ:    // ^=
        case TokenType.LSHIFTEQ: // <<=
        case TokenType.RSHIFTEQ: // >>=
        case TokenType.BWOREQ:   // |=
        case TokenType.OREQ:     // ||=
            return true;
    }
    return false;
}

function isOpeningDelim(tokentype) {
    switch (tokentype) {
        case TokenType.LPAREN:
        case TokenType.LBRACK:
        case TokenType.LBRACE:
            return true;
    }
    return false;
}

function isClosingDelim(tokentype) {
    switch (tokentype) {
        case TokenType.RPAREN:
        case TokenType.RBRACK:
        case TokenType.RBRACE:
            return true;
    }
    return false;
}

function isUnaryOp(tokentype) {
    switch (tokentype) {
        case TokenType.PLUS:
        case TokenType.MINUS:
        case TokenType.NOT:
        case TokenType.BWNOT:
        case TokenType.TYPEOF:
            return true;
    }
    return false;
}

// Expr -> OrExpr | AssignExpr
export function Expr(stream, retval) {
    let value = new Value();
    let token = stream.next();
    let status = false;
    let ref = null;
    if (token.tt === TokenType.Ident) {
        // debugger
        let tokens_read = [token];
        let delims_count = 0;
        let delims = { '(': 0, '[': 0, '{': 0 };
        token = stream.next();
        tokens_read.push(token);
        while (
            token.tt !== TokenType.COMMA &&
            token.tt !== TokenType.SEMICOLON &&
            token.tt !== TokenType.END
        ) {
            // Only stop at an assign token if
            // we are within the correct grouping
            if (
                delims['('] === 0 &&
                delims['['] === 0 &&
                delims['{'] === 0 &&
                isAssignOp(token.tt)
            ) break;
            if      (token.lexeme === '(') delims['(']++
            else if (token.lexeme === '[') delims['[']++
            else if (token.lexeme === '{') delims['{']++
            else if (token.lexeme === ')') delims['(']--
            else if (token.lexeme === ']') delims['[']--
            else if (token.lexeme === '}') delims['{']--
            token = stream.next();
            tokens_read.push(token);
        }

        // Put back the tokens we used to check
        // what kind of statement this is
        for (let t of tokens_read.reverse())
            stream.pushback(t);
        if (
            delims['('] === 0 &&
            delims['['] === 0 &&
            delims['{'] === 0 &&
            isAssignOp(token.tt)
        ) {
            // This is an AssignExpr
            status = AssignExpr(stream, value);
            if (!status)
                return false;
        } else {
            // Just do OrExpr
            status = OrExpr(stream, value);
            if (!status)
                return false;
        }
    } else {
        // Just do OrExpr
        stream.pushback(token);
        status = OrExpr(stream, value);
        if (!status)
            return false;
    }
    retval.setFromValue(value);
    return true;
}

// Coming from Expr, we know an ident and
// some assignment token exist, no need for
// returing parse errors.
// AssignExpr -> VariableRef (COMPOUND)= OrExpr
export function AssignExpr(stream, retval) {
    let token = stream.next();
    if (token.tt !== TokenType.Ident)
        return parse_error("Missing ident in var ref");
    let symbolname = token.lexeme;
    let ref = VariableRef(stream, symbolname);
    if (!ref)
        return parse_error(`Assignment to undeclared variable: ${symbolname}`);
    if (ref.constant)
        return parse_error(`Assignment to constant variable ${symbolname}`)

    token = stream.next();
    let assign_type = token.tt;

    let value = new Value();
    let t1 = OrExpr(stream, value);

    if (!t1)
        return parse_error("Invalid rhs in assignment");

    // TODO: Type check on these operations
    switch (assign_type) {
        case TokenType.ASSIGN:   // =
            ref.setFromValue(value);
            break;
        case TokenType.PLUSEQ:   // +=
            ref.setFromValue(ref.add(value));
            break;
        case TokenType.MINUSEQ:  // -=
            ref.setFromValue(ref.sub(value));
            break;
        case TokenType.MULTEQ:   // *=
            ref.setFromValue(ref.mult(value));
            break;
        case TokenType.EXPEQ:    // **=
            ref.setFromValue(ref.exp(value));
            break;
        case TokenType.DIVEQ:    // /=
            ref.setFromValue(ref.div(value));
            break;
        case TokenType.MODEQ:    // %=
            ref.setFromValue(ref.mod(value));
            break;
        case TokenType.XOREQ:    // ^=
            ref.setFromValue(ref.bwxor(value));
            break;
        case TokenType.LSHIFTEQ: // <<=
            ref.setFromValue(ref.lshift(value));
            break;
        case TokenType.RSHIFTEQ: // >>=
            ref.setFromValue(ref.rshift(value));
            break;
        case TokenType.BWANDEQ:  // &=
            ref.setFromValue(ref.bwand(value));
            break;
        case TokenType.ANDEQ:    // &&=
            ref.setFromValue(ref.and(value));
            break;
        case TokenType.BWOREQ:   // |=
            ref.setFromValue(ref.bwor(value));
            break;
        case TokenType.OREQ:     // ||=
            ref.setFromValue(ref.or(value));
            break;
    }
    retval.setFromValue(ref);
    return true;
}

// OrExpr -> AndExpr {|| AndExpr}*
export function OrExpr(stream, retval) {
    let val1 = new Value(), val2 = new Value();

    let t1 = AndExpr(stream, val1);

    if (!t1) return false;

    retval.setFromValue(val1);
    // if (retval.Ntemp)
    //      TODO: Short circuit!

    let token = stream.next();

    while (
        token?.tt == TokenType.OR
    ) {
        t1 = AndExpr(stream, val2);

        if (!t1)
            return parse_error("Missing operand after operator");

        if (!retval.isNumber() || !val2.isNumber())
            return parse_error(`Illegal types for ${token.lexeme}: ${retval.typeStr()} and ${val2.typeStr()}`)

        // Evaluate
        retval.setFromValue(retval.or(val2));

        token = stream.next();
    }
    stream.pushback(token);
    return true;
}

// AndExpr -> BWOrExpr {&& BWOrExpr}*
export function AndExpr(stream, retval) {
    let val1 = new Value(), val2 = new Value();

    let t1 = BWOrExpr(stream, val1);

    if (!t1)
        return false;

    retval.setFromValue(val1);

    let token = stream.next();

    while (
        token?.tt == TokenType.AND
    ) {
        t1 = BWOrExpr(stream, val2);

        if (!t1)
            return parse_error("Missing operand after operator");

        if (!retval.isNumber() || !val2.isNumber())
            return parse_error(`Illegal types for ${token.lexeme}: ${retval.typeStr()} and ${val2.typeStr()}`)

        // Evaluate
        retval.setFromValue(retval.and(val2));

        token = stream.next();
    }
    stream.pushback(token);
    return true;
}

// BWOrExpr -> BWXorExpr {| BWXorExpr}*
export function BWOrExpr(stream, retval) {
    let val1 = new Value(), val2 = new Value();

    let t1 = BWXorExpr(stream, val1);

    if (!t1) return false;

    retval.setFromValue(val1);

    let token = stream.next();

    while (
        token?.tt == TokenType.BWOR
    ) {
        t1 = BWXorExpr(stream, val2);

        if (!t1)
            return parse_error("Missing operand after operator");

        if (!retval.isNumber() || !val2.isNumber())
            return parse_error(`Illegal types for ${token.lexeme}: ${retval.typeStr()} and ${val2.typeStr()}`)

        // Evaluate
        retval.setFromValue(retval.bwor(val2));

        token = stream.next();
    }
    stream.pushback(token);
    return true;
}

// BWXorExpr -> BWAndExpr {^ BWAndExpr}*
export function BWXorExpr(stream, retval) {
    let val1 = new Value(), val2 = new Value();

    let t1 = BWAndExpr(stream, val1);

    if (!t1)
        return false;

    retval.setFromValue(val1);

    let token = stream.next();

    while (
        token?.tt == TokenType.XOR
    ) {
        t1 = BWAndExpr(stream, val2);

        if (!t1)
            return parse_error("Missing operand after operator");

        if (!retval.isNumber() || !val2.isNumber())
            return parse_error(`Illegal types for ${token.lexeme}: ${retval.typeStr()} and ${val2.typeStr()}`)

        // Evaluate
        retval.setFromValue(retval.bwxor(val2));

        token = stream.next();
    }
    stream.pushback(token);
    return true;
}

// BWAndExpr  -> EqualExpr {& EqualExpr}*
export function BWAndExpr(stream, retval) {
    let val1 = new Value(), val2 = new Value();

    let t1 = EqualExpr(stream, val1);

    if (!t1)
        return false;

    retval.setFromValue(val1);

    let token = stream.next();

    while (
        token?.tt == TokenType.BWAND
    ) {
        t1 = EqualExpr(stream, val2);

        if (!t1)
            return parse_error("Missing operand after operator");

        if (!retval.isNumber() || !val2.isNumber())
            return parse_error(`Illegal types for ${token.lexeme}: ${retval.typeStr()} and ${val2.typeStr()}`)

        // Evaluate
        retval.setFromValue(retval.bwand(val2));

        token = stream.next();
    }
    stream.pushback(token);
    return true;
}

// EqualExpr -> CompExpr {(== | !=) CompExpr}*
export function EqualExpr(stream, retval) {
    let val1 = new Value(), val2 = new Value();

    let t1 = CompExpr(stream, val1);

    if (!t1)
        return false;

    retval.setFromValue(val1);

    let token = stream.next();

    while (
        token.tt == TokenType.EQUAL ||
        token.tt == TokenType.NEQUAL
    ) {
        t1 = CompExpr(stream, val2);

        if (!t1)
            return parse_error("Missing operand after operator");

        if (!retval.isNumber() || !val2.isNumber())
            return parse_error(`Illegal types for ${token.lexeme}: ${retval.typeStr()} and ${val2.typeStr()}`)
        // Evaluate
        if (token.tt == TokenType.EQUAL)
            retval.setFromValue(retval.equal(val2));
        if (token.tt == TokenType.NEQUAL)
            retval.setFromValue(retval.nequal(val2));

        token = stream.next();
    }
    stream.pushback(token);
    return true;
}

// CompExpr -> ShiftExpr {(< | <= | > | >=) ShiftExpr}*
export function CompExpr(stream, retval) {
    let val1 = new Value(), val2 = new Value();

    let t1 = ShiftExpr(stream, val1);

    if (!t1)
        return false;

    retval.setFromValue(val1);

    let token = stream.next();

    while (
        token?.tt == TokenType.LTHAN   ||
        token?.tt == TokenType.LTHANEQ ||
        token?.tt == TokenType.GTHAN   ||
        token?.tt == TokenType.GTHANEQ
    ) {
        t1 = ShiftExpr(stream, val2);

        if (!t1)
            return parse_error("Missing operand after operator");

        if (!retval.isNumber() || !val2.isNumber())
            return parse_error(`Illegal types for ${token.lexeme}: ${retval.typeStr()} and ${val2.typeStr()}`)
        // Evaluate
        if (token.tt == TokenType.LTHAN)
            retval.setFromValue(retval.lthan(val2));
        if (token.tt == TokenType.LTHANEQ)
            retval.setFromValue(retval.lthaneq(val2));
        if (token.tt == TokenType.GTHAN)
            retval.setFromValue(retval.gthan(val2));
        if (token.tt == TokenType.GTHANEQ)
            retval.setFromValue(retval.gthaneq(val2));

        token = stream.next();
    }
    stream.pushback(token);
    return true;
}

// ShiftExpr -> AddExpr {(<< | >>) AddExpr}*
export function ShiftExpr(stream, retval) {
    let val1 = new Value(), val2 = new Value();

    let t1 = AddExpr(stream, val1);

    if (!t1)
        return false;

    retval.setFromValue(val1);

    let token = stream.next();

    while (
        token.tt == TokenType.LSHIFT ||
        token.tt == TokenType.RSHIFT
    ) {
        t1 = AddExpr(stream, val2);

        if (!t1)
            return parse_error("Missing operand after operator");

        if (!retval.isNumber() || !val2.isNumber())
            return parse_error(`Illegal types for ${token.lexeme}: ${retval.typeStr()} and ${val2.typeStr()}`)
        // Evaluate
        if (token.tt == TokenType.LSHIFT)
            retval.setFromValue(retval.lshift(val2));
        if (token.tt == TokenType.RSHIFT)
            retval.setFromValue(retval.rshift(val2));

        token = stream.next();
    }
    stream.pushback(token);
    return true;
}

// Expr -> Term {(+ | -) Term}*
export function AddExpr(stream, retval) {
    let val1 = new Value(), val2 = new Value();

    let t1 = Term(stream, val1);

    if (!t1)
        return false;

    retval.setFromValue(val1);

    let token = stream.next();

    while (
        token.tt == TokenType.PLUS ||
        token.tt == TokenType.MINUS
    ) {
        t1 = Term(stream, val2);

        if (!t1)
            return parse_error("Missing operand after operator");

        if (!retval.isNumber() || !val2.isNumber())
            return parse_error(`Illegal types for ${token.lexeme}: ${retval.typeStr()} and ${val2.typeStr()}`)
        // Evaluate
        if (token.tt == TokenType.PLUS)
            retval.setFromValue(retval.add(val2));
        if (token.tt == TokenType.MINUS)
            retval.setFromValue(retval.sub(val2));

        token = stream.next();
    }
    stream.pushback(token);
    return true;
}

// Term -> FuncChain {(* | / | %) FuncChain}*
export function Term(stream, retval) {
    let val1 = new Value(), val2 = new Value();
    let t1 = FuncChain(stream, val1);

    if (!t1)
        return false;

    retval.setFromValue(val1);

    let token = stream.next();

    while (
        token?.tt == TokenType.MULT ||
        token?.tt == TokenType.DIV  ||
        token?.tt == TokenType.MOD
    ) {
        t1 = FuncChain(stream, val2);

        if (!t1)
            return parse_error("Missing operand after operator");

        if (!retval.isNumber() || !val2.isNumber())
            return parse_error(`Illegal types for ${token.lexeme}: ${retval.typeStr()} and ${val2.typeStr()}`)
        // Evaluate
        if (token.tt == TokenType.MULT)
            retval.setFromValue(retval.mult(val2));
        if (token.tt == TokenType.DIV) {
            if (val2.Ntemp === 0)
                return parse_error("Divide by zero");
            retval.setFromValue(retval.div(val2));
        }
        if (token.tt == TokenType.MOD)
            retval.setFromValue(retval.mod(val2));

        token = stream.next();
    }
    stream.pushback(token);
    return true;
}

// FuncChain -> SFactor {-> SFactor}*
// 5 -> print
//   print(5)
// typeof 5 -> concat("s") -> print();
//   print(concat(typeof 5, "s"));
export function FuncChain(stream, retval) {
    // TODO: Figure this out
    let val1 = new Value(), val2 = new Value();
    let t1 = SFactor(stream, val1);
    if (!t1)
        return false;
    retval.setFromValue(val1);
    let token = stream.next();
    while (
        token.tt === TokenType.RARROW
    ) {
        t1 = SFactor(stream, val2);
        if (!t1)
            return parse_error("Missing operand after operator");
        if (!retval.isFunction())
            return parse_error(`Illegal types for ${token.lexeme}: ${retval.typeStr()} and ${val2.typeStr()}`)
        token = stream.next();
    }
    stream.pushback(token);
    return true;
}

// SFactor -> (typeof | + | - | ! | ~) AccessFactor
export function SFactor(stream, retval) {
    let unary = null;
    let status = false;
    let token = stream.next();
    if (isUnaryOp(token.tt))
        unary = token;
    else
        stream.pushback(token);

    if (isUnaryOp(stream.peek().tt))
        status = SFactor(stream, retval);
    else
        status = AccessFactor(stream, retval);

    if (!status)
        return false
    if (unary !== null) {
        let err = `Illegal type for ${unary.lexeme}: ${retval.typeStr()}`;
        switch (unary.tt) {
            case TokenType.PLUS:
                if (!retval.isNumber())
                    return parse_error(err)
                retval.setNumber(retval.Ntemp);
                break;
            case TokenType.MINUS:
                if (!retval.isNumber())
                    return parse_error(err)
                retval.setNumber(-retval.Ntemp);
                break;
            case TokenType.NOT:
                if (!retval.isNumber())
                    return parse_error(err)
                retval.setNumber(+!retval.Ntemp);
                break;
            case TokenType.BWNOT:
                if (!retval.isNumber())
                    return parse_error(err)
                retval.setNumber(~retval.Ntemp);
                break;
            case TokenType.TYPEOF:
                retval.setString(retval.typeStr());
                break;
        }
    }
    return true;
}

// AccessFactor -> Factor { [ Expr ] }*
//               | Factor { . ident }*
//               | Factor ( ArgList )
export function AccessFactor(stream, retval) {
    let status = Factor(stream, retval);
    if (!status)
        return false;
    let token = stream.next();
    let val = new Value();
    while (
        token.tt === TokenType.LBRACK ||
        token.tt === TokenType.LPAREN ||
        token.tt === TokenType.DOT
    ) {
        if (token.tt === TokenType.LBRACK) {
            // debugger;
            let index_val = new Value();
            status = Expr(stream, index_val);
            if (!status)
                return false;
            token = stream.next();
            if (token.tt !== TokenType.RBRACK)
                return parse_error("Missing ']' in array indexing");

            // Make sure each type gets appropriate indexing
            if (retval.isArray()) {
                if (!index_val.isNumber())
                    return parse_error("Array must be indexed by number");
                if (index_val.Ntemp >= retval.Atemp.length)
                    return parse_error("Array index out of bounds");
                val.setFromValue(retval.getArrayValue(index_val.Ntemp));
            }
            else if (retval.isString()) {
                if (!index_val.isNumber())
                    return parse_error("String must be indexed by number");
                if (index_val.Ntemp >= retval.Stemp.length)
                    return parse_error("String index out of bounds");
                val.setFromValue(retval.getStringValue(index_val.Ntemp));
            }
            else if (retval.isObject()) {
                if (!index_val.isString())
                    return parse_error("Object must be indexed by string");
                // TODO: Finish object indexing, decide what to do with missing keys
                if (!retval.hasKey(index_val.Stemp))
                    return parse_error(`Key ${index_val.Stemp} does not exist`);
                val.setFromValue(retval.getObjectValue(index_val.Stemp));
            }
            else
                return parse_error(`Type ${retval.typeStr()} not indexable`)

        }
        else if (token.tt === TokenType.LPAREN) {
            if (!retval.isFunction())
                return parse_error(`Type '${retval.typeStr()}' is not callable`);
            status = FunctionCall(stream, retval, val, retval.Ftemp.name ?? "anonymous");
            if (!status)
                return false;
        }
        else if (token.tt === TokenType.DOT) {
            token = stream.next();
            if (token.tt !== TokenType.Ident)
                return parse_error("Expected ident after '.'");
            if (!retval.isObject())
                return parse_error(`Type '${retval.typeStr()}' not allowed for member access.`);
            if (!retval.hasKey(token.lexeme))
                return parse_error(`Key ${token.lexeme} does not exist`);
            val.setFromValue(retval.getObjectValue(token.lexeme));
        }
        retval.setFromValue(val);
        token = stream.next();
    }
    stream.pushback(token);
    return status;
}

// Factor -> number
// Factor -> string
// Factor -> Array
// Factor -> Object
// Factor -> FunctionLiteral
// Factor -> ident
// Factor -> ( Expr )
export function Factor(stream, retval) {
    let token = stream.next();
    let val = new Value();
    let status = false;

    switch (token.tt) {

        case TokenType.Ident:
            let symbolname = token.lexeme;
            let symbolval = symbolTable.find(symbolname);
            if (!symbolval)
                return parse_error(`Use of undeclared ident '${symbolname}'`)
            retval.setFromValue(symbolval);
            return true;

        case TokenType.Number:
            let n = Number(token.lexeme);
            // let n = Number(remove_seperator(token.lexeme));
            val.setNumber(n);
            retval.setFromValue(val);
            return true;

        case TokenType.String:
            let s = token.lexeme;
            // Remove '"' from String literal lexeme
            s = s.substring(1, s.length - 1);
            val.setString(s);
            retval.setFromValue(val);
            return true;

        // Object literal
        case TokenType.LBRACE:
            status = Object(stream, retval);
            return true;

        // Array literal
        case TokenType.LBRACK:
            status = Array(stream, retval);
            return true;

        // Function literal
        case TokenType.FN:
            status = FunctionLiteral(stream, val);
            retval.setFromValue(val);
            return true;

        // ( Expr )
        case TokenType.LPAREN:
            status = Expr(stream, val);
            token = stream.next();
            if (token.tt != TokenType.RPAREN)
                return parse_error("Missing `)` in expression");
            retval.setFromValue(val);
            return status;

        default:
            return parse_error(`Unexpected input ${token.lexeme}`)
    }
}

// Starts with the assumption a `[` has been read.
// Array -> [ {Expr{, Expr}*} ]
export function Array(stream, retval) {
    let token = stream.next();
    let val = new Value();
    let status;
    retval.setArray([]);

    if (token.tt === TokenType.RBRACK)
        return true;

    while (token.tt != TokenType.RBRACK) {
        stream.pushback(token);
        status = Expr(stream, val);
        retval.addArrayValue(Value.from(val));
        if (!status)
            return parse_error("Array list error");
        token = stream.next();
        if (token.tt !== TokenType.COMMA && token.tt !== TokenType.RBRACK)
            return parse_error("Array list error");
        if (token.tt === TokenType.RBRACK)
            stream.pushback(token)
        else
            token = stream.next();
    }
    token = stream.next();
    if (token.tt !== TokenType.RBRACK)
        return parse_error("Missing `]` in array literal");
    return true;
}

// Starts with the assumption a `[` has been read.
// Object -> { { ObjectKey : OrExpr }* }
export function Object(stream, retval) {
    let token = stream.next();
    let val = new Value();
    let status;
    retval.setObject({});

    if (token.tt === TokenType.RBRACE)
        return true;

    while (token.tt !== TokenType.RBRACE) {
        let id = token, colon = stream.next();
        let key;
        if (id.tt === TokenType.Ident && colon.tt === TokenType.COLON) {
            key = id.lexeme;
        } else {
            stream.pushback(colon);
            stream.pushback(id);
            status = Expr(stream, val);
            if (!status)
                return false;
            if (!val.isString())
                return parse_error("Object key must be string");
            key = val.Stemp;
            token = stream.next();
            if (token.tt !== TokenType.COLON)
                return parse_error("Missing : in object key/value");
        }
        status = Expr(stream, val);
        retval.setObjectValue(key, Value.from(val));
        token = stream.next();
        if (token.tt !== TokenType.COMMA && token.tt !== TokenType.RBRACE)
            return parse_error("Object list error");
        if (token.tt === TokenType.RBRACE)
            stream.pushback(token)
        else
            token = stream.next();
    }
    token = stream.next();
    if (token.tt !== TokenType.RBRACE)
        return parse_error("Missing `}` in object literal");
    return true;
}

// fn: FunctionValue, args: Value[]
export function call(fn, args) {
    let value = new Value();
    if (fn.isIntrinsic()) {
        let res = fn.Ftemp.fn(...args);
        if (fn.Ftemp.returns) {
            return res;
        } else {
            // Implicit return 1
            return Value.fromNumber(1);
        }
    }

    const subroutine = fn.toTokenStream();
    const arg_zip = zip(args, fn.Ftemp.params);

    let nested = false;
    symbolTable.addScope();
    typeTable.addScope();
    for (let [arg, param] of arg_zip)
        symbolTable.add(param.name, arg);
    if (fnState.in_function)
        nested = true;
    fnState.in_function = true;
    status = Stmts(subroutine);
    if (!nested)
        fnState.in_function = false;
    symbolTable.popScope();
    typeTable.popScope();

    if (fnState.fn_returning)
        value.setFromValue(fnState.return_stack.pop());
    else
        // Implicit return 1
        value.setNumber(1);
    fnState.fn_returning = false;
    return value;
}

// Starts with the assumption `ident` and `(` have already been read.
// FunctionCall -> ident ( ArgList )
export function FunctionCall(stream, fnval, retval, ident) {
    let args = [];
    //const fn = symbolTable.find(ident);
    let status = ArgList(stream, args);
    if (!status)
        return false;
    let token = stream.next();
    if (token.tt !== TokenType.RPAREN)
        return parse_error("Missing closing paren in func call");
    if (args.length !== fnval.paramCount())
        return parse_error(`Expected ${fnval.paramCount()} args, got ${args.length}, in function ${ident ?? "anonymous"}`);

    retval.setFromValue(call(fnval, args));
    return true;
}

// ArgList -> Empty | Expr{, Expr}*
export function ArgList(stream, args) {
    let token = stream.next();
    let val = new Value();
    let status;

    if (token.tt === TokenType.RPAREN) {
        stream.pushback(token);
        return true;
    }

    while (token.tt !== TokenType.RPAREN) {
        stream.pushback(token);
        status = Expr(stream, val);
        args.push(Value.from(val));
        if (!status)
            return parse_error("Arg list error");
        token = stream.next();
        if (token.tt !== TokenType.COMMA && token.tt !== TokenType.RPAREN)
            return parse_error("Arg list error");
        if (token.tt === TokenType.RPAREN)
            stream.pushback(token)
        else
            token = stream.next();
    }
    return true;
}

// Starts with the assumption an `ident` has already been read.
// VariableRef  -> ident
//               | ident { [ Expr ] }*
//               | ident { . ident }*
// Returns the ACTUAL REFERENCE to the symbol
export function VariableRef(stream, ident) {
    let token = stream.next();
    let ident_val = symbolTable.find(ident);
    let val = new Value();

    while (
        token.tt === TokenType.LBRACK ||
        token.tt === TokenType.LPAREN ||
        token.tt === TokenType.DOT
    ) {
        if (token.tt === TokenType.LBRACK) {
            // debugger;
            let index_val = new Value();
            status = Expr(stream, index_val);
            if (!status)
                return false;
            token = stream.next();
            if (token.tt !== TokenType.RBRACK)
                return parse_error("Missing ']' in array indexing");

            // Make sure each type gets appropriate indexing
            if (ident_val.isArray()) {
                if (!index_val.isNumber())
                    return parse_error("Array must be indexed by number");
                if (index_val.Ntemp >= ident_val.Atemp.length)
                    return parse_error("Array index out of bounds");
                ident_val = ident_val.getArrayValue(index_val.Ntemp);
            }
            else if (ident_val.isString()) {
                if (!index_val.isNumber())
                    return parse_error("String must be indexed by number");
                if (index_val.Ntemp >= ident_val.Stemp.length)
                    return parse_error("String index out of bounds");
                ident_val = ident_val.getStringValue(index_val.Ntemp);
            }
            else if (ident_val.isObject()) {
                if (!index_val.isString())
                    return parse_error("Object must be indexed by string");
                // TODO: Finish object indexing, decide what to do with missing keys
                if (!ident_val.hasKey(index_val.Stemp))
                    return parse_error(`Key ${index_val.Stemp} does not exist`);
                ident_val = ident_val.getObjectValue(index_val.Stemp);
            }
            else
                return parse_error(`Type ${ident_val.typeStr()} not indexable`)
        }
        else if (token.tt === TokenType.LPAREN) {
            if (!ident_val.isFunction())
                return parse_error(`${ident_val.typeStr()} is not callable`);
            // debugger;
            status = FunctionCall(stream, ident_val, val, token.lexeme);
            if (!status)
                return false;
            ident_val = val;
        }
        else if (token.tt === TokenType.DOT) {
            token = stream.next();
            if (token.tt !== TokenType.Ident)
                return parse_error("Expected ident after '.'");
            if (!ident_val.hasKey(token.lexeme))
                return parse_error(`Key ${token.lexeme} does not exist`);
            ident_val = ident_val.getObjectValue(token.lexeme);
        }
        token = stream.next();
    }
    stream.pushback(token);
    return ident_val;
}

