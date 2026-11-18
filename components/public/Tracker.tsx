"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { getSessionId } from "./session";

export default function Tracker({ type = "PAGE_VIEW", propertyId }: { type?: "PAGE_VIEW" | "PROPERTY_VIEW"; propertyId?: string }) {
  const pathname = usePathname();
  useEffect(() => {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({ type, sessionId: getSessionId(), path: pathname, propertyId }),
    }).catch(() => {});
  }, [pathname, type, propertyId]);
  return null;
}
