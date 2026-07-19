import { prisma } from "@/lib/prisma";
import MapLoader from "@/components/modules/MapLoader";
import type { MapMarker } from "@/components/modules/ProjectsMap";

function formatMAD(amount: number) {
  return new Intl.NumberFormat("ar-MA", { style: "currency", currency: "MAD", maximumFractionDigits: 0 }).format(
    amount
  );
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ region?: string }>;
}) {
  const params = await searchParams;

  const [projects, regions] = await Promise.all([
    prisma.project.findMany({
      where: { region: params.region ? { slug: params.region } : undefined },
      include: { region: true, municipality: true },
      orderBy: { updatedAt: "desc" },
      take: 100,
    }),
    prisma.region.findMany({ orderBy: { nameAr: "asc" } }),
  ]);

  const markers: MapMarker[] = projects
    .filter((p) => p.latitude != null && p.longitude != null)
    .map((p) => ({
      id: p.id,
      latitude: p.latitude as number,
      longitude: p.longitude as number,
      title: p.name,
      subtitle: `${p.region.nameAr} · ${p.progressPercent}% · ${formatMAD(Number(p.budget))}`,
    }));

  return (
    <main className="flex-1 px-6 py-10 max-w-6xl mx-auto w-full">
      <h1 className="text-2xl font-bold mb-6">مرصد المشاريع العمومية</h1>

      <div className="flex gap-2 mb-6 flex-wrap">
        <a
          href="/projects"
          className="text-sm px-3 py-1 rounded-full border border-neutral-300 hover:bg-neutral-100"
        >
          كل الجهات
        </a>
        {regions.map((r) => (
          <a
            key={r.id}
            href={`/projects?region=${r.slug}`}
            className="text-sm px-3 py-1 rounded-full border border-neutral-300 hover:bg-neutral-100"
          >
            {r.nameAr}
          </a>
        ))}
      </div>

      <MapLoader markers={markers} />

      <ul className="space-y-4 mt-8">
        {projects.map((p) => (
          <li key={p.id} className="rounded-lg border border-neutral-200 bg-white p-4">
            <div className="flex justify-between items-start gap-4">
              <div>
                <p className="font-medium">{p.name}</p>
                <p className="text-sm text-neutral-500 mt-1">
                  {p.region.nameAr}
                  {p.municipality ? ` · ${p.municipality.nameAr}` : ""} · الميزانية:{" "}
                  {formatMAD(Number(p.budget))}
                </p>
              </div>
              <div className="text-left shrink-0">
                <div className="w-28 h-2 rounded-full bg-neutral-200 overflow-hidden">
                  <div
                    className="h-full bg-teal-600"
                    style={{ width: `${Math.min(100, p.progressPercent)}%` }}
                  />
                </div>
                <span className="text-xs text-neutral-500">{p.progressPercent}% منجز</span>
              </div>
            </div>
            <a href={p.sourceUrl} target="_blank" className="text-xs text-teal-700 underline mt-2 inline-block">
              المصدر
            </a>
          </li>
        ))}
        {projects.length === 0 && (
          <p className="text-neutral-500 text-center py-10">لا توجد مشاريع مسجلة بعد.</p>
        )}
      </ul>
    </main>
  );
}
