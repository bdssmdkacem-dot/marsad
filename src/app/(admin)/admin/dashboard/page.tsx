import { prisma } from "@/lib/prisma";
import { StatusBarChart } from "@/components/modules/AdminCharts";

const PROMISE_STATUS_LABELS: Record<string, string> = {
  NOT_STARTED: "لم يبدأ",
  IN_PROGRESS: "قيد الإنجاز",
  COMPLETED: "منجز",
  DELAYED: "متأخر",
  UNKNOWN: "غير معروف",
};

const REQUEST_STATUS_LABELS: Record<string, string> = {
  PENDING_REVIEW: "قيد المراجعة",
  APPROVED: "مقبول",
  UNDER_REVIEW: "قيد الدراسة",
  RESOLVED: "تم الحل",
  REJECTED: "مرفوض",
  MERGED: "مدمج",
};

export default async function AdminDashboardPage() {
  const [
    promiseCounts,
    requestCounts,
    totalProjects,
    totalReports,
    totalSurveys,
    pendingRequests,
  ] = await Promise.all([
    prisma.promise.groupBy({ by: ["status"], _count: true }),
    prisma.citizenRequest.groupBy({ by: ["status"], _count: true }),
    prisma.project.count(),
    prisma.report.count(),
    prisma.survey.count({ where: { isActive: true } }),
    prisma.citizenRequest.count({ where: { status: "PENDING_REVIEW" } }),
  ]);

  const promiseChartData = promiseCounts.map((p) => ({
    name: PROMISE_STATUS_LABELS[p.status],
    value: p._count,
  }));
  const requestChartData = requestCounts.map((r) => ({
    name: REQUEST_STATUS_LABELS[r.status],
    value: r._count,
  }));

  const cards = [
    { label: "مشاريع عمومية", value: totalProjects },
    { label: "تقارير منشورة", value: totalReports },
    { label: "استطلاعات نشطة", value: totalSurveys },
    { label: "مطالب بانتظار المراجعة", value: pendingRequests, highlight: pendingRequests > 0 },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">لوحة القيادة</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <div
            key={c.label}
            className={`rounded-xl border p-5 bg-white shadow-sm ${
              c.highlight ? "border-amber-300 bg-amber-50" : "border-neutral-200"
            }`}
          >
            <div className="text-2xl font-bold text-teal-700">{c.value}</div>
            <div className="text-sm text-neutral-500 mt-1">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <h2 className="font-medium mb-3">توزيع حالة الوعود</h2>
          <StatusBarChart data={promiseChartData} />
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <h2 className="font-medium mb-3">توزيع حالة مطالب المواطنين</h2>
          <StatusBarChart data={requestChartData} />
        </div>
      </div>
    </div>
  );
}
