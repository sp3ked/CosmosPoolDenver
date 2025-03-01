"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TracerCache = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
// To locally cache contract name, decimals, and ABI to prevent async API calls
class TracerCache {
    constructor() {
        this.tokenDecimals = new Map();
        this.contractNames = new Map();
        this.fourByteDir = new Map();
    }
    setCachePath(cachePath) {
        this.cachePath = cachePath;
    }
    load() {
        fs_extra_1.default.ensureFileSync(this.getTracerCachePath());
        let json;
        try {
            json = fs_extra_1.default.readJSONSync(this.getTracerCachePath());
        }
        catch {
            json = {};
        }
        this.tokenDecimals = new Map(json.tokenDecimals ?? []);
        this.contractNames = new Map(json.contractNames ?? []);
        this.fourByteDir = new Map(json.fourByteDir ?? []);
    }
    save() {
        fs_extra_1.default.ensureFileSync(this.getTracerCachePath());
        fs_extra_1.default.writeJSONSync(this.getTracerCachePath(), {
            tokenDecimals: Array.from(this.tokenDecimals.entries()),
            contractNames: Array.from(this.contractNames.entries()),
            fourByteDir: Array.from(this.fourByteDir.entries()),
        }, { spaces: 2 });
    }
    getTracerCachePath() {
        if (!this.cachePath) {
            throw new Error("[hardhat-tracer]: cachePath not set");
        }
        return path_1.default.join(this.cachePath, "hardhat-tracer-cache", `data.json`);
    }
}
exports.TracerCache = TracerCache;
//# sourceMappingURL=cache.js.map