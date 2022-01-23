import { interpret } from "./script.js"
import {
    intrinsic_fns,
    intrinsic_docs,
    add
} from "./intrinsics.js";
import { symbolTable } from "./parser.js";
import {
    Value,
    Param
} from "./value.js";
import { Type } from "./type.js";
import { TokenStream } from "./lexer.js";
import {
    TokenType,
    token_type_str,
    keywords,
    operators,
    types
} from "./token.js";

const stream = document.getElementsByClassName("stream")[0];
const prompt = document.getElementsByClassName("edit")[0];
const highlighted = document.getElementsByClassName("edit-highlighted")[0];

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

function nbsp(str) {
    // Match whitespace outside of HTML tags
    let regex = /(\s)(?!([^<]+)?>)/gi;
    return str.replaceAll(regex, "&nbsp;");
}

// Tutorial pages
const tutorial_pages = [];
tutorial_pages.push([
    "Welcome to the tutorial!",
    "Page 0/?: <u>Introduction</u>",
    "This language is <b>imperative</b> and <b>dynamically-typed</b>.",
    `Variables are declared with ${highlight("let or final")}.`,
    highlight("   let y = 0;"),
    highlight("   final NAME = \"Chris\";"),
    `Functions are declared with the ${highlight("fn")} keyword.`,
    highlight("   fn my_fn(a, b) {"),
    highlight("       return a + b;"),
    highlight("   }"),
    `Enter ${highlight("tut(1);")} to go to the next page.`
]);
tutorial_pages.push([
    "Page 1/?: <u>Data Types</u>",
    "There are 5 main data types:",
    "Number:",
    highlight("   42, -3.14, 0xFF, 0b101"),
    "String:",
    highlight('   "Hello, world!"'),
    "Array:",
    highlight('   [1, 2, ["3", 4]]'),
    "Object:",
    highlight('   {x: 3, "y": 9}'),
    "Function:",
    highlight("   fn f(a, b) { return a + b; }"),
    highlight("   f = fn() { print(99); };"),
]);
tutorial_pages.push([
    "Page 2/?: <u>Control Flow</u>",
    `Condtionally branch with an ${highlight("if")} statement.`,
    highlight("   if age >= 21 {"),
    highlight("       # Code..."),
    highlight("   }"),
    `Loop while a condition evalutes to true with a ${highlight("while")} statement.`,
    highlight("   while i < len(arr) {"),
    highlight("       # Code..."),
    highlight("   }"),
    "A condition is <b>true</b> if it evalutes to a non-zero number.",
    "Otherwise, the condition evaluates to <b>false</b>.",
]);
tutorial_pages.push([
    "Page 3/?: <u>Functions</u>",
    "Functions are simply variables and can be reassigned.",
    highlight("   my_fn = fn() {"),
    highlight('       print("Hello, world!");'),
    highlight("   };"),
    "Additionally, functions can be passed as arguments.",
    highlight("   final arr = [-1, 0, 3];"),
    highlight("   forEach(arr, print);"),
    "Function literals are defined in an expression without",
    "an identifier.",
    highlight("   filter(arr, fn(x) { return x >= 0; });"),
    `Functions that do not ${highlight("return")} implicitly ${highlight("return 1.")}`,
]);
tutorial_pages.push([
    "Page 4/? <u>Arrays</u>",
    "Arrays are a collection of values of any type.",
    highlight('   let arr = [0, "str", fn() {}, []];'),
    "Get items in an array using [index].",
    highlight('   arr[1]; # "str"'),
    "Set items in an array in a similar way.",
    highlight("   arr[0] = 0xff;"),
    "The length of an array is found with the <b>len</b> function.",
    highlight("   len(arr) == 4; # true"),
]);
tutorial_pages.push([
    "Page 5/? <u>Strings</u>",
    `Strings are created with quotation marks (${highlight('""')}).`,
    highlight('   let str = "apple";'),
    'Strings can be indexed just like arrays.',
    highlight('   str[0]; # "a"'),
    'Additionally, string length can be found with the <b>len</b> function.',
    highlight("   len(str) == 5; # true"),
    'Strings can be concatenated (added) with other strings',
    'using the <b>concat</b> function.',
    highlight('   concat("ab", "cd"); # "abcd"'),
]);
tutorial_pages.push([
    "Page 6/? <u>String Methods</u>",
    "String comparison:",
    highlight('   streq("Hello", "Hello"); # true'),
    highlight('   strcmp("aa", "ab"); # -1, "aa" is less than "ab"'),
    "Length:",
    highlight('   len("Hello"); # 5'),
    "Substring extraction:",
    highlight('   substring("apple", 1, 4); # "ppl"'),
    "String creation:",
    highlight('   repeat("G", 2); # "GG"'),
    highlight('   concat("ab", "cd"); # "abcd"'),
    "Conversion:",
    highlight('   toupper("apple"); # "APPLE"'),
    highlight('   tolower("CHRIS"); # "chris"'),
    `Enter ${highlight("docs(func);")} to get full documentation on`,
    "a builtin function.",
    `Ex: ${highlight("docs(print);")}`,
]);
tutorial_pages.push([
    "Page 7/? <u>Array Methods</u>",
    "Length:",
    highlight('   len([1, 2, 3]) == 3; # true'),
    "Add to array:",
    highlight('   let arr = [1, 2];'),
    highlight('   push(arr, 3); # [1, 2, 3]'),
    "Remove from array:",
    highlight('   pop(arr); # 3'),
    highlight('   dequeue(arr); # 1'),
    "Join arrays:",
    highlight('   concat([1, 2], [3, 4]); # [1, 2, 3, 4]'),
    "Copy arrays:",
    highlight('   shallowcopy(arr);'),
    highlight('   deepcopy(arr);'),
    `Enter ${highlight("docs(func);")} to get full documentation on`,
    "a builtin function.",
    `Ex: ${highlight("docs(print);")}`,
]);

