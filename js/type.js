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
export class Type {
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
    static Number() { return new Type(ValType.Number); }
    static String() { return new Type(ValType.String); }
    static Any()    { return new Type(ValType.Any); }
    static Void()   { return new Type(ValType.Void); }
    setNumber() { this.vt = ValType.Number; }
    setString() { this.vt = ValType.String; }
    setAny()    { this.vt = ValType.Any; }
    setVoid()   { this.vt = ValType.Void; }

    /**
     * @param {Type} arraytype
     * @param {number} length
     */
    static Array(arraytype, length=-1)  {
        let type = new Type(ValType.Array);
        type.arraytype = arraytype ?? Type.Any();
        type.length = length;
        return type;
    }
    /**
     * @param {Type} arraytype
     */
    setArray(arraytype, length=-1) {
        this.vt = ValType.Array;
        this.arraytype = arraytype;
        this.length = length;
    }
    /**
     * @param {string[]} keys
     * @param {Type[]} types
     */
    static Object(keys, types)  {
        let type = new Type(ValType.Object);
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
     * @param {Type[]} types
     */
    setObject(keys, types) {
        this.vt = ValType.Object;
        this.obj = {};
        for (let [key, type] of zip(keys, types))
            this.obj[key] = type;
    }
    /**
     * @param {Type[]} paramtypes
     * @param {Type} returntype
     */
    static Function(paramtypes, returntype)  {
        let type = new Type(ValType.Function);
        type.params = paramtypes ?? [];
        type.return = returntype ?? Type.Void();
        return type;
    }
    /**
     * @param {Type[]} paramtypes
     * @param {Type} returntype
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
                if (!this.return.equals(Type.Void()))
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


