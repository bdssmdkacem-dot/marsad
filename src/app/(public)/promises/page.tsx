import { prisma } from "@/lib/prisma";

const STATUS_LABELS: Record<string, string> = {
  NOT_STARTED: "لم يبدأ",
  IN_PROGRESS: "قيد الإنجاز",
  COMPLETED: "منجز",
  DELAYED: "متأخر",
  UNKNOWN: "غير معروف",
};

export default async function PromisesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; partyId?: string }>;
}) {
  const params = await searchParams;

  const promises = await prisma.promise.findMany({
    where: {
      status: params.status ? (params.status as never) : undefined,
      partyId: params.partyId || undefined,
    },
    include: { party: true, region: true },
    orderBy: { lastUpdate: "desc" },
    take: 50,
  });

  return (
    <main className="flex-1 px-6 py-10 max-w-5xl mx-auto w-full">
      <h1 className="text-2xl font-bold mb-6">مرصد الوعود الانتخابية</h1>

      <div className="flex gap-2 mb-6 flex-wrap">
        {Object.entries(STATUS_LABELS).map(([key, label]) => (
          <a
            key={key}
            href={`/promises?status=${key}`}
            className="text-sm px-3 py-1 rounded-full border border-neutral-300 hover:bg-neutral-100"
          >
            {label}
          </a>
        ))}
      </div>

      <ul className="space-y-4">
        {promises.map((p) => (
          <li key={p.id} className="rounded-lg border border-neutral-200 bg-white p-4">
            <div className="flex justify-between items-start gap-4">
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
            <a href={p.sourceUrl} target="_blank" className="text-xs text-teal-700 underline mt-2 inline-block">
              المصدر
            </a>
          </li>
        ))}
        {promises.length === 0 && (
          <p className="text-neutral-500 text-center py-10">لا توجد بيانات بعد.</p>
        )}
      </ul>
    </main>
  );
}
