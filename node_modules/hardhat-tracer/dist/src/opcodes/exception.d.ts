import { Item } from "../types";
export interface EXCEPTION {
    type: string;
    error: string;
}
declare function format(item: Item<EXCEPTION>): Promise<string>;
declare const _default: {
    format: typeof format;
};
export default _default;
//# sourceMappingURL=exception.d.ts.map