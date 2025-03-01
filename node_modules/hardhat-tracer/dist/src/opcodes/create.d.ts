import { Item, TracerDependencies } from "../types";
export interface CREATE {
    from: string;
    initCode: string;
    value: string;
    deployedCode?: string;
    deployedAddress?: string;
    gasLimit: number;
    gasUsed?: number;
}
declare function format(item: Item<CREATE>, dependencies: TracerDependencies): Promise<string>;
declare const _default: {
    format: typeof format;
};
export default _default;
//# sourceMappingURL=create.d.ts.map