//===========================
// Define CLI intrinsics
//===========================
intrinsic_docs["print"] = {
    desc: [
        "Print arguments' str reprs to the console.",
    ],
    params: [
        new Param("...args", Type.Any()),
    ],
    returns: {},
};
// If __log is true, set the innerHTML content.
// Otherwise, set the innerText content.
function print(args, __log = false, __loc = "ans") {
    const line = document.createElement("div");
    const time = document.createElement("p");
    const location = document.createElement("p");
    const stuff = document.createElement("p");

    line.classList.add("line");
    time.classList.add("time");
    location.classList.add("location");
    if (__loc === "ans")
        location.classList.add("normal");
    else
        location.classList.add("loccolor");
    stuff.classList.add("info")

    time.innerText = formatted_time();
    location.innerText = __loc;

    if (__log)
        stuff.innerHTML = nbsp(args.printFmt());
    else
        stuff.innerText = args.printFmt();

    line.append(time);
    line.append(location);
    line.append(stuff);
    stream.append(line);
}
add("print", print, false);

intrinsic_docs["clear"] = {
    desc: [
        "Flush the console stream and clear the console.",
    ],
    params: [],
    returns: {},
};
function clear() {
    stream.innerHTML = "";
}
add("clear", clear, false);

intrinsic_docs["help"] = {
    desc: [
        "Prints help messages to the console.",
    ],
    params: [],
    returns: {},
};
function help() {
    const msgs = [
        "This is the help message",
        `Enter ${highlight("clear();")} to clear the console.`,
        `Enter ${highlight("tut(0);")} to learn more about the language.`,
        `Enter ${highlight("ls();")} to list the pages on this site.`,
        `Enter ${highlight('goto("&lt;page&gt;");')} to change pages.`,
    ];
    for (const msg of msgs)
        print(Value.fromString(msg), true);
}
add("help", help, false);

intrinsic_docs["docs"] = {
    desc: [
        "Prints documentation on builtin",
        "functions to the console.",
    ],
    params: [
        new Param("fn", Type.Function()),
    ],
    returns: {},
};
function docs(fn) {
    if (!fn.isFunction()) {
        print(Value.fromString("Pass in a builtin function to get documentation."));
        print(Value.fromString(`Ex: ${highlight("docs(print);")}`), true);
        return;
    }
    if (!fn.isIntrinsic()) {
        print(Value.fromString("No docs available."));
        return;
    }
    const fn_name = fn.Ftemp.fn.name;
    const fn_docs = intrinsic_docs[fn_name];
    const tab = "    ";
    // Print name and description
    print(Value.fromString(`<span class="function">${fn_name}</span>`), true);
    fn_docs.desc.forEach(msg => {
        print(Value.fromString(`${tab}${msg}`), true);
    });

    // Print parameters
    print(Value.fromString('<span class="keyword">Parameters</span>:'), true);
    if (fn_docs.params.length === 0)
        print(Value.fromString(`${tab}none`), true);
    else
        fn_docs.params.forEach(param => {
            const name = param.name;
            const type = param.type;
            print(Value.fromString(`${tab}${name} : ${highlight(type.printFmt())}`), true);
        });

    // Print returns
    print(Value.fromString('<span class="keyword">Returns</span>:'), true);
    if (Object.keys(fn_docs.returns).length === 0) {
        print(Value.fromString(`${tab}none`), true);
    } else {
        const return_desc = fn_docs.returns.desc;
        const return_type = fn_docs.returns.type;
        print(Value.fromString(`${tab}${highlight(return_type.printFmt())} : ${return_desc}`), true);
    }

    // Print examples if they exist
    if (fn_docs.example !== undefined) {
        print(Value.fromString('<span class="keyword">Example</span>:'), true);
        for (const msg of fn_docs.example)
            print(Value.fromString(`${tab}${highlight(msg)}`), true);
    }
}
add("docs", docs, false);

