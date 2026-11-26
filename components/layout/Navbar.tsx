import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { homeFor } from "@/lib/permissions";
import LogoutButton from "./LogoutButton";

const links = [
  { href: "/", label: "Home" },
  { href: "/properties", label: "Properties" },
  { href: "/locations", label: "Locations" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default async function Navbar() {
  const user = await getCurrentUser();
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-brand/95 text-white backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3.5">
        <Link href="/" className="text-lg font-semibold tracking-[0.18em]">
          CELESTIA <span className="text-gold-light">ESTATES</span>
        </Link>
        <nav className="flex flex-wrap gap-6 text-sm font-medium text-slate-300">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="transition hover:text-gold-light">{l.label}</Link>
          ))}
        </nav>
        <div className="flex flex-wrap items-center gap-2">
          {user ? (
            <>
              <Link href={homeFor(user.role.name)} className="btn-gold">Dashboard</Link>
              <LogoutButton className="btn-ghost-light" />
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost-light">Sign in</Link>
              <Link href="/become-a-partner" className="btn-ghost-light">Earn by referring</Link>
              <Link href="/register" className="btn-gold">Register</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
