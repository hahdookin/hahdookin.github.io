//=======================
// prefixtrie.js
//=======================

import { token_type_str } from "./token.js";

class Node {
    constructor() {
        this.children = {};
        this.value = null;
    }
}

export class PrefixTrie {
    constructor() {
        this.root = new Node();
    }

    insert(key, val) {
        let cur = this.root;
        for (let char of key) {
            if (!cur.children[char])
                cur.children[char] = new Node();
            cur = cur.children[char];
        }
        cur.value = val;
    }

    find(key) {
        let cur = this.root;
        for (let char of key) {
            if (!cur.children[char])
                return null;
            cur = cur.children[char]
        }
        return cur.value
    }

    __print(cur, key, indent) {
        console.log(" ".repeat(indent) + `${key}:${token_type_str(cur.value)}`)
        for (let k in cur.children)
            this.__print(cur.children[k], k, indent + 2)
    }

    print() {
        this.__print(this.root, "root", 0)
    }
}
