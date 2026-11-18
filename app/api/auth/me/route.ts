import { handle, json } from "@/lib/api";
import { requireUser } from "@/lib/auth";

export const GET = handle(async () => {
  const u = await requireUser();
  return json({
    user: { id: u.id, fullName: u.fullName, email: u.email, phone: u.phone, role: u.role.name },
  });
});
