import { Sidebar } from "@/components/erp/sidebar";
import { requireAppUser } from "@/lib/erp-auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAppUser();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <Sidebar role={String(user.role)} email={user.email} />
      <main className="ml-72 p-8">{children}</main>
    </div>
  );
}
