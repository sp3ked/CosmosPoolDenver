import { CallItem, Item } from "../types";
export declare function isItem(item: any): item is Item<any>;
export declare const callOpcodes: readonly ["CALL", "STATICCALL", "DELEGATECALL", "CALLCODE", "CREATE", "CREATE2"];
export declare function isCallItem(item: Item<any>): item is CallItem;
//# sourceMappingURL=item.d.ts.map