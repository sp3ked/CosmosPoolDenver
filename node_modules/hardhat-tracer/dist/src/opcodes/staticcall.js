"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const call_1 = require("../format/call");
const console_log_1 = require("../format/console-log");
const colors_1 = require("../utils/colors");
async function format(item, dependencies) {
    if (item.params.to.toLowerCase() === console_log_1.CONSOLE_LOG_ADDRESS.toLowerCase()) {
        try {
            const formatted = (0, console_log_1.formatConsoleLog)(item.params.inputData, dependencies);
            return `${(0, colors_1.colorConsole)("console.log")}(${formatted})`;
        }
        catch (e) {
            console.error("hardhat-tracer opcodes/staticcall/format", e);
        }
    }
    return ((0, colors_1.colorLabel)("[STATICCALL]") +
        " " +
        (await (0, call_1.formatCall)(item.params.to, item.params.inputData, 
        // TODO refactor these input types or order
        item.params.returnData ?? "0x", 0, item.params.gasUsed ?? 0, item.params.gasLimit, item.params.success ?? true, // if we don't have success, assume it was successful
        dependencies)));
}
exports.default = { format };
//# sourceMappingURL=staticcall.js.map