import { prisma } from "@/lib/prisma";

export default async function SurveysPage() {
  const surveys = await prisma.survey.findMany({
    where: { isActive: true },
    include: { _count: { select: { questions: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="flex-1 px-6 py-10 max-w-3xl mx-auto w-full">
      <h1 className="text-2xl font-bold mb-6">استطلاعات الرأي</h1>

      <ul className="space-y-4">
        {surveys.map((s) => (
          <li key={s.id} className="rounded-lg border border-neutral-200 bg-white p-4">
            <a href={`/surveys/${s.id}`} className="font-medium text-teal-800 hover:underline">
              {s.title}
            </a>
            {s.description && <p className="text-sm text-neutral-600 mt-1">{s.description}</p>}
            <p className="text-xs text-neutral-500 mt-2">{s._count.questions} أسئلة · مشاركة مجهولة الهوية</p>
          </li>
        ))}
        {surveys.length === 0 && (
          <p className="text-neutral-500 text-center py-10">لا توجد استطلاعات نشطة حاليًا.</p>
        )}
      </ul>
    </main>
  );
}
