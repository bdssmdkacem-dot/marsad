import { prisma } from "@/lib/prisma";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const params = await searchParams;

  const reports = await prisma.report.findMany({
    where: {
      category: params.category || undefined,
      title: params.q ? { contains: params.q, mode: "insensitive" } : undefined,
    },
    include: { files: true, publishedBy: { select: { name: true } } },
    orderBy: { publishedAt: "desc" },
    take: 50,
  });

  const categories = await prisma.report.findMany({
    select: { category: true },
    distinct: ["category"],
  });

  return (
    <main className="flex-1 px-6 py-10 max-w-4xl mx-auto w-full">
      <h1 className="text-2xl font-bold mb-6">مركز التقارير</h1>

      <form className="flex gap-2 mb-6" method="get">
        <input
          type="text"
          name="q"
          defaultValue={params.q}
          placeholder="ابحث في التقارير..."
          className="flex-1 rounded-lg border border-neutral-300 px-3 py-2"
        />
        <select
          name="category"
          defaultValue={params.category ?? ""}
          className="rounded-lg border border-neutral-300 px-3 py-2"
        >
          <option value="">كل الفئات</option>
          {categories.map((c) => (
            <option key={c.category} value={c.category}>
              {c.category}
            </option>
          ))}
        </select>
        <button type="submit" className="bg-teal-700 text-white rounded-lg px-4 py-2 hover:bg-teal-800">
          بحث
        </button>
      </form>

      <ul className="space-y-4">
        {reports.map((r) => (
          <li key={r.id} className="rounded-lg border border-neutral-200 bg-white p-4">
            <p className="font-medium">{r.title}</p>
            <p className="text-sm text-neutral-600 mt-1">{r.summary}</p>
            <p className="text-xs text-neutral-500 mt-2">
              {r.category} · {r.publishedBy.name} ·{" "}
              {new Intl.DateTimeFormat("ar-MA", { dateStyle: "medium" }).format(r.publishedAt)}
            </p>
            <div className="flex gap-3 mt-2">
              {r.files.map((f) => (
                <a
                  key={f.id}
                  href={f.url}
                  target="_blank"
                  className="text-xs text-teal-700 underline uppercase"
                >
                  تحميل {f.fileType}
                </a>
              ))}
            </div>
          </li>
        ))}
        {reports.length === 0 && (
          <p className="text-neutral-500 text-center py-10">لا توجد تقارير منشورة بعد.</p>
        )}
      </ul>
    </main>
  );
}
