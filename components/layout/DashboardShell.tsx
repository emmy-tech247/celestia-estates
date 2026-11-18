import Link from "next/link";
import LogoutButton from "./LogoutButton";

export type NavItem = { href: string; label: string };

export default function DashboardShell({
  title, subtitle, items, userName, children,
}: { title: string; subtitle: string; items: NavItem[]; userName: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen md:flex">
      <aside className="bg-brand text-slate-200 md:w-60 md:shrink-0">
        <div className="px-5 py-5">
          <Link href="/" className="text-base font-bold tracking-wide text-white">
            CELESTIA <span className="text-gold">ESTATES</span>
          </Link>
          <p className="mt-1 text-[11px] uppercase tracking-widest text-slate-400">{subtitle}</p>
        </div>
        <nav className="flex flex-wrap gap-1 px-3 pb-4 md:flex-col">
          {items.map((i) => (
            <Link key={i.href} href={i.href} className="rounded-lg px-3 py-2 text-sm hover:bg-white/10">
              {i.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
          <h1 className="text-lg font-semibold text-brand">{title}</h1>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-500">{userName}</span>
            <LogoutButton />
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