intrinsic_docs["tutorial"] = {
    desc: [
        "Prints tutorial messages to the console.",
    ],
    params: [
        new Param("page", Type.Number()),
    ],
    returns: {},
};
intrinsic_docs["tut"] = intrinsic_docs["tutorial"];
function tutorial(page) {
    if (page.Ntemp < 0 || page.Ntemp > tutorial_pages.length - 1) {
        print(Value.fromString(`Available pages: ${0} to ${tutorial_pages.length - 1}`));
        return;
    }
    for (const msg of tutorial_pages[page.Ntemp])
        print(Value.fromString(msg), true);
}
add("tutorial", tutorial, false);
add("tut", tutorial, false);

intrinsic_docs["goto"] = {
    desc: [
        "Move to a location in the console.",
    ],
    params: [
        new Param("loc", Type.String()),
    ],
    returns: {},
};
intrinsic_docs["cd"] = intrinsic_docs["goto"];
function goto(loc) {
    const loc_str = loc.Stemp.toLowerCase();
    if (loc_str === "<page>") {
        print(Value.fromString(`Enter ${highlight("ls();")} and pass in the page you want to go to.`), true);
        print(Value.fromString(`Ex: ${highlight('goto("contact")')};`), true);
        return;
    }
    if (loc_str === null) {
        print(Value.fromString("Expected a string."));
        print(Value.fromString(`Ex: ${highlight('goto("contact")')};`), true);
        return;
    }
    if (!Object.keys(locations).includes(loc_str)) {
        print(Value.fromString(`${loc_str} doesn't exist`));
        print(Value.fromString(`Enter ${highlight("ls();")} and pass in the page you want to go to.`), true);
        print(Value.fromString(`Ex: ${highlight('goto("contact")')};`), true);
        return;
    }
    cur_loc = loc_str;
    for (const msg of locations[cur_loc])
        print(Value.fromString(msg), true, cur_loc);
}
add("goto", goto, false);
add("cd", goto, false);

intrinsic_docs["list"] = {
    desc: [
        "List all locations in the page and show which is current.",
    ],
    params: [],
    returns: {},
};
intrinsic_docs["ls"] = intrinsic_docs["list"]
function list() {
    for (const loc in locations) {
        let res;
        if (loc === cur_loc)
            res = "&gt; <u>" + loc + "</u>";
        else
            res = "  " + loc;
        print(Value.fromString(res), true);
    }
}
add("list", list, false);
add("ls", list, false);

// Add our CLI intrinsics to the symboltable
for (const intrinsic in intrinsic_fns)
    symbolTable.add(intrinsic, intrinsic_fns[intrinsic]);

const locations = {};
let cur_loc = "home";
locations["home"] = [
    "Welcome to the command line!",
    'Check out my <a href="https://github.com/hahdookin/hahdookin.github.io" target="_blank">source code</a>.',
    "",
    'Click <a href="../index.html">here</a> for non-interactive site.',
    `Enter ${highlight("help();")} for more information.`,
]
locations["about"] = [
    "Hi! My name is <b>Chris Pane</b>.",
    "",
    "I am a computer science student at NJIT.",
    "In my free time, I like to program cool stuff",
    "like this site you're on right now.",
    "",
    `Make sure to ${highlight('goto("projects");')} to see`,
    "some of the stuff I've worked on.",
    "",
    `You can also ${highlight('goto("contact")')} to contact me.`
];
locations["contact"] = [
    'Shoot me an email at <a href="mailto: ChrisPaneCS@gmail.com">ChrisPaneCS@gmail.com</a>.',
    "",
    '<a href="https://github.com/hahdookin" target="_blank">GitHub</a>, <a href="https://www.linkedin.com/in/christopher-pane-725b8b1a4/" target="_blank">LinkedIn</a>, <a href="#">YouTube</a>',
];
locations["projects"] = [

];

