import { Stmts } from "./parser.js";
import { TokenStream } from "./lexer.js";

export const library =
    `
    # Constants
    #final true = 1;
    #final false = 0;

    # API
    #fn map_mut(arr, f) {
    #fn reverse_mut(arr)
    `;
Stmts(new TokenStream(library));
