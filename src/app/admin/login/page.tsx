import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { getAdminSession } from "@/lib/admin-session";

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session) redirect("/admin");

  return (
    <main className="grid min-h-screen place-items-center bg-[#111] px-4 py-10 text-zinc-100">
      <LoginForm />
    </main>
  );
}
