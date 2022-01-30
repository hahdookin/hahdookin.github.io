import {
    Value,
    Param
} from "./value.js";
import { Type } from "./type.js";

import { call } from "./parser.js";
import { zip } from "./utils.js";

//===========================
// Intrinsic Functions
//===========================
// Intrinsic functions may only take
// 'Value's as parameters and return
// a 'Value', if it returns anything.

export const intrinsic_fns = {};
// intrinsic_docs {
//   desc: String[],
//   params: {
//      name: String,
//      type: Type
//   }[],
//   returns: {
//      type: Type,
//      desc: String[],
//   }
//   example: String[] | undefined
// }
export const intrinsic_docs = {};
// export function add(name, params, fn, returns) {
export function add(name, fn, returns) {
    const fn_val = new Value();
    // Params are now defined in the docs, use those
    const params = intrinsic_docs[name].params;
    fn_val.setFunctionIntrinsic(params, fn, returns);
    intrinsic_fns[name] = fn_val;
}


//===========================
// Type safety library
//===========================
intrinsic_docs["isnumber"] = {
    desc: [
        "Check if a variable is number type",
    ],
    params: [
        new Param("value", Type.Any())
    ],
    returns: {
        type: Type.Number(),
        desc: "1 if number, 0 otherwise"
    },
    example: [
        "isnumber(1); # true",
        "isnumber(0xDEADBEEF); # true",
        "isnumber(0b1011); # true",
    ]
};
function isnumber(value) {
    return Value.fromNumber(+(value.isNumber()));
}
add("isnumber", isnumber, true);

intrinsic_docs["isstring"] = {
    desc: [
        "Check if a variable is string type",
    ],
    params: [
        new Param("value", Type.Any())
    ],
    returns: {
        type: Type.Number(),
        desc: "1 if string, 0 otherwise"
    },
    example: [
        'isstring("apple"); # true',
    ]
};
function isstring(value) {
    return Value.fromNumber(+(value.isString()));
}
add("isstring", isstring, true);

intrinsic_docs["isarray"] = {
    desc: [
        "Check if a variable is array type",
    ],
    params: [
        new Param("value", Type.Any()),
    ],
    returns: {
        type: Type.Number(),
        desc: "1 if array, 0 otherwise"
    },
    example: [
        "isarray([]); # true",
    ]
};
function isarray(value) {
    return Value.fromNumber(+(value.isArray()));
}
add("isarray", isarray, true);

intrinsic_docs["isobject"] = {
    desc: [
        "Check if a variable is object type",
    ],
    params: [
        new Param("value", Type.Any()),
    ],
    returns: {
        type: Type.Number(),
        desc: "1 if object, 0 otherwise"
    },
    example: [
        "isobject({}); # true",
    ]
};
function isobject(value) {
    return Value.fromNumber(+(value.isObject()));
}
add("isobject", isobject, true);

intrinsic_docs["isfunction"] = {
    desc: [
        "Check if a variable is function type",
    ],
    params: [
        new Param("value", Type.Any()),
    ],
    returns: {
        type: Type.Number(),
        desc: "1 if function, 0 otherwise"
    },
    example: [
        "isfunction(fn(){}); # true",
        "isfunction(print); # true",
    ]
};
function isfunction(value) {
    return Value.fromNumber(+(value.isFunction()));
}
add("isfunction", isfunction, true);



//===========================
// Array library
//===========================
intrinsic_docs["push"] = {
    desc: [
        "Pushes a value to the end of an array.",
    ],
    params: [
        new Param("arr", Type.Array()),
        new Param("val", Type.Any()),
    ],
    returns: {},
    example: [
        "let arr = []",
        "push(arr, 42);",
        "print(arr); # [42]"
    ]
};
function push(arr, val) {
    arr.addArrayValue(val);
}
add("push", push, false);

intrinsic_docs["pop"] = {
    desc: [
        "Remove the value at the end of",
        "an array and return it.",
    ],
    params: [
        new Param("arr", Type.Array()),
    ],
    returns: {
        type: Type.Any(),
        desc: "Value popped"
    },
    example: [
        "let arr = [1, 2, 3];",
        "print(pop(arr)); # 3",
        "print(arr); # [1, 2]"
    ]
};
function pop(arr) {
    return arr.Atemp.pop();
}
add("pop", pop, true);

