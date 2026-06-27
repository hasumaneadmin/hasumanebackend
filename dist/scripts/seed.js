import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const categories = [
    {
        name: "Dairy Essentials",
        slug: "dairy-essentials",
        description: "Core fresh dairy products for daily consumption and pantry use.",
        sortOrder: 0,
    },
];
const products = [
    {
        code: "MILK-01",
        name: "Milk",
        productType: "milk",
        categorySlug: "dairy-essentials",
        unit: "litre",
        price: 60,
        taxPercent: 0,
        defaultQuantity: 1,
        defaultSchedule: "daily",
        description: "Fresh farm milk delivered chilled and ready for daily use.",
        tags: ["fresh", "daily", "milk"],
        sortOrder: 0,
    },
    {
        code: "CURD-02",
        name: "Curd",
        productType: "curd",
        categorySlug: "dairy-essentials",
        unit: "litre",
        price: 35,
        taxPercent: 0,
        defaultQuantity: 1,
        defaultSchedule: "daily",
        description: "Thick set curd made from our fresh milk batches.",
        tags: ["curd", "fresh", "daily"],
        sortOrder: 1,
    },
    {
        code: "BUTTER-03",
        name: "Butter",
        productType: "butter",
        categorySlug: "dairy-essentials",
        unit: "gram",
        price: 120,
        compareAtPrice: 135,
        taxPercent: 0,
        defaultQuantity: 1,
        defaultSchedule: "weekly",
        description: "Small-batch churned butter with a rich traditional finish.",
        tags: ["butter", "spread", "dairy"],
        sortOrder: 2,
    },
    {
        code: "GHEE-05",
        name: "Ghee",
        productType: "ghee",
        categorySlug: "dairy-essentials",
        unit: "kg",
        price: 260,
        compareAtPrice: 285,
        taxPercent: 0,
        defaultQuantity: 1,
        defaultSchedule: "monthly",
        description: "Slow-cooked ghee with a clean aroma and rich color.",
        tags: ["ghee", "traditional", "premium"],
        sortOrder: 3,
    },
    {
        code: "PANEER-04",
        name: "Paneer",
        productType: "paneer",
        categorySlug: "dairy-essentials",
        unit: "gram",
        price: 180,
        compareAtPrice: 195,
        taxPercent: 0,
        defaultQuantity: 1,
        defaultSchedule: "weekly",
        description: "Soft fresh paneer for home cooking and everyday meals.",
        tags: ["paneer", "protein", "fresh"],
        sortOrder: 4,
    },
    {
        code: "CHEESE-06",
        name: "Cheese",
        productType: "cheese",
        categorySlug: "dairy-essentials",
        unit: "gram",
        price: 220,
        compareAtPrice: 245,
        taxPercent: 0,
        defaultQuantity: 1,
        defaultSchedule: "weekly",
        description: "Fresh mild cheese for cooking, slicing, and family meals.",
        tags: ["cheese", "fresh", "dairy"],
        sortOrder: 5,
    },
];
async function main() {
    const categoryBySlug = new Map();
    for (const categoryInput of categories) {
        const category = await prisma.productCategory.upsert({
            where: { slug: categoryInput.slug },
            update: {
                name: categoryInput.name,
                description: categoryInput.description,
                isActive: true,
                sortOrder: categoryInput.sortOrder,
            },
            create: {
                ...categoryInput,
                isActive: true,
            },
        });
        categoryBySlug.set(category.slug, category.id);
    }
    for (const productInput of products) {
        const categoryId = categoryBySlug.get(productInput.categorySlug) || null;
        await prisma.product.upsert({
            where: { code: productInput.code },
            update: {
                name: productInput.name,
                productType: productInput.productType,
                categoryId,
                unit: productInput.unit,
                price: productInput.price,
                compareAtPrice: productInput.compareAtPrice ?? null,
                taxPercent: productInput.taxPercent ?? null,
                defaultQuantity: productInput.defaultQuantity,
                defaultSchedule: productInput.defaultSchedule,
                description: productInput.description,
                tags: productInput.tags,
                isActive: true,
                sortOrder: productInput.sortOrder,
            },
            create: {
                code: productInput.code,
                name: productInput.name,
                productType: productInput.productType,
                categoryId,
                unit: productInput.unit,
                price: productInput.price,
                compareAtPrice: productInput.compareAtPrice ?? null,
                taxPercent: productInput.taxPercent ?? null,
                defaultQuantity: productInput.defaultQuantity,
                defaultSchedule: productInput.defaultSchedule,
                description: productInput.description,
                tags: productInput.tags,
                isActive: true,
                sortOrder: productInput.sortOrder,
            },
        });
    }
    console.log(`Seeded ${products.length} products and ${categories.length} categories.`);
}
main()
    .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map