import { TokenStream } from "./lexer.js";
import { zip } from "./utils.js";

export class ValType {
    static None = 0;
    static Number = 1;
    static String = 2;
    static Array = 3;
    static Object = 4;
    static Function = 5;
    static Any = 6;
    static Void = 7;
}

// Base -> Number
//       | String
//       | Any
//       | ArrayType
//       | ObjectType
//       | FunctionType
//
// ArrayType    -> Array[Base]
// ObjectType   -> Object{ident: Base{, ident: Base}*}
// FunctionType -> Function{(Base{, Base}*)}{: Base}
export class CompoundType {
    /**
     * @param {ValType} vt
     */
    constructor(vt) {
        this.vt = vt; // Whatever type this is i.e Number, String

        // Array
        this.arraytype = null;
        this.length = null; // TODO: Handle this in parser

        // Object
        this.obj = null;

        // Function
        this.params = null;
        this.return = null;
    }
    setFrom(other) {
        this.vt = other.vt;
        this.arraytype = other.arraytype;
        this.length = other.length;
        this.obj = other.obj;
        this.params = other.params;
        this.return = other.return;
    }
    static Number() { return new CompoundType(ValType.Number); }
    static String() { return new CompoundType(ValType.String); }
    static Any()    { return new CompoundType(ValType.Any); }
    static Void()   { return new CompoundType(ValType.Void); }
    setNumber() { this.vt = ValType.Number; }
    setString() { this.vt = ValType.String; }
    setAny()    { this.vt = ValType.Any; }
    setVoid()   { this.vt = ValType.Void; }

    /**
     * @param {CompoundType} arraytype
     * @param {number} length
     */
    static Array(arraytype, length=-1)  {
        let type = new CompoundType(ValType.Array);
        type.arraytype = arraytype ?? CompoundType.Any();
        type.length = length;
        return type;
    }
    /**
     * @param {CompoundType} arraytype
     */
    setArray(arraytype, length=-1) {
        this.vt = ValType.Array;
        this.arraytype = arraytype;
        this.length = length;
    }
    /**
     * @param {string[]} keys
     * @param {CompoundType[]} types
     */
    static Object(keys, types)  {
        let type = new CompoundType(ValType.Object);
        if (!keys && !types) {
            type.obj = {};
            return type;
        }
        let obj = {};
        for (let [key, type] of zip(keys, types))
            obj[key] = type;
        type.obj = obj;
        return type;
    }
    /**
     * @param {string[]} keys
     * @param {CompoundType[]} types
     */
    setObject(keys, types) {
        this.vt = ValType.Object;
        this.obj = {};
        for (let [key, type] of zip(keys, types))
            this.obj[key] = type;
    }
    /**
     * @param {CompoundType[]} paramtypes
     * @param {CompoundType} returntype
     */
    static Function(paramtypes, returntype)  {
        let type = new CompoundType(ValType.Function);
        type.params = paramtypes ?? [];
        type.return = returntype ?? CompoundType.Void();
        return type;
    }
    /**
     * @param {CompoundType[]} paramtypes
     * @param {CompoundType} returntype
     */
    setFunction(paramtypes, returntype) {
        this.vt = ValType.Function;
        this.params = paramtypes;
        this.return = returntype;
    }
    printFmt() {
        let res = "";
        switch (this.vt) {
            case ValType.Any:
                res += "Any";
                break;
            case ValType.Number:
                res += "Number";
                break;
            case ValType.String:
                res += "String";
                break;
            case ValType.Void:
                res += "Void";
                break;
            case ValType.Array:
                res += "Array";
                res += "[";
                res += this.arraytype.printFmt();
                res += "]";
                break;
            case ValType.Object:
                res += "Object";
                if (Object.keys(this.obj).length > 0) {
                    res += "{";
                    res += Object.entries(this.obj).map(([k, v]) => k + ": " + v.printFmt()).join(", ");
                    res += "}";
                }
                break;
            case ValType.Function:
                res += "Function";
                if (this.params.length !== 0) {
                    res += "(";
                    res += this.params.map(p => p.printFmt()).join(", ");
                    res += ")";
                }
                if (!this.return.equals(CompoundType.Void()))
                    res += ": " + this.return.printFmt();
                break;
        }
        return res;
    }
    equals(other) {
        if (this.vt !== other.vt)
            return false;

        // Check equality of more compounded types
        switch (this.vt) {
            case ValType.Array:
                return this.arraytype.equals(other.arraytype) && this.length === other.length;
            case ValType.Object:
                const keys1 = Object.keys(this.obj);
                const keys2 = Object.keys(other.obj);
                if (keys1.length !== keys2.length)
                    return false;
                for (const [key1, key2] of zip(keys1, keys2)) {
                    if (key1 !== key2)
                        return false;
                    if (!this.obj[key1].equals(other.obj[key2]))
                        return false;
                }
                return true;
            case ValType.Function:
                if (this.params.length !== other.params.length)
                    return false;
                for (const [p1, p2] of zip(this.params, other.params))
                    if (!p1.equals(p2))
                        return false;
                return this.return.equals(other.return);
            default:
                return true;
        }
    }
}

