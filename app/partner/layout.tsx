import DashboardShell from "@/components/layout/DashboardShell";
import { requirePageRole } from "@/lib/auth";

export default async function PartnerLayout({ children }: { children: React.ReactNode }) {
  const user = await requirePageRole(["REFERRAL_PARTNER"]);
  return (
    <DashboardShell title="Referral partner" subtitle="Partner" userName={user.fullName}
      items={[{ href: "/partner/dashboard", label: "Dashboard" }, { href: "/referral-terms", label: "Programme terms" }]}>
      {children}
    </DashboardShell>
  );
}
