"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCallItem = exports.callOpcodes = exports.isItem = void 0;
function isItem(item) {
    return item && typeof item.opcode === "string";
}
exports.isItem = isItem;
exports.callOpcodes = [
    "CALL",
    "STATICCALL",
    "DELEGATECALL",
    "CALLCODE",
    "CREATE",
    "CREATE2",
];
function isCallItem(item) {
    return exports.callOpcodes.includes(item.opcode);
}
exports.isCallItem = isCallItem;
//# sourceMappingURL=item.js.map