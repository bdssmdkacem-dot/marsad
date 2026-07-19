import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { signOut } from "@/lib/auth";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "لوحة القيادة" },
  { href: "/admin/requests", label: "مطالب المواطنين" },
  { href: "/admin/promises", label: "الوعود الانتخابية" },
  { href: "/admin/projects", label: "المشاريع العمومية" },
  { href: "/admin/reports", label: "التقارير" },
  { href: "/admin/surveys", label: "الاستطلاعات" },
  { href: "/admin/users", label: "المستخدمون", adminOnly: true },
  { href: "/admin/audit-logs", label: "سجل التدقيق", adminOnly: true },
  { href: "/admin/settings", label: "الإعدادات", adminOnly: true },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 shrink-0 bg-neutral-900 text-neutral-100 flex flex-col">
        <div className="px-5 py-5 border-b border-neutral-800">
          <p className="font-bold">لوحة الإدارة</p>
          <p className="text-xs text-neutral-400 mt-1">
            {user.role === "ADMIN" ? "مدير المنصة" : "مشرف"}
          </p>
        </div>
        <nav className="flex-1 py-3">
          {NAV_ITEMS.filter((item) => !item.adminOnly || user.role === "ADMIN").map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-5 py-2.5 text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/admin/login" });
          }}
          className="px-5 py-4 border-t border-neutral-800"
        >
          <button type="submit" className="text-sm text-neutral-400 hover:text-white">
            تسجيل الخروج
          </button>
        </form>
      </aside>
      <main className="flex-1 bg-neutral-50 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
