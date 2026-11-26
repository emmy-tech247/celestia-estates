import Link from "next/link";

const explore = [
  { href: "/properties", label: "Properties" },
  { href: "/locations", label: "Locations" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];
const account = [
  { href: "/login", label: "Sign in" },
  { href: "/register", label: "Create an account" },
  { href: "/become-a-partner", label: "Become a referral partner" },
  { href: "/referral-terms", label: "Referral terms" },
];

export default function Footer() {
  return (
    <footer className="mt-20 bg-brand text-slate-300">
      <div className="h-1.5 bg-gold" />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 text-sm sm:grid-cols-3">
        <div>
          <p className="text-base font-semibold tracking-[0.18em] text-white">CELESTIA <span className="text-gold-light">ESTATES</span></p>
          <p className="mt-3 max-w-xs text-slate-400">Buy, rent and manage property with confidence across Nigeria.</p>
        </div>
        <div>
          <p className="eyebrow !text-gold-light">Explore</p>
          <ul className="mt-3 space-y-2">
            {explore.map((l) => <li key={l.href}><Link href={l.href} className="transition hover:text-gold-light">{l.label}</Link></li>)}
          </ul>
        </div>
        <div>
          <p className="eyebrow !text-gold-light">Account</p>
          <ul className="mt-3 space-y-2">
            {account.map((l) => <li key={l.href}><Link href={l.href} className="transition hover:text-gold-light">{l.label}</Link></li>)}
          </ul>
        </div>
      </div>
      <p className="border-t border-white/10 px-4 py-5 text-center text-xs text-slate-500">&copy; {new Date().getFullYear()} Celestia Estates. All rights reserved.</p>
    </footer>
  );
}
