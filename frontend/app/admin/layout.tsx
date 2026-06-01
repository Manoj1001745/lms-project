import type { ReactNode } from "react";
import { AdminShell } from "@/components/dashboard/admin-shell";
import { getAdminServerSession } from "@/lib/server-auth";

export default async function AdminDashboardLayout({ children }: { children: ReactNode }) {
  const session = await getAdminServerSession();

  return (
    <AdminShell session={session}>{children}</AdminShell>
  );
}

