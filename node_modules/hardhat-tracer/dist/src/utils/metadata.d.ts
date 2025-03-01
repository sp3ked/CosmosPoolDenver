import { TracerDependencies } from "../types";
export declare function getFromNameTags(address: string, dependencies: TracerDependencies): string | undefined;
export declare function fetchContractName(to: string, dependencies: TracerDependencies): Promise<string | undefined>;
export declare function fetchContractNameFromMethodName(to: string, methodName: string, dependencies: TracerDependencies): Promise<string | undefined>;
export declare function fetchContractDecimals(to: string, dependencies: TracerDependencies): Promise<number | undefined>;
export declare function fetchContractNameUsingBytecodeComparison(address: string, dependencies: TracerDependencies): Promise<string | undefined>;
export declare function getBetterContractName(address: string, dependencies: TracerDependencies): Promise<string | undefined>;
//# sourceMappingURL=metadata.d.ts.map