"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatConsoleLog = exports.CONSOLE_LOG_ADDRESS = void 0;
const ethers_1 = require("ethers");
const console_log_methods_json_1 = __importDefault(require("./console-log-methods.json"));
const result_1 = require("./result");
// TODO try to import this from somewhere in hardhat
exports.CONSOLE_LOG_ADDRESS = "0x000000000000000000636f6e736f6c652e6c6f67";
function formatConsoleLog(data, dependencies) {
    ethers_1.ethers.utils.Logger.setLogLevel(ethers_1.ethers.utils.Logger.levels.ERROR);
    const iface = new ethers_1.ethers.utils.Interface(console_log_methods_json_1.default);
    const signature = data.slice(0, 10);
    const result = iface.decodeFunctionData(signature, data);
    return (0, result_1.formatResult)(result, iface.getFunction(signature).inputs, {}, dependencies);
}
exports.formatConsoleLog = formatConsoleLog;
//# sourceMappingURL=console-log.js.map