export const metadata = { title: "Services" };

const services = [
  ["Property sales", "Residential and commercial properties, from listing to closing."],
  ["Rentals", "Apartments and houses for rent, with managed inspections."],
  ["Property management", "Tenant sourcing, rent collection and maintenance for owners."],
  ["Inspections", "Book a viewing online and meet the listing agent on site."],
];

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      <h1 className="text-3xl font-bold text-brand">Our services</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {services.map(([t, d]) => (
          <div key={t} className="card p-6"><h2 className="font-semibold text-brand">{t}</h2><p className="mt-2 text-sm text-slate-600">{d}</p></div>
        ))}
      </div>
    </div>
  );
}
