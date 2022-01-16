import { StringStream } from "./charstream.js";
import { Stmts } from "./parser.js";
import { TokenStream } from "./lexer.js";

export const library =
    `
    # Constants
    #final true = 1;
    #final false = 0;

    # API
    fn map(arr, f) {
        let res = [];
        let i = 0;
        while i < len(arr) {
            push(res, f(arr[i]));
            i += 1;
        }
        return res;
    }
    fn map_mut(arr, f) {
        let i = 0;
        while i < len(arr) {
            arr[i] = f(arr[i]);
            i += 1;
        }
    }
    fn reverse(arr) {
        let res = [];
        let i = len(arr) - 1;
        while i >= 0 {
            push(res, arr[i]);
            i -= 1;
        }
        return res;
    }
    fn reverse_mut(arr) {

    }
    fn forEach(arr, f) {
        let i = 0;
        while i < len(arr) {
            f(arr[i]);
            i += 1;
        }
    }
    fn filter(arr, predicate) {
        let res = [];
        let i = 0;
        while i < len(arr) {
            if predicate(arr[i]) {
                push(res, arr[i]);
            }
            i += 1;
        }
        return res;
    }
    fn reduce(arr, accumulator) {
        let res = arr[0];
        let i = 1;
        while i < len(arr) {
            res = accumulator(res, arr[i]);
            i += 1;
        }
        return res;
    }
    fn sort(arr) {
        fn swap(arr, i, j) {
            let temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
        }
        let i = 0;
        let j = 0;
        while i < len(arr) - 1 {
            j = i + 1;
            while j < len(arr) {
                if arr[j] < arr[i] {
                    swap(arr, i, j);
                }
                j += 1;
            }
            i += 1;
        }
    }
    `;
Stmts(new TokenStream(new StringStream(library)));
