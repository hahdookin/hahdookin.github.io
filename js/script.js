import { TokenStream } from "./lexer.js";
import { Stmts, debug_info } from "./parser.js";

export function interpret(line) {
    const tstream = new TokenStream(line);
    Stmts(tstream);
}

window.x = interpret;

// a -> filter(pos) -> map(sqrt) -> forEach(printf)
// forEach(map(filter(a, pos), sqrt), printf);
