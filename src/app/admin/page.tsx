import { AdminPortal } from "@/components/admin/AdminPortal";
import { requireAdminSession } from "@/lib/admin-session";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireAdminSession();
  return <AdminPortal />;
}
