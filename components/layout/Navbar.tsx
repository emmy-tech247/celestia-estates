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
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="text-lg font-bold tracking-wide text-brand">
          CELESTIA <span className="text-gold">ESTATES</span>
        </Link>
        <nav className="flex flex-wrap gap-5 text-sm font-medium text-slate-600">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-gold">{l.label}</Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link href={homeFor(user.role.name)} className="btn">Dashboard</Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="btn-outline">Sign in</Link>
              <Link href="/become-a-partner" className="btn-outline">Earn by referring</Link>
              <Link href="/register" className="btn">Register</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