export class Param {
    /**
     * @param {String} name
     * @param {CompoundType} type
     */
    constructor(name, type) {
        this.name = name;
        this.type = type;
    }
}

export class Value {
    constructor() {
        this.vt = ValType.None;
        this.constant = false;

        this.Ntemp = null;
        this.Stemp = null;
        this.Atemp = null;
        this.Otemp = null;
        this.Ftemp = null;
    }

    // Factories
    static from(other) {
        let res = new Value();
        res.vt = other.vt;
        res.Ntemp = other.Ntemp;
        res.Stemp = other.Stemp;
        res.Atemp = other.Atemp;
        res.Otemp = other.Otemp;
        res.Ftemp = other.Ftemp;
        return res;
    }
    static fromNumber(n) {
        let res = new Value();
        res.vt = ValType.Number;
        res.Ntemp = n;
        res.Stemp = null;
        res.Atemp = null;
        res.Otemp = null;
        res.Ftemp = null;
        return res;
    }
    static fromString(s) {
        let res = new Value();
        res.vt = ValType.String;
        res.Ntemp = null;
        res.Stemp = s;
        res.Atemp = null;
        res.Otemp = null;
        res.Ftemp = null;
        return res;
    }
    static fromFunction(tokens, params, ident) {
        let res = new Value();
        res.vt = ValType.Function;
        res.Ntemp = null;
        res.Stemp = null;
        res.Atemp = null;
        res.Otemp = null;
        res.Ftemp = {};
        res.Ftemp.tokens = tokens;
        res.Ftemp.params = params;
        res.Ftemp.intrinsic = false;
        res.Ftemp.name = ident;
        return res;
    }
    static fromArray(a) {
        let res = new Value();
        res.vt = ValType.Array;
        res.Ntemp = null;
        res.Stemp = null;
        res.Atemp = a;
        res.Otemp = null;
        res.Ftemp = null;
        return res;
    }
    static fromObject(o) {
        let res = new Value();
        res.vt = ValType.Object;
        res.Ntemp = null;
        res.Stemp = null;
        res.Atemp = null;
        res.Otemp = o;
        res.Ftemp = null;
        return res;
    }

    toTokenStream() {
        // let s = this.Ftemp.tokens.map(t => t.lexeme).join(' ');
        let s = this.Ftemp.tokens.join(' ');
        return new TokenStream(s);
    }
    paramCount() {
        return this.Ftemp.params.length;
    }
    arity() {
        return this.paramCount();
    }

