export declare class AddCartItemDto {
    productId?: string;
    variantId?: string;
    quantity: number;
}
export declare class UpdateCartItemDto {
    itemId: string;
    quantity: number;
}
export declare class RemoveCartItemDto {
    itemId: string;
}
