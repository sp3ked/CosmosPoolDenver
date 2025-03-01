"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeParent = exports.printJson = void 0;
async function printJson(txTrace) {
    if (!txTrace.top) {
        throw new Error("[hardhat-tracer]: this.top is undefined in print");
    }
    removeParent(txTrace.top);
    console.log(JSON.stringify(txTrace.top, null, 2));
}
exports.printJson = printJson;
function removeParent(item) {
    item.parent = undefined;
    if (!!item.children) {
        for (const childItem of item.children) {
            removeParent(childItem);
        }
    }
}
exports.removeParent = removeParent;
//# sourceMappingURL=json.js.map