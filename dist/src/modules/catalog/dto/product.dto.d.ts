export declare class CreateProductDto {
    code: string;
    name: string;
    productType: string;
    categoryId?: string | null;
    unit: string;
    price?: number | null;
    compareAtPrice?: number | null;
    taxPercent?: number | null;
    defaultQuantity: number;
    defaultSchedule: string;
    description?: string;
    tags?: unknown;
    isActive: boolean;
    sortOrder?: number;
}
declare const UpdateProductDto_base: import("@nestjs/common").Type<Partial<CreateProductDto>>;
export declare class UpdateProductDto extends UpdateProductDto_base {
}
export {};