intrinsic_docs["dequeue"] = {
    desc: [
        "Remove the value at the beginning of",
        "an array and return it.",
    ],
    params: [
        new Param("arr", Type.Array()),
    ],
    returns: {
        type: Type.Any(),
        desc: "Value dequeued"
    },
    example: [
        "let arr = [1, 2, 3];",
        "print(dequeue(arr)); # 1",
        "print(arr); # [2, 3]"
    ]
};
function dequeue(arr) {
    return arr.Atemp.shift();
}
add("dequeue", dequeue, true);

intrinsic_docs["len"] = {
    desc: [
        "Returns the length of the iterable.",
    ],
    params: [
        new Param("list", Type.Array()),
    ],
    returns: {
        type: Type.Number(),
        desc: "Amount of items in list"
    },
    example: [
        'len("abc") == len([1, 2, 3]); # true'
    ]
};
function len(list) {
    let val = new Value();
    if (list.isString()) {
        val.setNumber(list.Stemp.length)
        return val;
    }
    if (list.isArray()) {
        val.setNumber(list.Atemp.length)
        return val;
    }
}
add("len", len, true);

intrinsic_docs["concat"] = {
    desc: [
        "Creates a new string/array of",
        "the concatenation of two.",
    ],
    params: [
        new Param("s1", Type.String()),
        new Param("s2", Type.String()),
    ],
    returns: {
        type: Type.String(),
        desc: "Concatenation of s1 and s2"
    },
    example: [
        'streq(concat("a", "b"), "ab"); # true'
    ]
};
function concat(s1, s2) {
    let val = new Value();
    if (s1.isString()) {
        val.setString(s1.Stemp + s2.Stemp);
    }
    if (s1.isArray()) {
        val.setArray(s1.Atemp.concat(s2.Atemp));
    }
    return val;
}
add("concat", concat, true);

intrinsic_docs["zip"] = {
    desc: [
        "Zips two arrays together into a new one."
    ],
    params: [
        new Param("a1", Type.Array()),
        new Param("a2", Type.Array()),
    ],
    returns: {
        type: Type.Array(Type.Array()),
        desc: "index 0 contains [a1[0], a2[0]], and so on"
    },
    example: [
        'final a = zip([1, 2], ["a", "b"]);',
        'print(a[0]); # [1, "a"]',
        'print(a[1]); # [2, "b"]'
    ]
}

intrinsic_docs["deepcopy"] = {
    desc: [
        "Creates a new array of a deep copy",
        "(no references) of an another array",
        "recursively.",
    ],
    params: [
        new Param("src", Type.Array()),
    ],
    returns: {
        type: Type.Array(),
        desc: "deep copy of src"
    },
};
function deepcopy(src) {
    let res = []
    for (const val of src.Atemp) {
        if (val.isArray())
            res.push(deepcopy(val));
        else
            res.push(Value.from(val));
    }
    return Value.fromArray(res);
}
add("deepcopy", deepcopy, true);

intrinsic_docs["shallowcopy"] = {
    desc: [
        "Creates a new array of a shallow copy",
        "(no top-level references) of an another array.",
    ],
    params: [
        new Param("src", Type.Array()),
    ],
    returns: {
        type: Type.Array(),
        desc: "shallow copy of src"
    },
};
function shallowcopy(src) {
    let res = [];
    for (const val of src.Atemp)
        res.push(Value.from(val));
    return Value.fromArray(res);
}
add("shallowcopy", shallowcopy, true);

intrinsic_docs["filter"] = {
    desc: [
        "Creates an array based on another filtered",
        "by a predicate."
    ],
    params: [
        new Param("arr", Type.Array()),
        new Param("f", Type.Function(
            [Type.Any()],
            Type.Number()
        )),
    ],
    returns: {
        type: Type.Array(),
        desc: "arr with all elements where f(arr[i]) is true"
    },
    example: [
        "fn positive(x) { return x >= 0; }",
        "let arr = filter([-1, 0, 1], positive);",
        "print(arr); # [0, 1]"
    ]
}
function filter(arr, f) {
    let value = new Value();
    value.setArray([]);
    for (const val of arr.Atemp) {
        let retval = call(f, [val]);
        if (retval.Ntemp)
            value.addArrayValue(val);
    }
    return value;
}
add("filter", filter, true);

