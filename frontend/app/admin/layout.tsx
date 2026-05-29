import type { ReactNode } from "react";
import { PanelHeader } from "@/components/dashboard/panel-header";
import { getAdminServerSession } from "@/lib/server-auth";

export default async function AdminDashboardLayout({ children }: { children: ReactNode }) {
  const session = await getAdminServerSession();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {session ? <PanelHeader title="Administration" role="admin" userName={session.name} roleLabel={session.role} /> : null}
      {children}
    </div>
  );
}

