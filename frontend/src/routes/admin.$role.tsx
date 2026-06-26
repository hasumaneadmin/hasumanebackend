import { createFileRoute, Navigate } from "@tanstack/react-router";

import { AdminPage, getAdminRoleLoginPage } from "./admin";

export const Route = createFileRoute("/admin/$role")({
  head: ({ params }) => {
    const loginPage = getAdminRoleLoginPage(params.role);
    return {
      meta: [
        {
          title: loginPage ? `${loginPage.title} Login | HasuMane Admin` : "HasuMane Admin",
        },
        {
          name: "description",
          content:
            loginPage?.description || "HasuMane role-based admin login for production operations.",
        },
        { name: "robots", content: "noindex,nofollow,noarchive" },
      ],
    };
  },
  component: RoleAdminPage,
});

function RoleAdminPage() {
  const { role } = Route.useParams();
  const loginPage = getAdminRoleLoginPage(role);

  if (!loginPage) {
    return <Navigate to="/admin" replace />;
  }

  return <AdminPage initialRole={loginPage.role} />;
}
