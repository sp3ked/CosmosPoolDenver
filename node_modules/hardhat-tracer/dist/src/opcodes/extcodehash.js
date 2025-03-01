"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
function parse(step) {
    const address = (0, utils_1.parseAddress)(step.stack[step.stack.length - 1].toString(16));
    const next = 1; // get stack just after this opcode
    return {
        isAwaitedItem: true,
        next,
        parse: (stepNext) => ({
            opcode: "EXTCODEHASH",
            params: {
                address,
                hash: (0, utils_1.parseBytes32)(stepNext.stack[step.stack.length - 1].toString(16)),
            },
            format() {
                return format(this);
            },
        }),
    };
}
function format(item) {
    return `${(0, utils_1.colorLabel)("[EXTCODEHASH]")} ${(0, utils_1.colorKey)(item.params.address)} → ${(0, utils_1.colorValue)(item.params.hash)}`;
}
exports.default = { parse, format };
//# sourceMappingURL=extcodehash.js.map