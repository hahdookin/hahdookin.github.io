
export function zip(a1, a2) {
    return a1.map((e, i) => [e, a2[i]]);
}

export function unreachable() {
    let linenr = new Error().lineNumber;
    console.error(`Unreachable line reached: ${linenr}`);
}
