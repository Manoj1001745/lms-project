import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { PanelHeader } from "@/components/dashboard/panel-header";
import { getUserServerSession } from "@/lib/server-auth";

export default async function StudentPlatformLayout({ children }: { children: ReactNode }) {
  const session = await getUserServerSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <PanelHeader
        title="LearningHun"
        role="student"
        userName={session.name}
        roleLabel={session.role}
      />
      {children}
    </div>
  );
}
