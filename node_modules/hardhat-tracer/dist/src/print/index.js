"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.print = void 0;
const console_1 = require("./console");
const json_1 = require("./json");
function print(txTrace, dependencies) {
    switch (dependencies.tracerEnv.printMode) {
        case "console":
            return (0, console_1.printConsole)(txTrace, dependencies);
        case "json":
            return (0, json_1.printJson)(txTrace);
        default:
            throw new Error(`[hardhat-tracer]: printMode "${dependencies.tracerEnv.printMode}" is not supported`);
    }
}
exports.print = print;
//# sourceMappingURL=index.js.map