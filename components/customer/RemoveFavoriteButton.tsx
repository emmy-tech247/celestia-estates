"use client";
import { useRouter } from "next/navigation";

export default function RemoveFavoriteButton({ propertyId }: { propertyId: string }) {
  const router = useRouter();
  return (
    <button className="btn-outline !px-3 !py-1 text-xs" onClick={async () => {
      await fetch(`/api/customer/favorites/${propertyId}`, { method: "DELETE" });
      router.refresh();
    }}>Remove</button>
  );
}