intrinsic_docs["map"] = {
    desc: [
        "Creates an array based on another with each",
        "element mapped by a function."
    ],
    params: [
        new Param("arr", Type.Array()),
        new Param("f", Type.Function(
            [Type.Any()],
            Type.Any()
        )),
    ],
    returns: {
        type: Type.Array(),
        desc: "arr where all elements are f(arr[i])"
    },
    example: [
        "fn square(x) { return pow(x, 2); }",
        "let arr = map([1, 2, 3], square);",
        "print(arr); # [1, 4, 9]"
    ]
}
function map(arr, f) {
    let value = new Value();
    value.setArray([]);
    for (const val of arr.Atemp) {
        value.addArrayValue(call(f, [val]));
    }
    return value;
}
add("map", map, true);

intrinsic_docs["reverse"] = {
    desc: [
        "Creates an array based on another with each",
        "element in reverse order."
    ],
    params: [
        new Param("arr", Type.Array()),
    ],
    returns: {
        type: Type.Array(),
        desc: "reversed array"
    },
    example: [
        "let arr = reverse([1, 2, 3]);",
        "print(arr); # [3, 2, 1]"
    ]
};
function reverse(arr) {
    let value = new Value();
    value.setArray([]);
    for (const val of [...arr.Atemp].reverse()) {
        value.addArrayValue(val);
    }
    return value;
};
add("reverse", reverse, true);

intrinsic_docs["foreach"] = {
    desc: [
        "Calls a function on each element of an array",
    ],
    params: [
        new Param("arr", Type.Array()),
        new Param("f", Type.Function(
            [Type.Any()],
            Type.Void()
        )),
    ],
    returns: {},
    example: [
        'let arr = ["apple", "banana"];',
        "foreach(arr, print);",
        "# apple",
        "# banana"
    ]
};
function foreach(arr, f) {
    for (const val of arr.Atemp)
        call(f, [val]);
}
add("foreach", foreach, false);

intrinsic_docs["reduce"] = {
    desc: [
        "Reduce an array to a single value with an",
        "accumulator function."
    ],
    params: [
        new Param("arr", Type.Array()),
        new Param("f", Type.Function(
            [Type.Any(), Type.Any()],
            Type.Any()
        )),
    ],
    returns: {
        type: Type.Any(),
        desc: "Value accumulated by accumulator."
    },
    example: [
        "fn add(p, c) { return p + c; }",
        "let arr = [1, 2, 3];",
        "print(reduce(arr, add)); # 6"
    ]
}
function reduce(arr, f) {
    if (arr.Atemp.length === 0) {
        // ERROR
    }
    let accum = Value.from(arr.Atemp[0]);
    for (let i = 1; i < arr.Atemp.length; i++) {
        let cur = arr.Atemp[i];
        accum.setFromValue(call(f, [accum, cur]))
    }
    return accum;
}
add("reduce", reduce, true);

intrinsic_docs["range"] = {
    desc: [
        "Creates a range from a start and stop"
    ],
    params: [
        new Param("start", Type.Number()),
        new Param("stop", Type.Number()),
    ],
    returns: {
        type: Type.Array(Type.Number()),
        desc: "Sequence of the range"
    },
    //example: [ ]
};
function range(start, stop) {
    let value = new Value();
    value.setArray([]);
    for (let i = start.Ntemp; i < stop.Ntemp; i++) {
        value.addArrayValue(Value.fromNumber(i));
    }
    return value;
}
add("range", range, true);

//===========================
// Object library
//===========================
intrinsic_docs["keys"] = {
    desc: [
        "Return an array of keys from an object.",
    ],
    params: [
        new Param("obj", Type.Object()),
    ],
    returns: {
        type: Type.Array(Type.String()),
        desc: "Array with all keys in the obj."
    },
    example: [
        'keys({a: 1, b: 2}); # ["a", "b"]'
    ]
};
function keys(obj) {
    let res = Value.fromArray([]);
    Object.keys(obj.Otemp).forEach(key => {
        res.addArrayValue(Value.fromString(key))
    });
    return res;
}
add("keys", keys, true);

