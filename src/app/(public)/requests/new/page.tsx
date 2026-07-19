import { prisma } from "@/lib/prisma";
import NewRequestForm from "./NewRequestForm";

export default async function NewRequestPage() {
  const regions = await prisma.region.findMany({ orderBy: { nameAr: "asc" } });

  return (
    <main className="flex-1 px-6 py-10 max-w-2xl mx-auto w-full">
      <h1 className="text-2xl font-bold mb-2">تقديم مطلب جديد</h1>
      <p className="text-sm text-neutral-500 mb-6">
        سيتم مراجعة مطلبك من طرف فريق الإشراف قبل نشره علنًا.
      </p>
      <NewRequestForm regions={regions.map((r) => ({ id: r.id, nameAr: r.nameAr }))} />
    </main>
  );
}
