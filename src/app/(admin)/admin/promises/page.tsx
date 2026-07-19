import { prisma } from "@/lib/prisma";
import PromiseStatusForm from "./PromiseStatusForm";

const STATUS_LABELS: Record<string, string> = {
  NOT_STARTED: "لم يبدأ",
  IN_PROGRESS: "قيد الإنجاز",
  COMPLETED: "منجز",
  DELAYED: "متأخر",
  UNKNOWN: "غير معروف",
};

export default async function AdminPromisesPage() {
  const promises = await prisma.promise.findMany({
    include: { party: true, region: true, updates: { orderBy: { createdAt: "desc" }, take: 1 } },
    orderBy: { lastUpdate: "desc" },
    take: 100,
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">الوعود الانتخابية — الإشراف</h1>
      <p className="text-sm text-neutral-500 mb-6">
        لا يمكن تغيير حالة أي وعد دون إرفاق رابط مصدر — يُحفظ كل تغيير في سجل التحديثات وسجل التدقيق.
      </p>

      <div className="space-y-4">
        {promises.map((p) => (
          <div key={p.id} className="rounded-lg border border-neutral-200 bg-white p-4">
            <div className="flex justify-between items-start gap-4 mb-3">
              <div>
                <p className="font-medium">{p.description}</p>
                <p className="text-sm text-neutral-500 mt-1">
                  {p.party.nameAr} · {p.region?.nameAr ?? "وطني"} · {p.category}
                </p>
              </div>
              <span className="text-xs whitespace-nowrap rounded-full bg-teal-50 text-teal-700 px-3 py-1">
                {STATUS_LABELS[p.status]}
              </span>
            </div>
            <PromiseStatusForm promiseId={p.id} currentStatus={p.status} />
          </div>
        ))}
        {promises.length === 0 && (
          <p className="text-neutral-500 text-center py-10">لا توجد وعود مسجلة بعد.</p>
        )}
      </div>
    </div>
  );
}
