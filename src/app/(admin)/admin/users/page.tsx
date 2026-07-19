import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { can } from "@/lib/permissions";
import { updateUserRole } from "./actions";
import { revalidatePath } from "next/cache";

const ROLE_LABELS: Record<string, string> = {
  CITIZEN: "مواطن",
  MODERATOR: "مشرف",
  ADMIN: "مدير المنصة",
};

export default async function AdminUsersPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser || !can(currentUser.role, "user:manage")) {
    return <p className="text-red-600">لا تملك صلاحية الوصول إلى هذه الصفحة.</p>;
  }

  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });

  async function setRole(formData: FormData) {
    "use server";
    await updateUserRole(String(formData.get("id")), formData.get("role") as never);
    revalidatePath("/admin/users");
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">إدارة المستخدمين</h1>

      <table className="w-full text-sm bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <thead className="bg-neutral-100 text-neutral-600">
          <tr>
            <th className="text-right px-4 py-3">الاسم</th>
            <th className="text-right px-4 py-3">البريد الإلكتروني</th>
            <th className="text-right px-4 py-3">الدور</th>
            <th className="text-right px-4 py-3">تعديل</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t border-neutral-100">
              <td className="px-4 py-3">{u.name ?? "—"}</td>
              <td className="px-4 py-3">{u.email}</td>
              <td className="px-4 py-3">{ROLE_LABELS[u.role]}</td>
              <td className="px-4 py-3">
                {u.id === currentUser.id ? (
                  <span className="text-xs text-neutral-400">(حسابك)</span>
                ) : (
                  <form action={setRole} className="flex gap-2">
                    <input type="hidden" name="id" value={u.id} />
                    <select
                      name="role"
                      defaultValue={u.role}
                      className="rounded-lg border border-neutral-300 px-2 py-1 text-xs"
                    >
                      <option value="CITIZEN">مواطن</option>
                      <option value="MODERATOR">مشرف</option>
                      <option value="ADMIN">مدير المنصة</option>
                    </select>
                    <button className="text-xs bg-teal-700 text-white px-3 py-1 rounded-lg hover:bg-teal-800">
                      حفظ
                    </button>
                  </form>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
