import DashboardShell from "@/components/layout/DashboardShell";
import { requirePageRole } from "@/lib/auth";

export default async function AgentLayout({ children }: { children: React.ReactNode }) {
  const user = await requirePageRole(["AGENT"]);
  return (
    <DashboardShell title="Agent workspace" subtitle="Agent" userName={user.fullName}
      items={[{ href: "/agent/dashboard", label: "Dashboard" }, { href: "/agent/leads", label: "My leads" }]}>
      {children}
    </DashboardShell>
  );
}
