import { StringStream } from "./charstream.js";
import { Stmts, debug_info } from "./parser.js";
import { TokenStream } from "./lexer.js";
import { library } from "./library.js";

export function interpret(line) {
    const sstream = new StringStream(line);
    const tstream = new TokenStream(sstream);
    Stmts(tstream);
}

const ss = new StringStream(
    `
    let msgs = ["hello", "There"];
    for msg in msgs {
        msg = toupper(msg);
        print(msg);
    }
    print(msgs);

    #fn pos(n) { return n >= 0; }
    #forEach(map(filter(a, pos), sqrt), printf);
    `
);
const ts = new TokenStream(ss);

let status = Stmts(ts);
debug_info(ts);

window.x = interpret;

// a -> filter(pos) -> map(sqrt) -> forEach(printf)
// forEach(map(filter(a, pos), sqrt), printf);
