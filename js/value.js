import { TokenStream } from "./lexer.js";
import { zip } from "./utils.js";
import { Type } from "./type.js";

export class Param {
    /**
     * @param {String} name
     * @param {Type} type
     */
    constructor(name, type, variadic=false) {
        this.name = name;
        this.type = type;
        this.variadic = variadic;
    }
}

/**
 * @property {Type} type
 * @property {Boolean} constant
 * @property {Number} Ntemp
 * @property {String} Stemp
 * @property {Value[]} Atemp
 * @property {Object} Otemp
 * @property {Object} Ftemp
 */
export class Value {
    constructor() {
        this.type = Type.None();
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
        res.type = other.type;
        res.Ntemp = other.Ntemp;
        res.Stemp = other.Stemp;
        res.Atemp = other.Atemp;
        res.Otemp = other.Otemp;
        res.Ftemp = other.Ftemp;
        return res;
    }
    static fromNumber(n) {
        let res = new Value();
        res.type = Type.Number();
        res.Ntemp = n;
        return res;
    }
    static fromString(s) {
        let res = new Value();
        res.type = Type.String();
        res.Stemp = s;
        return res;
    }
    static fromFunction(tokens, params, rettype, ident) {
        let res = new Value();
        res.type = Type.Function(params.map(p => p.type), rettype);
        console.log(res.type.printFmt()); // TODO: Remove me
        res.Ftemp = {};
        res.Ftemp.tokens = tokens;
        res.Ftemp.params = params;
        res.Ftemp.intrinsic = false;
        res.Ftemp.name = ident;
        return res;
    }
    static fromArray(a) {
        let res = new Value();
        res.type = Type.Array();
        res.Atemp = a;
        return res;
    }
    static fromObject(o) {
        let res = new Value();
        res.type = Type.Object();
        res.Otemp = o;
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
    okParamCount(count) {
        const has_variadic = this.Ftemp.params.filter(p => p.variadic).length > 0;
        if (has_variadic) {
            return count >= this.paramCount() - 1;
        } else {
            return count == this.paramCount();
        }
    }

    setNumber(n) {
        this.type = Type.Number();
        this.Ntemp = n;
    }
    setString(s) {
        this.type = Type.String();
        this.Stemp = s;
    }
    setArray(a) {
        this.type = Type.Array();
        this.Atemp = a;
    }
    setObject(o) {
        this.type = Type.Object();
        this.Otemp = o;
    }
    setFunction(tokens, params, name) {
        this.type = Type.Function(params.map(p => p.type));
        this.Ftemp = {};
        this.Ftemp.tokens = tokens;
        this.Ftemp.params = params;
        this.Ftemp.name = name;
    }
    setFunctionIntrinsic(params, fn, returns) {
        this.type = Type.Function();
        this.Ftemp = {};
        this.Ftemp.tokens = null;
        this.Ftemp.params = params;
        this.Ftemp.intrinsic = true;
        this.Ftemp.fn = fn;
        this.Ftemp.returns = returns;
    }

    setFromValue(other) {
        this.type = other.type;
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
        return this.type.equals(Type.String()) ||
               this.type.equals(Type.Array())  ||
               this.type.equals(Type.Object());
    }
    iterable() {
        return this.type.equals(Type.String()) ||
               this.type.equals(Type.Array())  ||
               this.type.equals(Type.Object());
    }
    iterator() {
        if (this.isArray())
            return this.Atemp;
        if (this.isString())
            return [...this.Stemp].map(c => Value.fromString(c));
        if (this.isObject())
            return Object.keys(this.Otemp).map(k => Value.fromString(k));
    }
    isIntrinsic() {
        return this.isFunction() && this.Ftemp.intrinsic;
    }

    isNone() {
        return this.type.equals(Type.None());
    }
    isNumber() {
        return this.type.equals(Type.Number());
    }
    isString() {
        return this.type.equals(Type.String());
    }
    isArray() {
        return this.type.equals(Type.Array());
    }
    isObject() {
        return this.type.equals(Type.Object());
    }
    isFunction() {
        return this.type.equals(Type.Function());
    }
    typeStr() {
        return this.type.printFmt();
    }

    printFmt(quoted = false) {
        // TODO: Ponder about the existence of null values...
        if (this.isNone()) {
            return "none";
        }
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
            // res += this.Atemp.map(v => {
            //     return v.printFmt(v.isString());
            // }).join(", ");
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
            let paramlist = params.map(p => p.name).join(", ");
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
