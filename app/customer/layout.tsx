import DashboardShell from "@/components/layout/DashboardShell";
import { requirePageRole } from "@/lib/auth";

export default async function CustomerLayout({ children }: { children: React.ReactNode }) {
  const user = await requirePageRole(["CUSTOMER"]);
  return (
    <DashboardShell title="My account" subtitle="Customer" userName={user.fullName}
      items={[
        { href: "/customer/dashboard", label: "Dashboard" },
        { href: "/customer/favorites", label: "Saved properties" },
        { href: "/customer/inspections", label: "Inspections" },
        { href: "/properties", label: "Browse properties" },
      ]}>
      {children}
    </DashboardShell>
  );
}
