"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBetterContractName = exports.fetchContractNameUsingBytecodeComparison = exports.fetchContractDecimals = exports.fetchContractNameFromMethodName = exports.fetchContractName = exports.getFromNameTags = void 0;
const ethers_1 = require("ethers");
const utils_1 = require("ethers/lib/utils");
const compare_bytecode_1 = require("./compare-bytecode");
function getFromNameTags(address, dependencies) {
    return (dependencies.tracerEnv.nameTags[address] ||
        dependencies.tracerEnv.nameTags[address.toLowerCase()] ||
        dependencies.tracerEnv.nameTags[address.toUpperCase()] ||
        dependencies.tracerEnv.nameTags[ethers_1.ethers.utils.getAddress(address)]);
}
exports.getFromNameTags = getFromNameTags;
async function fetchContractName(to, dependencies) {
    const { cache } = dependencies.tracerEnv._internal;
    const cacheResult = cache.contractNames.get(to);
    if (cacheResult) {
        if (cacheResult === "unknown") {
            return undefined;
        }
        return cacheResult;
    }
    let name = await fetchContractNameFromMethodName(to, "symbol", dependencies);
    if (!name) {
        name = await fetchContractNameFromMethodName(to, "name", dependencies);
    }
    if (name) {
        // format the name a bit
        name = name.split(" ").join("");
    }
    // set the cache, so we don't do the request again
    cache.contractNames.set(to, name ?? "unknown");
    cache.save();
    return name;
}
exports.fetchContractName = fetchContractName;
async function fetchContractNameFromMethodName(to, methodName, dependencies) {
    const iface1 = new utils_1.Interface([
        `function ${methodName}() public view returns (string)`,
    ]);
    let result1;
    try {
        const enabled = dependencies.tracerEnv.enabled;
        dependencies.tracerEnv.enabled = false;
        result1 = await dependencies.provider.send("eth_call", [
            { to, data: iface1.encodeFunctionData(methodName, []) },
        ]);
        dependencies.tracerEnv.enabled = enabled;
        const d = iface1.decodeFunctionResult(methodName, result1);
        return d[0];
    }
    catch {
        try {
            const iface2 = new utils_1.Interface([
                `function ${methodName}() public view returns (bytes32)`,
            ]);
            const d = iface2.decodeFunctionResult(methodName, result1);
            const bytes32 = d[0];
            return ethers_1.ethers.utils.toUtf8String(bytes32);
        }
        catch { }
    }
    return undefined;
}
exports.fetchContractNameFromMethodName = fetchContractNameFromMethodName;
async function fetchContractDecimals(to, dependencies) {
    const iface1 = new utils_1.Interface([
        `function decimals() public view returns (uint8)`,
    ]);
    let result1;
    try {
        const enabled = dependencies.tracerEnv.enabled;
        dependencies.tracerEnv.enabled = false;
        result1 = await dependencies.provider.send("eth_call", [
            { to, data: iface1.encodeFunctionData("decimals", []) },
        ]);
        dependencies.tracerEnv.enabled = enabled;
        const d = iface1.decodeFunctionResult("decimals", result1);
        return d[0];
    }
    catch { }
    return undefined;
}
exports.fetchContractDecimals = fetchContractDecimals;
async function fetchContractNameUsingBytecodeComparison(address, dependencies) {
    const toBytecode = await dependencies.provider.send("eth_getCode", [address]);
    const names = await dependencies.artifacts.getAllFullyQualifiedNames();
    for (const name of names) {
        const _artifact = await dependencies.artifacts.readArtifact(name);
        // try to find the contract name
        if ((0, compare_bytecode_1.compareBytecode)(_artifact.deployedBytecode, toBytecode) > 0.5) {
            // if bytecode of "to" is the same as the deployed bytecode
            // we can use the artifact name
            return _artifact.contractName;
        }
    }
}
exports.fetchContractNameUsingBytecodeComparison = fetchContractNameUsingBytecodeComparison;
async function getBetterContractName(address, dependencies) {
    // 1. See if nameTag exists already
    const nameTag = getFromNameTags(address, dependencies);
    if (nameTag) {
        return nameTag;
    }
    // 2. See if there is a name() method that gives string or bytes32
    dependencies.tracerEnv.enabled = false; // disable tracer to avoid tracing these calls
    const contractNameFromNameMethod = await fetchContractName(address, dependencies);
    dependencies.tracerEnv.enabled = true; // enable tracer back
    if (contractNameFromNameMethod) {
        dependencies.tracerEnv.nameTags[address] = contractNameFromNameMethod;
        return contractNameFromNameMethod;
    }
    // 3. Match bytecode
    const contractNameFromBytecodeComparison = await fetchContractNameUsingBytecodeComparison(address, dependencies);
    if (contractNameFromBytecodeComparison) {
        dependencies.tracerEnv.nameTags[address] = contractNameFromBytecodeComparison;
        return contractNameFromBytecodeComparison;
    }
}
exports.getBetterContractName = getBetterContractName;
//# sourceMappingURL=metadata.js.map