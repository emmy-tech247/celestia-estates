import DashboardShell from "@/components/layout/DashboardShell";
import { requirePageRole } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requirePageRole(["SUPER_ADMIN", "MANAGER"]);
  return (
    <DashboardShell
      title="Property Management System"
      subtitle={user.role.name === "SUPER_ADMIN" ? "Super Admin" : "Manager"}
      userName={user.fullName}
      items={[
        { href: "/admin/dashboard", label: "Dashboard" },
        { href: "/admin/properties", label: "Properties" },
        { href: "/admin/leads", label: "Leads (CRM)" },
        { href: "/admin/inspections", label: "Inspections" },
        { href: "/admin/transactions", label: "Transactions" },
        { href: "/admin/partners", label: "Referral partners" },
        { href: "/admin/commissions", label: "Commissions & payouts" },
        { href: "/admin/analytics", label: "Analytics" },
        { href: "/admin/blog", label: "Blog" },
        { href: "/admin/users", label: "Users & agents" },
      ]}
    >
      {children}
    </DashboardShell>
  );
}
