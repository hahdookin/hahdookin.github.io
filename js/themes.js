function theme(fg, nr, st, fn, kw, cm) {
    return {
        normal: fg,
        number: nr,
        string: st,
        function: fn,
        keyword: kw,
        comment: cm,
    };
}

export const themes = {};

themes["vscode"] = theme(
    "#c5c8c6",
    "#B5CEA8",
    "#CE9178",
    "#DCDCAA",
    "#C586C0",
    "#6A9955"
);


