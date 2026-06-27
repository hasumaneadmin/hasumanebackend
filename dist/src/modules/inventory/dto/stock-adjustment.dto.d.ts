export declare class StockAdjustmentDto {
    movementType: "in" | "out" | "adjustment" | "reserved" | "released";
    quantity: number;
    reason?: string;
    referenceType?: string;
    referenceId?: string;
}
