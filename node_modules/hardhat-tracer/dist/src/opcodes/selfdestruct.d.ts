import { Item } from "../types";
export interface SELFDESTRUCT {
    beneficiary: string;
}
declare function format(item: Item<SELFDESTRUCT>): Promise<string>;
declare const _default: {
    format: typeof format;
};
export default _default;
//# sourceMappingURL=selfdestruct.d.ts.map