intrinsic_docs["values"] = {
    desc: [
        "Return an array of values from an object.",
    ],
    params: [
        new Param("obj", Type.Object()),
    ],
    returns: {
        type: Type.Array(),
        desc: "Array with all values in the obj."
    },
    example: [
        'values({a: 1, b: 2}); # [1, 2]'
    ]
};
function values(obj) {
    let res = Value.fromArray([]);
    Object.values(obj.Otemp).forEach(val => {
        res.addArrayValue(Value.from(val))
    });
    return res;
}
add("values", values, true);

intrinsic_docs["entries"] = {
    desc: [
        "Return an array of key/value pairs from an object.",
    ],
    params: [
        new Param("obj", Type.Object()),
    ],
    returns: {
        type: Type.Array(Type.Object(
            ["key", "value"],
            [Type.String(), Type.Any()]
        )),
        desc: "Array of objects of key/value pairs.",
    },
    example: [
        "let obj = entries({A: 5, B: 6});",
        'print(obj[0]); # { key: "A", value: 5 }'
    ]
};
function entries(obj) {
    let res = Value.fromArray([]);
    for (const [key, val] of Object.entries(obj.Otemp)) {
        let value = new Value();
        value.setObject({});
        value.setObjectValue("key", Value.fromString(key));
        value.setObjectValue("value", Value.from(val));
        res.addArrayValue(value);
    }
    return res;
}
add("entries", entries, true);


//===========================
// IO Library
//===========================
intrinsic_docs["print"] = {
    desc: [
        "Prints arguments' str reps to stdout.",
    ],
    params: [
        new Param("args", Type.Any(), true),
    ],
    returns: {},
};
function print(...args) {
    console.log(args.printFmt());
}
add("print", print, false);

intrinsic_docs["assert"] = {
    desc: [
        "Assert a condition, print message if condition is 0.",
    ],
    params: [
        new Param("expr", Type.Number()),
        new Param("msg", Type.String()),
    ],
    returns: {},
};
function assert(expr, msg) {
    if (!expr.Ntemp)
        console.error(msg.Stemp);
}
add("assert", assert, false);

// TODO: Document
// TIMER FNS
// function timerstart() {
//     return Value.fromNumber(Date.now());
// }
// add("timerstart", timerstart, true);
// function timerend(timer) {
//     print(Value.fromString("" + (Date.now() - timer.Ntemp) + "ms"))
// }
// add("timerend", timerend, false);

//===========================
// String library
//===========================

intrinsic_docs["str"] = {
    desc: [
        "Return the string representation of a data type.",
    ],
    params: [
        new Param("val", Type.Any()),
    ],
    returns: {
        type: Type.String(),
        desc: "String representation of val"
    },
    example: [
        'str(5); # "5"',
        'str(fn(){}) # "fn ( ) { }"',
        'str([1, 2, 3]); # "[1, 2, 3]"'
    ]
};
function str(val) {
    return Value.fromString(val.printFmt());
}
add("str", str, true);

intrinsic_docs["repeat"] = {
    desc: [
        "Creates a string repeated n times.",
    ],
    params: [
        new Param("str", Type.String()),
        new Param("n", Type.Number()),
    ],
    returns: {
        type: Type.String(),
        desc: "str concated with itself n times"
    },
    example: [
        'repeat("AB", 3); # "ABABAB"'
    ]
};
function repeat(str, n) {
    return Value.fromString(str.Stemp.repeat(n.Ntemp));
}
add("repeat", repeat, true);

intrinsic_docs["substring"] = {
    desc: [
        "Creates a substring of a string with given indices.",
    ],
    params: [
        new Param("str", Type.String()),
        new Param("start", Type.Number()),
        new Param("end", Type.Number()),
    ],
    returns: {
        type: Type.String(),
        desc: "substring of str of [start, end)"
    },
    example: [
        'substring("apple", 1, 4); # "ppl"',
    ]
};
function substring(str, start, end) {
    return Value.fromString(
        str.Stemp.substring(start.Ntemp, end.Ntemp)
    );
}
add("substring", substring, true);

