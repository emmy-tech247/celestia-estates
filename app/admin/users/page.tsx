import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import Badge from "@/components/ui/Badge";
import CreateStaffForm from "@/components/admin/CreateStaffForm";
import UserStatusButton from "@/components/admin/UserStatusButton";

export default async function AdminUsers() {
  const me = await getCurrentUser();
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    select: { id: true, fullName: true, email: true, phone: true, status: true, role: { select: { name: true } } },
  });

  return (
    <div className="space-y-6">
      <CreateStaffForm canCreateManager={me?.role.name === "SUPER_ADMIN"} />
      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 text-xs uppercase text-slate-500">
            <tr><th className="p-3">Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Status</th><th className="pr-3"></th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => (
              <tr key={u.id.toString()}>
                <td className="p-3 font-medium">{u.fullName}</td>
                <td>{u.email}</td>
                <td>{u.phone ?? "—"}</td>
                <td>{u.role.name.replace("_", " ")}</td>
                <td><Badge value={u.status} /></td>
                <td className="pr-3">
                  {u.role.name !== "SUPER_ADMIN" && u.id !== me?.id && <UserStatusButton id={u.id.toString()} status={u.status} />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
