import Link from "next/link";
import LogoutButton from "./LogoutButton";
import NavLink from "./NavLink";

export type NavItem = { href: string; label: string };

export default function DashboardShell({
  title, subtitle, items, userName, children,
}: { title: string; subtitle: string; items: NavItem[]; userName: string; children: React.ReactNode }) {
  const initials = userName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div className="min-h-screen bg-canvas md:flex">
      <aside className="border-r border-slate-200 bg-white md:w-60 md:shrink-0">
        <div className="h-1.5 bg-plum" />
        <div className="px-5 py-5">
          <Link href="/" className="text-base font-semibold tracking-[0.18em] text-brand">
            CELESTIA <span className="text-gold-dark">ESTATES</span>
          </Link>
          <p className="mt-1 text-[11px] uppercase tracking-widest text-slate-400">{subtitle}</p>
        </div>
        <nav className="flex flex-wrap gap-1 px-3 pb-4 md:flex-col">
          {items.map((i) => <NavLink key={i.href} href={i.href} label={i.label} />)}
        </nav>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
          <h1 className="rounded-full bg-brand px-4 py-1.5 text-sm font-semibold text-white">{title}</h1>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-slate-500 sm:inline">{userName}</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-plum text-xs font-semibold text-white">{initials}</span>
            <LogoutButton />
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