intrinsic_docs["strcmp"] = {
    desc: [
        "Compares strings using C style string comparison.",
    ],
    params: [
        new Param("s1", Type.String()),
        new Param("s2", Type.String()),
    ],
    returns: {
        type: Type.Number(),
        desc: "C style string comparison"
    },
    example: [
        'let cmp = strcmp("aa", "ab");',
        'print(cmp); # -1, "aa" is less than "ab"'
    ]
};
function strcmp(s1, s2) {
    let n = 0;
    if (s1.Stemp === null || s2.Stemp === null) {
        // throw error
    }
    if (s1.Stemp < s2.Stemp) n = -1;
    else if (s1.Stemp > s2.Stemp) n = 1;
    else if (s1.Stemp === s2.Stemp) n = 0;
    return Value.fromNumber(n);
}
add("strcmp", strcmp, true);

intrinsic_docs["streq"] = {
    desc: [
        "Test if strings are equal.",
    ],
    params: [
        new Param("s1", Type.String()),
        new Param("s2", Type.String()),
    ],
    returns: {
        type: Type.Number(),
        desc: "1 if strings are equal, 0 otherwise"
    },
    example: [
        'streq("Hello", "Hello"); # true',
        'streq("Hello", "Goodbye"); # false'
    ]
};
function streq(s1, s2) {
    return Value.fromNumber(+(s1.Stemp === s2.Stemp));
}
add("streq", streq, true);

intrinsic_docs["tolower"] = {
    desc: [
        "Create a string with all lowercase letters.",
    ],
    params: [
        new Param("str", Type.String()),
    ],
    returns: {
        type: Type.String(),
        desc: "str with all uppercase letter as lowercase"
    },
    example: [
        'tolower("CHRIS"); # "chris"'
    ]
};
function tolower(str) {
    return Value.fromString(str.Stemp.toLowerCase());
}
add("tolower", tolower, true);

intrinsic_docs["toupper"] = {
    desc: [
        "Create a string with all uppercase letters.",
    ],
    params: [
        new Param("str", Type.String()),
    ],
    returns: {
        type: Type.String(),
        desc: "str with all lowercase letter as uppercase"
    },
    example: [
        'toupper("apple"); # "APPLE"'
    ]
};
function toupper(str) {
    return Value.fromString(str.Stemp.toUpperCase());
}
add("toupper", toupper, true);

//===========================
// Math library
//===========================

intrinsic_docs["sin"] = {
    desc: [
        "Returns the sine of n in radians",
    ],
    params: [
        new Param("n", Type.Number()),
    ],
    returns: {
        type: Type.Number(),
        desc: "sine of n in radians"
    },
};
function sin(n) {
    return Value.fromNumber(Math.sin(n.Ntemp));
}
add("sin", sin, true);

intrinsic_docs["cos"] = {
    desc: [
        "Returns the cosine of n in radians",
    ],
    params: [
        new Param("n", Type.Number()),
    ],
    returns: {
        type: Type.Number(),
        desc: "cosine of n in radians"
    },
};
function cos(n) {
    return Value.fromNumber(Math.cos(n.Ntemp));
}
add("cos", cos, true);

intrinsic_docs["tan"] = {
    desc: [
        "Returns the tangent of n in radians",
    ],
    params: [
        new Param("n", Type.Number()),
    ],
    returns: {
        type: Type.Number(),
        desc: "tangent of n in radians"
    },
};
function tan(n) {
    return Value.fromNumber(Math.tan(n.Ntemp));
}
add("tan", tan, true);

intrinsic_docs["asin"] = {
    desc: [
        "Returns the arcsine of n",
    ],
    params: [
        new Param("n", Type.Number()),
    ],
    returns: {
        type: Type.Number(),
        desc: "arcsine of n"
    },
};
function asin(n) {
    return Value.fromNumber(Math.asin(n.Ntemp));
}
add("asin", asin, true);

intrinsic_docs["acos"] = {
    desc: [
        "Returns the arccosine of n",
    ],
    params: [
        new Param("n", Type.Number()),
    ],
    returns: {
        type: Type.Number(),
        desc: "arccosine of n"
    },
};
function acos(n) {
    return Value.fromNumber(Math.acos(n.Ntemp));
}
add("acos", acos, true);

intrinsic_docs["atan"] = {
    desc: [
        "Returns the arctangent of n",
    ],
    params: [
        new Param("n", Type.Number()),
    ],
    returns: {
        type: Type.Number(),
        desc: "arctangent of n"
    },
};
function atan(n) {
    return Value.fromNumber(Math.atan(n.Ntemp));
}
add("atan", atan, true);

