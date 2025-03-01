"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatGasCost = void 0;
/**
 * Formats gas cost for a given structLog
 * @param structLog StructLog to print gas cost for
 * @param gasCost Gas cost override to print
 * @param dependencies Tracer dependencies
 * @returns
 */
function formatGasCost(structLog, gasCost, dependencies) {
    if (dependencies.tracerEnv.gasCost) {
        return ` (cost: ${gasCost ?? structLog.gasCost})`;
    }
    else {
        return "";
    }
}
exports.formatGasCost = formatGasCost;
//# sourceMappingURL=gas-cost.js.map