"use client";
import { useRouter } from "next/navigation";

export default function UserStatusButton({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const next = status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
  return (
    <button
      className="btn-outline !px-3 !py-1"
      onClick={async () => {
        const res = await fetch(`/api/admin/users/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: next }) });
        if (!res.ok) alert((await res.json()).error);
        router.refresh();
      }}
    >
      {status === "ACTIVE" ? "Suspend" : "Activate"}
    </button>
  );
}
