import { prisma } from "@/lib/prisma";
import { moderateRequest } from "./actions";
import { revalidatePath } from "next/cache";

const CATEGORY_LABELS: Record<string, string> = {
  EDUCATION: "التعليم",
  HEALTH: "الصحة",
  EMPLOYMENT: "التشغيل",
  TRANSPORT: "النقل",
  WATER: "الماء",
  ELECTRICITY: "الكهرباء",
  ENVIRONMENT: "البيئة",
  INFRASTRUCTURE: "البنية التحتية",
  YOUTH: "الشباب",
  CULTURE: "الثقافة",
  SPORTS: "الرياضة",
  ADMINISTRATION: "الإدارة",
};

export default async function AdminRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const status = params.status ?? "PENDING_REVIEW";

  const requests = await prisma.citizenRequest.findMany({
    where: { status: status as never },
    include: { region: true },
    orderBy: { createdAt: "asc" },
    take: 100,
  });

  async function approve(formData: FormData) {
    "use server";
    await moderateRequest(String(formData.get("id")), "APPROVED");
    revalidatePath("/admin/requests");
  }
  async function reject(formData: FormData) {
    "use server";
    await moderateRequest(
      String(formData.get("id")),
      "REJECTED",
      String(formData.get("note") ?? "")
    );
    revalidatePath("/admin/requests");
  }
  async function resolve(formData: FormData) {
    "use server";
    await moderateRequest(String(formData.get("id")), "RESOLVED");
    revalidatePath("/admin/requests");
  }

  const tabs = [
    { key: "PENDING_REVIEW", label: "قيد المراجعة" },
    { key: "APPROVED", label: "مقبول" },
    { key: "UNDER_REVIEW", label: "قيد الدراسة" },
    { key: "RESOLVED", label: "تم الحل" },
    { key: "REJECTED", label: "مرفوض" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">مطالب المواطنين — الإشراف</h1>

      <div className="flex gap-2 mb-6">
        {tabs.map((t) => (
          <a
            key={t.key}
            href={`/admin/requests?status=${t.key}`}
            className={`text-sm px-3 py-1.5 rounded-full border ${
              status === t.key
                ? "bg-teal-700 text-white border-teal-700"
                : "border-neutral-300 hover:bg-neutral-100"
            }`}
          >
            {t.label}
          </a>
        ))}
      </div>

      <div className="space-y-3">
        {requests.map((r) => (
          <div key={r.id} className="rounded-lg border border-neutral-200 bg-white p-4">
            <div className="flex justify-between items-start gap-4">
              <div>
                <p className="font-medium">{r.title}</p>
                <p className="text-sm text-neutral-600 mt-1">{r.description}</p>
                <p className="text-xs text-neutral-500 mt-2">
                  {CATEGORY_LABELS[r.category]} · {r.region?.nameAr ?? "غير محدد"} ·{" "}
                  {new Intl.DateTimeFormat("ar-MA", { dateStyle: "medium" }).format(r.createdAt)}
                </p>
              </div>

              {status === "PENDING_REVIEW" && (
                <div className="flex gap-2 shrink-0">
                  <form action={approve}>
                    <input type="hidden" name="id" value={r.id} />
                    <button className="text-xs bg-teal-700 text-white px-3 py-1.5 rounded-lg hover:bg-teal-800">
                      قبول
                    </button>
                  </form>
                  <form action={reject}>
                    <input type="hidden" name="id" value={r.id} />
                    <input type="hidden" name="note" value="لا يستوفي معايير النشر" />
                    <button className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700">
                      رفض
                    </button>
                  </form>
                </div>
              )}
              {(status === "APPROVED" || status === "UNDER_REVIEW") && (
                <form action={resolve} className="shrink-0">
                  <input type="hidden" name="id" value={r.id} />
                  <button className="text-xs bg-teal-700 text-white px-3 py-1.5 rounded-lg hover:bg-teal-800">
                    تحديد كمحلول
                  </button>
                </form>
              )}
            </div>
          </div>
        ))}
        {requests.length === 0 && (
          <p className="text-neutral-500 text-center py-10">لا توجد عناصر في هذه الفئة.</p>
        )}
      </div>
    </div>
  );
}
