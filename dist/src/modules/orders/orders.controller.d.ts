import { PaginationQueryDto } from "../../common/dto/pagination-query.dto.js";
import type { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { AddCartItemDto, RemoveCartItemDto, UpdateCartItemDto } from "./dto/cart.dto.js";
import { CreateOrderDto } from "./dto/create-order.dto.js";
import { OrdersService } from "./orders.service.js";
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    create(user: AuthenticatedUser, dto: CreateOrderDto): Promise<{
        user: {
            id: string;
            name: string;
            email: string | null;
            phone: string;
        } | null;
        items: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            total: import("@prisma/client/runtime/library").Decimal;
            productId: string | null;
            sku: string | null;
            variantId: string | null;
            taxAmount: import("@prisma/client/runtime/library").Decimal;
            orderId: string;
            quantity: import("@prisma/client/runtime/library").Decimal;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
        }[];
        deliveryAssignments: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            createdBy: string | null;
            updatedBy: string | null;
            status: string;
            orderId: string | null;
            deliveryPartnerId: string | null;
            assignedAt: Date;
            completedAt: Date | null;
            proofPhotoUrl: string | null;
            notes: string | null;
        }[];
        statusHistory: {
            id: string;
            createdAt: Date;
            status: string;
            note: string | null;
            changedBy: string | null;
            orderId: string;
        }[];
        payments: {
            id: string;
            userId: string | null;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            createdBy: string | null;
            updatedBy: string | null;
            status: string;
            currency: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            orderId: string | null;
            gateway: string | null;
            paymentMethod: string | null;
            transactionId: string | null;
            paidAt: Date | null;
        }[];
        refunds: {
            id: string;
            userId: string | null;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            createdBy: string | null;
            updatedBy: string | null;
            status: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            orderId: string | null;
            reason: string | null;
            paymentId: string | null;
            processedAt: Date | null;
        }[];
        trackingLogs: {
            message: string | null;
            id: string;
            createdAt: Date;
            actorId: string | null;
            status: string;
            orderId: string | null;
            latitude: import("@prisma/client/runtime/library").Decimal | null;
            longitude: import("@prisma/client/runtime/library").Decimal | null;
        }[];
    } & {
        id: string;
        userId: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        createdBy: string | null;
        updatedBy: string | null;
        total: import("@prisma/client/runtime/library").Decimal;
        status: string;
        orderNumber: string;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        taxAmount: import("@prisma/client/runtime/library").Decimal;
        shippingFee: import("@prisma/client/runtime/library").Decimal;
        discount: import("@prisma/client/runtime/library").Decimal;
        currency: string;
    }>;
    list(user: AuthenticatedUser, query: PaginationQueryDto): Promise<{
        success: boolean;
        message: string;
        data: ({
            user: {
                id: string;
                name: string;
                email: string | null;
                phone: string;
            } | null;
            items: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                total: import("@prisma/client/runtime/library").Decimal;
                productId: string | null;
                sku: string | null;
                variantId: string | null;
                taxAmount: import("@prisma/client/runtime/library").Decimal;
                orderId: string;
                quantity: import("@prisma/client/runtime/library").Decimal;
                unitPrice: import("@prisma/client/runtime/library").Decimal;
            }[];
            deliveryAssignments: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                createdBy: string | null;
                updatedBy: string | null;
                status: string;
                orderId: string | null;
                deliveryPartnerId: string | null;
                assignedAt: Date;
                completedAt: Date | null;
                proofPhotoUrl: string | null;
                notes: string | null;
            }[];
            statusHistory: {
                id: string;
                createdAt: Date;
                status: string;
                note: string | null;
                changedBy: string | null;
                orderId: string;
            }[];
            payments: {
                id: string;
                userId: string | null;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                createdBy: string | null;
                updatedBy: string | null;
                status: string;
                currency: string;
                amount: import("@prisma/client/runtime/library").Decimal;
                orderId: string | null;
                gateway: string | null;
                paymentMethod: string | null;
                transactionId: string | null;
                paidAt: Date | null;
            }[];
            refunds: {
                id: string;
                userId: string | null;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                createdBy: string | null;
                updatedBy: string | null;
                status: string;
                amount: import("@prisma/client/runtime/library").Decimal;
                orderId: string | null;
                reason: string | null;
                paymentId: string | null;
                processedAt: Date | null;
            }[];
            trackingLogs: {
                message: string | null;
                id: string;
                createdAt: Date;
                actorId: string | null;
                status: string;
                orderId: string | null;
                latitude: import("@prisma/client/runtime/library").Decimal | null;
                longitude: import("@prisma/client/runtime/library").Decimal | null;
            }[];
        } & {
            id: string;
            userId: string | null;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            createdBy: string | null;
            updatedBy: string | null;
            total: import("@prisma/client/runtime/library").Decimal;
            status: string;
            orderNumber: string;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            taxAmount: import("@prisma/client/runtime/library").Decimal;
            shippingFee: import("@prisma/client/runtime/library").Decimal;
            discount: import("@prisma/client/runtime/library").Decimal;
            currency: string;
        })[];
        meta: import("../../common/utils/pagination.js").PaginationMeta;
    }>;
    get(user: AuthenticatedUser, id: string): Promise<{
        user: {
            id: string;
            name: string;
            email: string | null;
            phone: string;
        } | null;
        items: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            total: import("@prisma/client/runtime/library").Decimal;
            productId: string | null;
            sku: string | null;
            variantId: string | null;
            taxAmount: import("@prisma/client/runtime/library").Decimal;
            orderId: string;
            quantity: import("@prisma/client/runtime/library").Decimal;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
        }[];
        deliveryAssignments: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            createdBy: string | null;
            updatedBy: string | null;
            status: string;
            orderId: string | null;
            deliveryPartnerId: string | null;
            assignedAt: Date;
            completedAt: Date | null;
            proofPhotoUrl: string | null;
            notes: string | null;
        }[];
        statusHistory: {
            id: string;
            createdAt: Date;
            status: string;
            note: string | null;
            changedBy: string | null;
            orderId: string;
        }[];
        payments: {
            id: string;
            userId: string | null;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            createdBy: string | null;
            updatedBy: string | null;
            status: string;
            currency: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            orderId: string | null;
            gateway: string | null;
            paymentMethod: string | null;
            transactionId: string | null;
            paidAt: Date | null;
        }[];
        refunds: {
            id: string;
            userId: string | null;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            createdBy: string | null;
            updatedBy: string | null;
            status: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            orderId: string | null;
            reason: string | null;
            paymentId: string | null;
            processedAt: Date | null;
        }[];
        trackingLogs: {
            message: string | null;
            id: string;
            createdAt: Date;
            actorId: string | null;
            status: string;
            orderId: string | null;
            latitude: import("@prisma/client/runtime/library").Decimal | null;
            longitude: import("@prisma/client/runtime/library").Decimal | null;
        }[];
    } & {
        id: string;
        userId: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        createdBy: string | null;
        updatedBy: string | null;
        total: import("@prisma/client/runtime/library").Decimal;
        status: string;
        orderNumber: string;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        taxAmount: import("@prisma/client/runtime/library").Decimal;
        shippingFee: import("@prisma/client/runtime/library").Decimal;
        discount: import("@prisma/client/runtime/library").Decimal;
        currency: string;
    }>;
    cancel(user: AuthenticatedUser, id: string): Promise<{
        user: {
            id: string;
            name: string;
            email: string | null;
            phone: string;
        } | null;
        items: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            total: import("@prisma/client/runtime/library").Decimal;
            productId: string | null;
            sku: string | null;
            variantId: string | null;
            taxAmount: import("@prisma/client/runtime/library").Decimal;
            orderId: string;
            quantity: import("@prisma/client/runtime/library").Decimal;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
        }[];
        deliveryAssignments: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            createdBy: string | null;
            updatedBy: string | null;
            status: string;
            orderId: string | null;
            deliveryPartnerId: string | null;
            assignedAt: Date;
            completedAt: Date | null;
            proofPhotoUrl: string | null;
            notes: string | null;
        }[];
        statusHistory: {
            id: string;
            createdAt: Date;
            status: string;
            note: string | null;
            changedBy: string | null;
            orderId: string;
        }[];
        payments: {
            id: string;
            userId: string | null;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            createdBy: string | null;
            updatedBy: string | null;
            status: string;
            currency: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            orderId: string | null;
            gateway: string | null;
            paymentMethod: string | null;
            transactionId: string | null;
            paidAt: Date | null;
        }[];
        refunds: {
            id: string;
            userId: string | null;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            createdBy: string | null;
            updatedBy: string | null;
            status: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            orderId: string | null;
            reason: string | null;
            paymentId: string | null;
            processedAt: Date | null;
        }[];
        trackingLogs: {
            message: string | null;
            id: string;
            createdAt: Date;
            actorId: string | null;
            status: string;
            orderId: string | null;
            latitude: import("@prisma/client/runtime/library").Decimal | null;
            longitude: import("@prisma/client/runtime/library").Decimal | null;
        }[];
    } & {
        id: string;
        userId: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        createdBy: string | null;
        updatedBy: string | null;
        total: import("@prisma/client/runtime/library").Decimal;
        status: string;
        orderNumber: string;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        taxAmount: import("@prisma/client/runtime/library").Decimal;
        shippingFee: import("@prisma/client/runtime/library").Decimal;
        discount: import("@prisma/client/runtime/library").Decimal;
        currency: string;
    }>;
}
export declare class CartController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    get(user: AuthenticatedUser): Promise<{
        cart: ({
            items: ({
                product: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    deletedAt: Date | null;
                    createdBy: string | null;
                    updatedBy: string | null;
                    name: string;
                    description: string | null;
                    sortOrder: number;
                    tags: import("@prisma/client/runtime/library").JsonValue | null;
                    isActive: boolean;
                    code: string;
                    productType: string;
                    categoryId: string | null;
                    unit: string;
                    price: import("@prisma/client/runtime/library").Decimal | null;
                    compareAtPrice: import("@prisma/client/runtime/library").Decimal | null;
                    taxPercent: import("@prisma/client/runtime/library").Decimal | null;
                    defaultQuantity: number;
                    defaultSchedule: string;
                } | null;
                variant: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    deletedAt: Date | null;
                    createdBy: string | null;
                    updatedBy: string | null;
                    name: string;
                    isActive: boolean;
                    unit: string;
                    price: import("@prisma/client/runtime/library").Decimal | null;
                    compareAtPrice: import("@prisma/client/runtime/library").Decimal | null;
                    productId: string;
                    sku: string;
                    attributes: import("@prisma/client/runtime/library").JsonValue | null;
                } | null;
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                productId: string | null;
                variantId: string | null;
                quantity: import("@prisma/client/runtime/library").Decimal;
                unitPrice: import("@prisma/client/runtime/library").Decimal | null;
                cartId: string;
            })[];
        } & {
            id: string;
            userId: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            createdBy: string | null;
            updatedBy: string | null;
            status: string;
        }) | null;
        totals: {
            itemCount: number;
            subtotal: number;
        };
    }>;
    add(user: AuthenticatedUser, dto: AddCartItemDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        productId: string | null;
        variantId: string | null;
        quantity: import("@prisma/client/runtime/library").Decimal;
        unitPrice: import("@prisma/client/runtime/library").Decimal | null;
        cartId: string;
    }>;
    update(user: AuthenticatedUser, dto: UpdateCartItemDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        productId: string | null;
        variantId: string | null;
        quantity: import("@prisma/client/runtime/library").Decimal;
        unitPrice: import("@prisma/client/runtime/library").Decimal | null;
        cartId: string;
    }>;
    remove(user: AuthenticatedUser, dto: RemoveCartItemDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        productId: string | null;
        variantId: string | null;
        quantity: import("@prisma/client/runtime/library").Decimal;
        unitPrice: import("@prisma/client/runtime/library").Decimal | null;
        cartId: string;
    }>;
}
