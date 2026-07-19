"use server";

import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { getAnonRespondentHash } from "@/lib/anonymous-id";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export type SubmitSurveyState = {
  error?: string;
  success?: boolean;
};

export async function submitSurveyResponses(
  surveyId: string,
  _prevState: SubmitSurveyState,
  formData: FormData
): Promise<SubmitSurveyState> {
  const h = await headers();
  const ip = h.get("x-forwarded-for") ?? "anonymous";

  const { success } = rateLimit(`survey:submit:${ip}`, { limit: 10, windowMs: 60_000 });
  if (!success) {
    return { error: "الرجاء المحاولة لاحقًا." };
  }

  const respondentHash = await getAnonRespondentHash();

  const survey = await prisma.survey.findUnique({
    where: { id: surveyId },
    include: { questions: true },
  });
  if (!survey || !survey.isActive) {
    return { error: "هذا الاستطلاع غير متاح حاليًا." };
  }

  const entries = survey.questions
    .map((q) => ({ questionId: q.id, answer: String(formData.get(`q_${q.id}`) ?? "").trim() }))
    .filter((e) => e.answer.length > 0);

  if (entries.length === 0) {
    return { error: "الرجاء الإجابة عن سؤال واحد على الأقل." };
  }

  await prisma.$transaction(
    entries.map((e) =>
      prisma.surveyResponse.upsert({
        where: {
          questionId_respondentHash: { questionId: e.questionId, respondentHash },
        },
        update: { answer: e.answer },
        create: {
          questionId: e.questionId,
          answer: e.answer,
          respondentHash,
        },
      })
    )
  );

  revalidatePath(`/surveys/${surveyId}`);
  return { success: true };
}
