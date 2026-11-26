"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavLink({ href, label }: { href: string; label: string }) {
  const path = usePathname();
  const on = path === href || path.startsWith(href + "/");
  return (
    <Link
      href={href}
      className={`rounded-xl px-3 py-2 text-sm font-medium transition ${on ? "bg-plum text-white shadow-sm" : "text-slate-600 hover:bg-plum/10 hover:text-plum"}`}
    >
      {label}
    </Link>
  );
}