const time_cur = document.querySelectorAll(".editline > .time")[0];
// Callback to live update time in editline
function set_time() {
    time_cur.innerText = formatted_time();
}

function log(loc, msg) {
    const line = document.createElement("div");
    const time = document.createElement("p");
    const location = document.createElement("p");
    const stuff = document.createElement("p");

    line.classList.add("line");
    time.classList.add("time");
    location.classList.add("location", "loccolor");
    stuff.classList.add("info")

    time.innerText = formatted_time();
    location.innerText = loc;

    stuff.innerHTML = nbsp(msg);

    line.append(time);
    line.append(location);
    line.append(stuff);
    stream.append(line);
}

const history = [];
let history_index = null;
prompt.addEventListener("keydown", e => {
    if (e.key === "Enter") {
        // Handle line continuation
        const last = prompt.innerText.trim();
        if (last.charCodeAt(last.length - 1) === 92) // 92 is '\'
            return;
        log(cur_loc, highlighted.innerHTML);
        interpret(prompt.innerText);
        // Handle command history
        if (prompt.innerText.trim() !== "") {
            history.push(prompt.innerText);
            if (history_index === null)
                history_index = 0;
            else
                history_index++;
        }
        prompt.innerText = "";
    } else if (e.key === "ArrowUp") {
        // Handle command history
        e.preventDefault();
        if (history_index === null) return;
        prompt.innerText = history[history_index];
        highlighted.innerHTML = highlight(prompt.innerText);
        if (history_index > 0)
            history_index--;
    } else if (e.key === "ArrowDown") {
        // Handle command history
        e.preventDefault();
        if (history_index === null) return;
        if (history_index === history.length - 1) {
            prompt.innerText = "";
            highlighted.innerText = "";
            return;
        }
        if (history_index < history.length - 1)
            history_index++;
        prompt.innerText = history[history_index];
        highlighted.innerHTML = highlight(prompt.innerText);
    }
});

// Determine the highlight class for a given token
function token_highlight_class(token, peek) {
    if (keywords.find(token.lexeme))
        return "keyword";
    if (operators.find(token.lexeme))
        return "normaltext";
    if (types.find(token.lexeme))
        return "type";
    switch (token.tt) {
        case TokenType.Number:
            return "number";
        case TokenType.String:
            return "string";
        case TokenType.Comment:
            return "comment";
        case TokenType.Ident:
            if (peek.tt === TokenType.LPAREN)
                return "function";
            return "normaltext";
        case TokenType.Error:
            return "error";
    }
    return "normaltext";
}

// Take in a line of code and highlight with CSS
function highlight(line) {
    // Create a parse tree
    let tstream = new TokenStream(line, true);
    let tokens = [];
    let cur = tstream.next();
    let peek = tstream.peek();
    let res = "";
    for (let i = 0; i < line.length; i++) {
        const hl_class = token_highlight_class(cur, peek);
        if (i === cur.start) {
            let lexeme = cur.lexeme;
            if (lexeme.includes("<"))
                lexeme = lexeme.replaceAll("<", "&lt;");
            if (lexeme.includes(">"))
                lexeme = lexeme.replaceAll(">", "&gt;");
            res += `<span class="${hl_class}">${lexeme}</span>`;
            i = cur.end;
            cur = tstream.next();
            peek = tstream.peek();
        } else {
            if (line[i] === '\n')
                res += "<br>";
            else if (line[i] === "<")
                res += "&lt;";
            else if (line[i] === ">")
                res += "&gt;";
            else
                res += line[i];
        }
    }
    return res;
}

prompt.addEventListener("input", e => {
    highlighted.innerHTML = highlight(prompt.innerText);
});

log(cur_loc, "");
log(cur_loc, "   $$$$$\\                               ");
log(cur_loc, "   \\__$$ |                              ");
log(cur_loc, "      $$ | $$$$$$\\   $$$$$$$\\  $$$$$$$\\ ");
log(cur_loc, "      $$ |$$  __$$\\ $$  _____|$$  _____|");
log(cur_loc, "$$\\   $$ |$$$$$$$$ |\\$$$$$$\\  \\$$$$$$\\  ");
log(cur_loc, "$$ |  $$ |$$   ____| \\____$$\\  \\____$$\\ ");
log(cur_loc, "\\$$$$$$  |\\$$$$$$$\\ $$$$$$$  |$$$$$$$  |");
log(cur_loc, " \\______/  \\_______|\\_______/ \\_______/ ");
log(cur_loc, "");

goto(Value.fromString("home"));

interpret(`
`)

set_time();
window.setInterval(set_time, 500);

