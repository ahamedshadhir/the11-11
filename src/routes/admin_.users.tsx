import { createFileRoute } from "@tanstack/react-router";
import { AdminFrame } from "@/components/admin-frame";
import { AdminUsers } from "@/components/admin-users";

export const Route = createFileRoute("/admin_/users")({
  component: UserManagement,
});

function UserManagement() {
  return (
    <AdminFrame tab="users">
      <AdminUsers />
    </AdminFrame>
  );
}