    setNumber(n) {
        this.vt = ValType.Number;
        this.Ntemp = n;
    }
    setString(s) {
        this.vt = ValType.String;
        this.Stemp = s;
    }
    setArray(a) {
        this.vt = ValType.Array;
        this.Atemp = a;
    }
    setObject(o) {
        this.vt = ValType.Object;
        this.Otemp = o;
    }
    setFunction(tokens, params, name) {
        this.vt = ValType.Function;
        this.Ftemp = {};
        this.Ftemp.tokens = tokens;
        this.Ftemp.params = params;
        this.Ftemp.name = name;
    }
    setFunctionIntrinsic(params, fn, returns) {
        this.vt = ValType.Function;
        this.Ftemp = {};
        this.Ftemp.tokens = null;
        this.Ftemp.params = params;
        this.Ftemp.intrinsic = true;
        this.Ftemp.fn = fn;
        this.Ftemp.returns = returns;
    }

    setFromValue(other) {
        this.vt = other.vt;
        this.Ntemp = other.Ntemp;
        this.Stemp = other.Stemp;
        this.Atemp = other.Atemp;
        this.Otemp = other.Otemp;
        this.Ftemp = other.Ftemp;
    }
    getStringValue(index) {
        let val = new Value();
        if (this.Stemp === null)
            this.Stemp = "";
        if (index >= this.Stemp.length || index < 0)
            console.log("Accessing index out of bounds...undefined!")
        val.setString(this.Stemp[index]);
        return val;
    }
    addArrayValue(val) {
        if (this.Atemp === null)
            this.Atemp = [];
        this.Atemp.push(val);
    }
    setArrayValue(index, val) {
        if (this.Atemp === null)
            this.Atemp = [];
        this.Atemp[index] = val;
    }
    getArrayValue(index) {
        if (this.Atemp === null)
            this.Atemp = [];
        if (index >= this.Atemp.length || index < 0)
            console.log("Accessing index out of bounds...undefined!")
        return this.Atemp[index];
    }
    setObjectValue(key, val) {
        if (this.Otemp === null)
            this.Otemp = {};
        this.Otemp[key] = val;
    }
    getObjectValue(key) {
        if (this.Otemp === null)
            this.Otemp = {};
        return this.Otemp[key];
    }
    hasKey(key) {
        return Object.keys(this.Otemp).includes(key);
    }
    indexable() {
        switch (this.vt) {
            case ValType.String:
            case ValType.Array:
            case ValType.Object:
                return true;
        }
        return false;
    }
    iterable() {
        switch (this.vt) {
            case ValType.String:
            case ValType.Array:
            case ValType.Object:
                return true;
        }
        return false;
    }
    isIntrinsic() {
        return this.isFunction() && this.Ftemp.intrinsic;
    }

    isNumber() {
        return this.vt === ValType.Number;
    }
    isString() {
        return this.vt === ValType.String;
    }
    isArray() {
        return this.vt === ValType.Array;
    }
    isObject() {
        return this.vt === ValType.Object;
    }
    isFunction() {
        return this.vt === ValType.Function;
    }
    typeStr() {
        switch (this.vt) {
            case ValType.None:
                return "none";
            case ValType.Number:
                return "number";
            case ValType.String:
                return "string";
            case ValType.Bool:
                return "bool";
            case ValType.Array:
                return "array";
            case ValType.Object:
                return "object";
            case ValType.Function:
                return "function";
        }
    }

