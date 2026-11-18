export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="text-3xl font-bold text-brand">Contact us</h1>
      <p className="mt-4 text-slate-700">
        To ask about a specific property, use the enquiry form on its page so the right agent receives it.
        For anything else, reach us using the details below.
      </p>
      <div className="card mt-6 space-y-1 p-6 text-sm">
        <p><strong>Email:</strong> hello@celestiaestates.com</p>
        <p><strong>Office:</strong> Abuja, Nigeria</p>
      </div>
    </div>
  );
}
