"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const contract_1 = require("../format/contract");
const utils_1 = require("../utils");
async function format(item, dependencies) {
    return ((0, utils_1.colorLabel)("[CREATE]") +
        " " +
        (await (0, contract_1.formatContract)(item.params.initCode, item.params.value, null, item.params.deployedAddress ?? "no address", dependencies)));
}
exports.default = { format };
//# sourceMappingURL=create.js.map