"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatObject = void 0;
const constants_1 = require("../constants");
const utils_1 = require("../utils");
function formatObject(obj) {
    return Object.entries(obj)
        .map((entries) => {
        const [key] = entries;
        let [, value] = entries;
        if (typeof value === "string") {
            value = (0, utils_1.colorValue)(`"${value}"`);
        }
        else if (Array.isArray(value)) {
            value = `[${value.map((v) => formatObject(v))}]`;
        }
        else if (typeof value === "object") {
            value = `{${formatObject(value)}}`;
        }
        return `${(0, utils_1.colorKey)(key + constants_1.SEPARATOR)}${value}`;
    })
        .join(", ");
}
exports.formatObject = formatObject;
//# sourceMappingURL=object.js.map