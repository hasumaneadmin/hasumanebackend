import { i as getAdminRoleLoginPage, n as AdminPage, t as Route } from "./admin._role-CGHLeiF-.js";
import { Navigate } from "@tanstack/react-router";
import { jsx } from "react/jsx-runtime";
//#region src/routes/admin.$role.tsx?tsr-split=component
function RoleAdminPage() {
	const { role } = Route.useParams();
	const loginPage = getAdminRoleLoginPage(role);
	if (!loginPage) return /* @__PURE__ */ jsx(Navigate, {
		to: "/admin",
		replace: true
	});
	return /* @__PURE__ */ jsx(AdminPage, { initialRole: loginPage.role });
}
//#endregion
export { RoleAdminPage as component };
