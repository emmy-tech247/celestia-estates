const dots = { plum: "bg-plum", green: "bg-emerald-500", ember: "bg-ember", gold: "bg-gold" };

export default function Stat({
  label, value, tone = "plum",
}: { label: string; value: string | number; tone?: keyof typeof dots }) {
  return (
    <div className="card p-5">
      <p className="flex items-center gap-2 text-sm text-slate-500"><span className={`h-2 w-2 rounded-full ${dots[tone]}`} />{label}</p>
      <p className="mt-2 text-3xl font-bold text-brand">{value}</p>
    </div>
  );
}
