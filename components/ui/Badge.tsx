const tones: Record<string, string> = {
  PUBLISHED: "bg-green-100 text-green-700", APPROVED: "bg-green-100 text-green-700", ACTIVE: "bg-green-100 text-green-700",
  COMPLETED: "bg-green-100 text-green-700", PAID: "bg-green-100 text-green-700", WON: "bg-green-100 text-green-700",
  CONVERTED: "bg-green-100 text-green-700", SUCCESSFUL: "bg-green-100 text-green-700",
  DRAFT: "bg-slate-100 text-slate-600", ARCHIVED: "bg-slate-200 text-slate-600",
  PENDING: "bg-amber-100 text-amber-700", REQUESTED: "bg-amber-100 text-amber-700", RESCHEDULED: "bg-amber-100 text-amber-700",
  RESERVED: "bg-amber-100 text-amber-700", PAYMENT_PROCESSING: "bg-amber-100 text-amber-700",
  NEW: "bg-blue-100 text-blue-700", CONTACTED: "bg-sky-100 text-sky-700", INSPECTION_SCHEDULED: "bg-indigo-100 text-indigo-700",
  NEGOTIATION: "bg-purple-100 text-purple-700", SOLD: "bg-purple-100 text-purple-700", RENTED: "bg-purple-100 text-purple-700",
  CANCELLED: "bg-red-100 text-red-700", SUSPENDED: "bg-red-100 text-red-700", REJECTED: "bg-red-100 text-red-700",
  LOST: "bg-red-100 text-red-700", FAILED: "bg-red-100 text-red-700",
};

export const pretty = (v: string) => v.charAt(0) + v.slice(1).toLowerCase().replace(/_/g, " ");

export default function Badge({ value }: { value: string }) {
  return (
    <span className={`whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[value] ?? "bg-slate-100 text-slate-600"}`}>
      {pretty(value)}
    </span>
  );
}
