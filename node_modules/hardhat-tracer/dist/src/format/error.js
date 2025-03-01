"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatError = void 0;
const colors_1 = require("../utils/colors");
const object_1 = require("./object");
const param_1 = require("./param");
const result_1 = require("./result");
async function formatError(revertData, dependencies) {
    try {
        const { fragment, revertResult, } = await dependencies.tracerEnv.decoder.decodeError(revertData);
        if (fragment.name === "Panic") {
            const panicCode = revertResult.code.toNumber();
            let situation = "";
            switch (panicCode) {
                case 0x01:
                    situation = "assert false";
                    break;
                case 0x11:
                    situation = "arithmetic overflow or underflow";
                    break;
                case 0x12:
                    situation = "divide or modulo by zero";
                    break;
                case 0x21:
                    situation = "value invalid for enum";
                    break;
                case 0x22:
                    situation = "access incorrectly encoded storage byte array";
                    break;
                case 0x31:
                    situation = "pop on empty array";
                    break;
                case 0x32:
                    situation = "array index out of bounds";
                    break;
                case 0x41:
                    situation = "allocating too much memory";
                    break;
                case 0x51:
                    situation = "zero internal function";
                    break;
            }
            return `${(0, colors_1.colorError)(fragment.name)}(${(0, object_1.formatObject)({
                code: panicCode,
                situation,
            })})`;
        }
        const formatted = (0, result_1.formatResult)(revertResult, fragment.inputs, { decimals: -1, shorten: false }, dependencies);
        return `${(0, colors_1.colorError)(fragment.name)}(${formatted})`;
    }
    catch { }
    // if error could not be decoded, then just show the data
    return `${(0, colors_1.colorError)("UnknownError")}(${(0, param_1.formatParam)(revertData, dependencies)})`;
}
exports.formatError = formatError;
//# sourceMappingURL=error.js.map