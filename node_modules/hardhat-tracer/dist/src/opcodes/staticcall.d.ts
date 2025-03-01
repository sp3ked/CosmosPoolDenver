import { Item, TracerDependencies } from "../types";
export interface STATICCALL {
    from: string;
    to: string;
    inputData: string;
    returnData?: string;
    gasLimit: number;
    gasUsed?: number;
    success?: boolean;
}
declare function format(item: Item<STATICCALL>, dependencies: TracerDependencies): Promise<string>;
declare const _default: {
    format: typeof format;
};
export default _default;
//# sourceMappingURL=staticcall.d.ts.map