import type { RoleName } from "@prisma/client";

export const ADMIN_ROLES: RoleName[] = ["SUPER_ADMIN", "MANAGER"];
export const STAFF_ROLES: RoleName[] = ["SUPER_ADMIN", "MANAGER", "AGENT"];

export const isAdmin = (role: RoleName) => ADMIN_ROLES.includes(role);

export function homeFor(role: RoleName) {
  if (role === "AGENT") return "/agent/dashboard";
  if (role === "CUSTOMER") return "/customer/dashboard";
  if (role === "REFERRAL_PARTNER") return "/partner/dashboard";
  return "/admin/dashboard";
}
