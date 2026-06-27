export declare class CreateOrderItemDto {
    productId?: string;
    variantId?: string;
    quantity: number;
    unitPrice?: number;
}
export declare class CreateOrderDto {
    cartId?: string;
    items?: CreateOrderItemDto[];
    taxAmount?: number;
    shippingFee?: number;
    discount?: number;
    currency?: string;
}
