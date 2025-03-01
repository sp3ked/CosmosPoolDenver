import { Item, TracerDependencies } from "../types";
export interface CREATE2 {
    from: string;
    initCode: string;
    salt: string;
    value: string;
    deployedCode?: string;
    deployedAddress?: string;
    gasLimit: number;
    gasUsed?: number;
}
declare function format(item: Item<CREATE2>, dependencies: TracerDependencies): Promise<string>;
declare const _default: {
    format: typeof format;
};
export default _default;
//# sourceMappingURL=create2.d.ts.map