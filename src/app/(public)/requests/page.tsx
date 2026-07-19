import { prisma } from "@/lib/prisma";
import { supportRequest } from "./actions";
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

const STATUS_LABELS: Record<string, string> = {
  APPROVED: "مقبول",
  UNDER_REVIEW: "قيد الدراسة",
  RESOLVED: "تم الحل",
};

export default async function RequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;

  const requests = await prisma.citizenRequest.findMany({
    where: {
      // Only publicly-moderated statuses are shown; PENDING_REVIEW/REJECTED/MERGED stay internal.
      status: { in: ["APPROVED", "UNDER_REVIEW", "RESOLVED"] },
      category: params.category ? (params.category as never) : undefined,
    },
    include: { region: true },
    orderBy: { supportCount: "desc" },
    take: 50,
  });

  async function handleSupport(formData: FormData) {
    "use server";
    const id = String(formData.get("id"));
    await supportRequest(id);
    revalidatePath("/requests");
  }

  return (
    <main className="flex-1 px-6 py-10 max-w-4xl mx-auto w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">مطالب المواطنين</h1>
        <a
          href="/requests/new"
          className="text-sm bg-teal-700 text-white px-4 py-2 rounded-lg hover:bg-teal-800"
        >
          + تقديم مطلب جديد
        </a>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        <a href="/requests" className="text-sm px-3 py-1 rounded-full border border-neutral-300 hover:bg-neutral-100">
          كل الفئات
        </a>
        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
          <a
            key={key}
            href={`/requests?category=${key}`}
            className="text-sm px-3 py-1 rounded-full border border-neutral-300 hover:bg-neutral-100"
          >
            {label}
          </a>
        ))}
      </div>

      <ul className="space-y-4">
        {requests.map((r) => (
          <li key={r.id} className="rounded-lg border border-neutral-200 bg-white p-4">
            <div className="flex justify-between items-start gap-4">
              <div>
                <p className="font-medium">{r.title}</p>
                <p className="text-sm text-neutral-600 mt-1">{r.description}</p>
                <p className="text-xs text-neutral-500 mt-2">
                  {CATEGORY_LABELS[r.category]} · {r.region?.nameAr ?? "غير محدد"} ·{" "}
                  <span className="text-teal-700">{STATUS_LABELS[r.status]}</span>
                </p>
              </div>
              <form action={handleSupport}>
                <input type="hidden" name="id" value={r.id} />
                <button
                  type="submit"
                  className="flex flex-col items-center px-3 py-2 rounded-lg border border-neutral-300 hover:bg-neutral-100 shrink-0"
                >
                  <span className="text-sm font-bold">{r.supportCount}</span>
                  <span className="text-[10px] text-neutral-500">أؤيد</span>
                </button>
              </form>
            </div>
          </li>
        ))}
        {requests.length === 0 && (
          <p className="text-neutral-500 text-center py-10">لا توجد مطالب منشورة بعد.</p>
        )}
      </ul>
    </main>
  );
}
