import { Role } from "../../common/constants/roles.js";
export type ResourceConfig = {
    key: string;
    label: string;
    model: string;
    module: string;
    minReadRole: Role;
    minWriteRole: Role;
    searchableFields: string[];
    defaultSort: string;
    softDelete: boolean;
};
export declare const RESOURCE_REGISTRY: Record<string, ResourceConfig>;
export declare const RESOURCE_KEYS: string[];
