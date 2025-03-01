"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const object_1 = require("../format/object");
const colors_1 = require("../utils/colors");
async function format(item) {
    return `${(0, colors_1.colorLabel)("[EXCEPTION]")} ${(0, colors_1.colorError)(item.params.type)}(${(0, object_1.formatObject)({
        reason: item.params.error,
    })})`;
}
exports.default = { format };
//# sourceMappingURL=exception.js.map