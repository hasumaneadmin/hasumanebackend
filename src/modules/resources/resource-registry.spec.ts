import { RESOURCE_REGISTRY } from "./resource-registry.js";

describe("resource registry", () => {
  it("exposes every required production module", () => {
    expect(Object.keys(RESOURCE_REGISTRY)).toEqual(
      expect.arrayContaining([
        "products",
        "categories",
        "inventory",
        "carts",
        "wishlists",
        "orders",
        "payments",
        "refunds",
        "coupons",
        "notifications",
        "delivery",
        "tracking",
        "support",
        "analytics",
        "reports",
        "settings",
      ]),
    );
  });
});
