export var Role;
(function (Role) {
    Role["SUPER_ADMIN"] = "SUPER_ADMIN";
    Role["ADMIN"] = "ADMIN";
    Role["MANAGER"] = "MANAGER";
    Role["SUPPORT"] = "SUPPORT";
    Role["DELIVERY_PARTNER"] = "DELIVERY_PARTNER";
    Role["CUSTOMER"] = "CUSTOMER";
})(Role || (Role = {}));
export const ROLE_HIERARCHY = {
    [Role.SUPER_ADMIN]: 100,
    [Role.ADMIN]: 80,
    [Role.MANAGER]: 60,
    [Role.SUPPORT]: 40,
    [Role.DELIVERY_PARTNER]: 20,
    [Role.CUSTOMER]: 10,
};
export const ALL_ROLES = Object.values(Role);
//# sourceMappingURL=roles.js.map