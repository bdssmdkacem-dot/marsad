"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { requirePermission } from "@/lib/permissions";
import { logAction } from "@/lib/audit";
import { RequestStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function moderateRequest(
  requestId: string,
  newStatus: RequestStatus,
  moderationNote?: string
) {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHENTICATED");
  requirePermission(user.role, "request:moderate");

  const before = await prisma.citizenRequest.findUniqueOrThrow({ where: { id: requestId } });

  const after = await prisma.citizenRequest.update({
    where: { id: requestId },
    data: { status: newStatus, moderationNote },
  });

  await logAction({
    actorId: user.id,
    action: "request.moderate",
    entityType: "CitizenRequest",
    entityId: requestId,
    before: { status: before.status },
    after: { status: after.status, moderationNote },
  });

  revalidatePath("/admin/requests");
  revalidatePath("/requests");
}
