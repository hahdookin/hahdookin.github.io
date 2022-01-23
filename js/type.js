import { zip } from "./utils.js";

// TypeExpr -> Number
//           | String
//           | Any
//           | ArrayType
//           | ObjectType
//           | FunctionType
//
// ArrayType    -> Array[TypeExpr]
// ObjectType   -> Object{ident: TypeExpr{, ident: TypeExpr}*}
// FunctionType -> Function{(TypeExpr{, TypeExpr}*)}{: TypeExpr}
export class Type {
    static VTNone     = 0;
    static VTNumber   = 1;
    static VTString   = 2;
    static VTArray    = 3;
    static VTObject   = 4;
    static VTFunction = 5;
    static VTAny      = 6;
    static VTVoid     = 7;
    static VTUnion    = 8;
    /**
     * @param {Number} vt
     */
    constructor(vt) {
        this.vt = vt; // Whatever type this is i.e Number, String

        // Union
        this.types = null;

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
        this.types = other.types;
        this.arraytype = other.arraytype;
        this.length = other.length;
        this.obj = other.obj;
        this.params = other.params;
        this.return = other.return;
    }
    static None()   { return new Type(Type.VTNone);   }
    static Number() { return new Type(Type.VTNumber); }
    static String() { return new Type(Type.VTString); }
    static Any()    { return new Type(Type.VTAny);    }
    static Void()   { return new Type(Type.VTVoid);   }
    setNone()   { this.vt = Type.VTNone;   }
    setNumber() { this.vt = Type.VTNumber; }
    setString() { this.vt = Type.VTString; }
    setAny()    { this.vt = Type.VTAny;    }
    setVoid()   { this.vt = Type.VTVoid;   }

    /**
     * @param {Type} arraytype
     * @param {number} length
     */
    static Array(arraytype, length=-1)  {
        const type = new Type(Type.VTArray);
        type.arraytype = arraytype ?? Type.Any();
        type.length = length;
        return type;
    }
    /**
     * @param {Type} arraytype
     */
    setArray(arraytype, length=-1) {
        this.vt = Type.VTArray;
        this.arraytype = arraytype;
        this.length = length;
    }
    /**
     * @param {string[]} keys
     * @param {Type[]} types
     */
    static Object(keys, types)  {
        const type = new Type(Type.VTObject);
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
        this.vt = Type.VTObject;
        this.obj = {};
        for (let [key, type] of zip(keys, types))
            this.obj[key] = type;
    }
    /**
     * @param {Type[]} paramtypes
     * @param {Type} returntype
     */
    static Function(paramtypes, returntype)  {
        const type = new Type(Type.VTFunction);
        type.params = paramtypes ?? [];
        type.return = returntype ?? Type.Void();
        return type;
    }
    /**
     * @param {Type[]} paramtypes
     * @param {Type} returntype
     */
    setFunction(paramtypes, returntype) {
        this.vt = Type.VTFunction;
        this.params = paramtypes;
        this.return = returntype;
    }

    /**
     * @param {Type[]} types
     */
    static Union(types) {
        const type = new Type(Type.VTUnion);
        type.types = types;
        return type;
    }
    /**
     * @param {Type[]} types
     */
    setUnion(types) {
        this.vt = Type.VTUnion;
        this.types = types;
    }

    printFmt() {
        let res = "";
        switch (this.vt) {
            case Type.VTAny:
                res += "Any";
                break;
            case Type.VTNumber:
                res += "Number";
                break;
            case Type.VTString:
                res += "String";
                break;
            case Type.VTVoid:
                res += "Void";
                break;
            case Type.VTArray:
                res += "Array";
                res += "[";
                res += this.arraytype.printFmt();
                res += "]";
                break;
            case Type.VTObject:
                res += "Object";
                if (Object.keys(this.obj).length > 0) {
                    res += "{";
                    res += Object.entries(this.obj)
                            .map(([k, v]) => k + ": " + v.printFmt())
                            .join(", ");
                    res += "}";
                }
                break;
            case Type.VTFunction:
                res += "Function";
                if (this.params.length !== 0) {
                    res += "(";
                    res += this.params.map(p => p.printFmt()).join(", ");
                    res += ")";
                }
                // if (!this.return.equals(Type.Void()))
                    res += ": " + this.return.printFmt();
                break;
            case Type.VTUnion:
                res += this.types.map(t => t.printFmt()).join(" | ");
                break;
        }
        return res;
    }
    equals(other, exact=false) {
        if (this.vt !== other.vt)
            return false;
        if (!exact)
            return true;

        // Check equality of more compounded types
        switch (this.vt) {
            // Array Type Equality:
            //    Array types are equal
            //    Lengths are equal
            case Type.VTArray:
                return this.arraytype.equals(other.arraytype) && this.length === other.length;

            // Object Type Equality:
            //    Same amount of keys
            //    Object keys are equal
            //    Types at each key are equal
            case Type.VTObject:
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

            // Function Type Equality:
            //    Same amount of parameters
            //    Positional parameters types are equal
            //    Return types are equal
            case Type.VTFunction:
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

// let x = Type.Function([Type.Array(Type.Number())], Type.Array());
// console.log(x.printFmt());
