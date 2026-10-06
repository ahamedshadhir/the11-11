import { createFileRoute } from "@tanstack/react-router";
import { AdminFrame } from "@/components/admin-frame";
import { AdminPages } from "@/components/admin-pages";

export const Route = createFileRoute("/admin_/platform")({
  component: PlatformManagement,
});

function PlatformManagement() {
  return (
    <AdminFrame tab="platform">
      <AdminPages />
    </AdminFrame>
  );
}
