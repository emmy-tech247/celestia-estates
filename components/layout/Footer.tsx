export default function Footer() {
  return (
    <footer className="mt-16 bg-brand text-slate-300">
      <div className="mx-auto max-w-6xl px-4 py-10 text-sm">
        <p className="text-base font-semibold text-white">CELESTIA <span className="text-gold">ESTATES</span></p>
        <p className="mt-2 max-w-md">Buy, rent and manage property with confidence across Nigeria.</p>
        <p className="mt-6 text-xs text-slate-500">&copy; {new Date().getFullYear()} Celestia Estates. All rights reserved.</p>
      </div>
    </footer>
  );
}