    printFmt(quoted = false) {
        if (this.isNumber()) {
            return this.Ntemp.toString();
        }
        if (this.isString()) {
            let res = this.Stemp;
            if (quoted)
                res = '"' + res + '"';
            return res;
        }
        if (this.isArray()) {
            let res = "[";
            for (let [i, val] of this.Atemp.entries()) {
                if (val.isString())
                    res += val.printFmt(true);
                else
                    res += val.printFmt();

                if (i !== this.Atemp.length - 1)
                    res += ", ";
            }
            res += "]";
            return res;
        }
        if (this.isObject()) {
            let res = "{";
            for (let key in this.Otemp) {
                res += key + ": ";
                if (this.Otemp[key].isString())
                    res += this.Otemp[key].printFmt(true);
                else
                    res += this.Otemp[key].printFmt();

                res += ", ";
            }
            if (res !== "{")
                res = res.substring(0, res.length - 2);
            res += "}";
            return res;
        }
        if (this.isFunction()) {
            let res;
            let params = this.Ftemp.params;
            let paramlist = "";
            for (const param of params)
                paramlist += param.name + ", ";
            paramlist = paramlist.substring(0, paramlist.length - 2);
            let fnbody;
            if (this.Ftemp.intrinsic) {
                fnbody = "[compiled binary]"
            } else {
                let tokens = this.Ftemp.tokens;
                fnbody = tokens.join(' ');
            }
            res = `fn (${paramlist}) { ${fnbody} }`;
            return res;
        }
    }

    // Arithmetic operations
    add(other) {
        let res = new Value();
        res.setNumber(this.Ntemp + other.Ntemp);
        return res;
    }
    sub(other) {
        let res = new Value();
        res.setNumber(this.Ntemp - other.Ntemp);
        return res;
    }
    mult(other) {
        let res = new Value();
        res.setNumber(this.Ntemp * other.Ntemp);
        return res;
    }
    div(other) {
        let res = new Value();
        res.setNumber(this.Ntemp / other.Ntemp);
        return res;
    }
    mod(other) {
        let res = new Value();
        res.setNumber(this.Ntemp % other.Ntemp);
        return res;
    }
    pow(other) {
        let res = new Value();
        res.setNumber(this.Ntemp ** other.Ntemp);
        return res;
    }
    lshift(other) {
        let res = new Value();
        res.setNumber(this.Ntemp << other.Ntemp);
        return res;
    }
    rshift(other) {
        let res = new Value();
        res.setNumber(this.Ntemp >> other.Ntemp);
        return res;
    }
    lthan(other) {
        let res = new Value();
        res.setNumber(+(this.Ntemp < other.Ntemp));
        return res;
    }
    lthaneq(other) {
        let res = new Value();
        res.setNumber(+(this.Ntemp <= other.Ntemp));
        return res;
    }
    gthan(other) {
        let res = new Value();
        res.setNumber(+(this.Ntemp > other.Ntemp));
        return res;
    }
    gthaneq(other) {
        let res = new Value();
        res.setNumber(+(this.Ntemp >= other.Ntemp));
        return res;
    }
    equal(other) {
        let res = new Value();
        res.setNumber(+(this.Ntemp == other.Ntemp));
        return res;
    }
    nequal(other) {
        let res = new Value();
        res.setNumber(+(this.Ntemp != other.Ntemp));
        return res;
    }
    bwand(other) {
        let res = new Value();
        res.setNumber(this.Ntemp & other.Ntemp);
        return res;
    }
    bwxor(other) {
        let res = new Value();
        res.setNumber(this.Ntemp ^ other.Ntemp);
        return res;
    }
    bwor(other) {
        let res = new Value();
        res.setNumber(this.Ntemp | other.Ntemp);
        return res;
    }
    and(other) {
        let res = new Value();
        res.setNumber(+(this.Ntemp && other.Ntemp));
        return res;
    }
    or(other) {
        let res = new Value();
        res.setNumber(+(this.Ntemp || other.Ntemp));
        return res;
    }
    unaryPlus() {
        let res = new Value();
        res.setNumber(this.Ntemp);
        return res;
    }
    unaryMinus() {
        let res = new Value();
        res.setNumber(-this.Ntemp);
        return res;
    }
    unaryNot() {
        let res = new Value();
        res.setNumber(+(!this.Ntemp));
        return res;
    }
    unaryBWNot() {
        let res = new Value();
        res.setNumber(~this.Ntemp);
        return res;
    }
}
