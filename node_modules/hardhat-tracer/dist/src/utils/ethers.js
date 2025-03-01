"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeNumericFromEthersResult = void 0;
function removeNumericFromEthersResult(obj) {
    const _obj = { ...obj };
    const keys = Object.keys(_obj);
    let removed = 0;
    for (const key of keys) {
        if (!isNaN(Number(key))) {
            delete _obj[key];
            removed++;
        }
    }
    // if all keys are numeric, return null
    if (keys.length === removed) {
        return null;
    }
    // return Result object without numeric keys
    return _obj;
}
exports.removeNumericFromEthersResult = removeNumericFromEthersResult;
//# sourceMappingURL=ethers.js.map