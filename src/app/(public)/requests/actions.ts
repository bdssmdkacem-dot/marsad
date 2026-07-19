"use server";

import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { RequestCategory } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

async function getClientIp() {
  const h = await headers();
  return h.get("x-forwarded-for") ?? "anonymous";
}

export type CreateRequestState = {
  error?: string;
  success?: boolean;
};

export async function createCitizenRequest(
  _prevState: CreateRequestState,
  formData: FormData
): Promise<CreateRequestState> {
  const ip = await getClientIp();
  const { success } = rateLimit(`request:create:${ip}`, { limit: 5, windowMs: 10 * 60_000 });
  if (!success) {
    return { error: "لقد تجاوزت الحد المسموح من المطالب. حاول مرة أخرى لاحقًا." };
  }

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const category = String(formData.get("category") ?? "");
  const regionId = String(formData.get("regionId") ?? "") || null;
  const latitude = formData.get("latitude") ? Number(formData.get("latitude")) : null;
  const longitude = formData.get("longitude") ? Number(formData.get("longitude")) : null;

  if (!title || title.length < 5) {
    return { error: "الرجاء إدخال عنوان لا يقل عن 5 أحرف." };
  }
  if (!description || description.length < 15) {
    return { error: "الرجاء إدخال وصف لا يقل عن 15 حرفًا." };
  }
  if (!Object.values(RequestCategory).includes(category as RequestCategory)) {
    return { error: "الرجاء اختيار فئة صحيحة." };
  }

  await prisma.citizenRequest.create({
    data: {
      title,
      description,
      category: category as RequestCategory,
      regionId,
      latitude,
      longitude,
      status: "PENDING_REVIEW",
    },
  });

  revalidatePath("/requests");
  return { success: true };
}

export async function supportRequest(requestId: string) {
  const ip = await getClientIp();
  const { success } = rateLimit(`request:support:${ip}`, { limit: 30, windowMs: 60_000 });
  if (!success) return { error: "الرجاء المحاولة لاحقًا." };

  await prisma.citizenRequest.update({
    where: { id: requestId },
    data: { supportCount: { increment: 1 } },
  });

  revalidatePath("/requests");
  return { success: true };
}
