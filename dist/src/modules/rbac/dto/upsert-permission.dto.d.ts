import { Role } from "../../../common/constants/roles.js";
export declare class UpsertPermissionDto {
    role: Role;
    module: string;
    canView: boolean;
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canExport: boolean;
}
