import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import SurveyForm from "./SurveyForm";

export default async function SurveyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const survey = await prisma.survey.findUnique({
    where: { id },
    include: { questions: { orderBy: { order: "asc" } } },
  });

  if (!survey) notFound();

  return (
    <main className="flex-1 px-6 py-10 max-w-2xl mx-auto w-full">
      <h1 className="text-2xl font-bold mb-2">{survey.title}</h1>
      {survey.description && <p className="text-neutral-600 mb-6">{survey.description}</p>}

      {!survey.isActive ? (
        <p className="text-neutral-500">هذا الاستطلاع مغلق حاليًا.</p>
      ) : (
        <SurveyForm
          surveyId={survey.id}
          questions={survey.questions.map((q) => ({
            id: q.id,
            text: q.text,
            options: q.options,
          }))}
        />
      )}
    </main>
  );
}
