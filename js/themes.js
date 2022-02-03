function random_color() {
    const digits = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++)
        color += digits[Math.floor(Math.random() * 16)];
    return color;
}

export function apply_theme(name, styleEle) {
    const theme = name === "random" ? Theme.random() : themes[name];
    const body = document.getElementsByTagName("body")[0];
    const editline = document.getElementsByClassName("editline")[0];

    // Set highlighting for keywords, strings, numbers, etc
    styleEle.innerHTML = theme.toCSS();

    // Set fg and bg (body's color and background color)
    body.style.color = theme.normal;
    body.style.backgroundColor = theme.background;

    // Set editline background
    editline.style.backgroundColor = theme.editline;
}

export class Theme {
    constructor() {}

    toCSS() {
        return `
        .keyword {
            font-weight: bold;
            color: ${this.keyword};
        }
        .number {
            color: ${this.number};
        }
        .string {
            color: ${this.string};
        }
        .function {
            font-weight: bold;
            color: ${this.function};
        }
        .type {
            color: ${this.type};
        }
        .normaltext {
            color: ${this.normal};
        }
        .comment {
            color: ${this.comment};
        }
        .error {
            color: ${this.error};
        }
        `
    }

    static random() {
        const res = new Theme();
        res.normal     = random_color();
        res.background = random_color();
        res.number     = random_color();
        res.string     = random_color();
        res.function   = random_color();
        res.keyword    = random_color();
        res.type       = random_color();
        res.comment    = random_color();
        res.error      = random_color();
        res.editline   = random_color();
        return res;
    }
}

export const themes = {};

themes["vscode"] = new Theme();
themes["vscode"].normal     = "#c5c8c6";
themes["vscode"].background = "#1d1f21";
themes["vscode"].number     = "#B5CEA8";
themes["vscode"].string     = "#CE9178";
themes["vscode"].function   = "#DCDCAA";
themes["vscode"].keyword    = "#C586C0";
themes["vscode"].type       = "#4EC9B0";
themes["vscode"].comment    = "#6A9955";
themes["vscode"].error      = "#F44747";
themes["vscode"].editline   = "#222222";

themes["blackocean"] = new Theme();
themes["blackocean"].normal     = "#dfdfdf";
themes["blackocean"].background = "#101316";
themes["blackocean"].number     = "#15b8ae";
themes["blackocean"].string     = "#7ebea0";
themes["blackocean"].function   = "#15b8ea";
themes["blackocean"].keyword    = "#007aae";
themes["blackocean"].type       = "#4EC9B0";
themes["blackocean"].comment    = "#60778c";
themes["blackocean"].error      = "#F44747";
themes["blackocean"].editline   = "#222222";

themes["powershell"] = new Theme();
themes["powershell"].normal     = "#B0F1AD";
themes["powershell"].background = "rgb(36, 57, 253)";
themes["powershell"].number     = "#CBDE39";
themes["powershell"].string     = "#AD8112";
themes["powershell"].function   = "#6EA162";
themes["powershell"].keyword    = "#A93FDE";
themes["powershell"].type       = "#805DA4";
themes["powershell"].comment    = "#11FB45";
themes["powershell"].error      = "#07958B";
themes["powershell"].editline   = "#222222";
