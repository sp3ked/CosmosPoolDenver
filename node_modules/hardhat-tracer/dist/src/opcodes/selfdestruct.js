"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
async function format(item) {
    return `${(0, utils_1.colorLabel)("[SELFDESTRUCT]")} beneficiary=${item.params.beneficiary}`;
}
exports.default = { format };
//# sourceMappingURL=selfdestruct.js.map