"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { requirePermission } from "@/lib/permissions";
import { logAction } from "@/lib/audit";
import { PromiseStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export type UpdatePromiseState = { error?: string; success?: boolean };

export async function updatePromiseStatus(
  _prevState: UpdatePromiseState,
  formData: FormData
): Promise<UpdatePromiseState> {
  const user = await getCurrentUser();
  if (!user) return { error: "الرجاء تسجيل الدخول." };

  try {
    requirePermission(user.role, "promise:edit_status");
  } catch {
    return { error: "لا تملك صلاحية تعديل حالة الوعود." };
  }

  const promiseId = String(formData.get("promiseId"));
  const newStatus = String(formData.get("status")) as PromiseStatus;
  const sourceUrl = String(formData.get("sourceUrl") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();

  if (!sourceUrl || !sourceUrl.startsWith("http")) {
    return { error: "يجب إدخال رابط مصدر صالح لأي تغيير في الحالة." };
  }

  const promise = await prisma.promise.findUniqueOrThrow({ where: { id: promiseId } });

  // Evidence-first integrity: the status field and its audit-trail update
  // row are written atomically — a status can never change without a
  // sourced PromiseUpdate record.
  await prisma.$transaction([
    prisma.promise.update({
      where: { id: promiseId },
      data: { status: newStatus, lastUpdate: new Date() },
    }),
    prisma.promiseUpdate.create({
      data: {
        promiseId,
        previousStatus: promise.status,
        newStatus,
        sourceUrl,
        note: note || undefined,
        updatedById: user.id,
      },
    }),
  ]);

  await logAction({
    actorId: user.id,
    action: "promise.status_change",
    entityType: "Promise",
    entityId: promiseId,
    before: { status: promise.status },
    after: { status: newStatus, sourceUrl },
  });

  revalidatePath("/admin/promises");
  revalidatePath("/promises");
  return { success: true };
}