intrinsic_docs["ln"] = {
    desc: [
        "Returns the natural log of n",
    ],
    params: [
        new Param("n", Type.Number()),
    ],
    returns: {
        type: Type.Number(),
        desc: "Natural log of n"
    },
};
function ln(n) {
    return Value.fromNumber(Math.log(n.Ntemp));
}
add("ln", ln, true);

intrinsic_docs["rand"] = {
    desc: [
        "Returns a random float in range [0, 1)",
    ],
    params: [],
    returns: {
        type: Type.Number(),
        desc: "Random float in range [0, 1)"
    }
};
function rand() {
    return Value.fromNumber(Math.random());
}
add("rand", rand, true);

intrinsic_docs["randint"] = {
    desc: [
        "Returns a random integer between a specified range",
    ],
    params: [
        new Param("lower", Type.Number()),
        new Param("upper", Type.Number()),
    ],
    returns: {
        type: Type.Number(),
        desc: "Random integer in range [lower, upper)"
    }
};
function randint(lower, upper) {
    let l = lower.Ntemp, u = upper.Ntemp;
    return Value.fromNumber(
        Math.floor(l + Math.random() * (u - l))
    );
}
add("randint", randint, true);

intrinsic_docs["floor"] = {
    desc: [
        "Returns the floor of a float",
    ],
    params: [
        new Param("n", Type.Number()),
    ],
    returns: {
        type: Type.Number(),
        desc: "n rounded down to nearest integer"
    },
};
function floor(n) {
    return Value.fromNumber(Math.floor(n.Ntemp));
}
add("floor", floor, true);

intrinsic_docs["ceil"] = {
    desc: [
        "Returns the ceil of a float",
    ],
    params: [
        new Param("n", Type.Number()),
    ],
    returns: {
        type: Type.Number(),
        desc: "n rounded down to nearest integer"
    },
};
function ceil(n) {
    return Value.fromNumber(Math.ceil(n.Ntemp));
}
add("ceil", ceil, true);

intrinsic_docs["round"] = {
    desc: [
        "Returns n rounded to nearest integer",
    ],
    params: [
        new Param("n", Type.Number()),
    ],
    returns: {
        type: Type.Number(),
        desc: "n rounded to nearest integer"
    },
};
function round(n) {
    return Value.fromNumber(Math.round(n.Ntemp));
}
add("round", round, true);

intrinsic_docs["sqrt"] = {
    desc: [
        "Returns the square root of a number",
    ],
    params: [
        new Param("n", Type.Number()),
    ],
    returns: {
        type: Type.Number(),
        desc: "square root of n"
    },
};
function sqrt(n) {
    return Value.fromNumber(Math.sqrt(n.Ntemp));
}
add("sqrt", sqrt, true);

intrinsic_docs["abs"] = {
    desc: [
        "Returns the absolute value of a number",
    ],
    params: [
        new Param("n", Type.Number()),
    ],
    returns: {
        type: Type.Number(),
        desc: "absolute value of n"
    },
};
function abs(n) {
    return Value.fromNumber(Math.abs(n.Ntemp));
}
add("abs", abs, true);

intrinsic_docs["sign"] = {
    desc: [
        "Returns a number denoting the sign of a number",
    ],
    params: [
        new Param("n", Type.Number()),
    ],
    returns: {
        type: Type.Number(),
        desc: "-1 if n < 0, 0 if n is 0, otherwise 1"
    },
};
function sign(n) {
    return Value.fromNumber(Math.sign(n.Ntemp));
}
add("sign", sign, true);

intrinsic_docs["exp"] = {
    desc: [
        "Returns e (euler's constant) raised to the power of a number",
    ],
    params: [
        new Param("n", Type.Number()),
    ],
    returns: {
        type: Type.Number(),
        desc: "e (euler's constant) raised to the power of n"
    },
};
function exp(n) {
    return Value.fromNumber(Math.exp(n.Ntemp));
}
add("exp", exp, true);

intrinsic_docs["pow"] = {
    desc: [
        "Returns a number raised to the power of another number",
    ],
    params: [
        new Param("n", Type.Number()),
        new Param("x", Type.Number()),
    ],
    returns: {
        type: Type.Number(),
        desc: "n raised to the power of n"
    },
};
function pow(n, x) {
    return Value.fromNumber(Math.pow(n.Ntemp, x.Ntemp));
}
add("pow", pow, true);

