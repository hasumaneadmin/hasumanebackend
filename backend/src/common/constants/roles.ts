export enum Role {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  SUPPORT = "SUPPORT",
  DELIVERY_PARTNER = "DELIVERY_PARTNER",
  CUSTOMER = "CUSTOMER",
}

export const ROLE_HIERARCHY: Record<Role, number> = {
  [Role.SUPER_ADMIN]: 100,
  [Role.ADMIN]: 80,
  [Role.MANAGER]: 60,
  [Role.SUPPORT]: 40,
  [Role.DELIVERY_PARTNER]: 20,
  [Role.CUSTOMER]: 10,
};

export const ALL_ROLES = Object.values(Role);
