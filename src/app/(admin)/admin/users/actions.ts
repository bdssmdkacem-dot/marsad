"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { requirePermission } from "@/lib/permissions";
import { logAction } from "@/lib/audit";
import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function updateUserRole(userId: string, newRole: Role) {
  const actor = await getCurrentUser();
  if (!actor) throw new Error("UNAUTHENTICATED");
  requirePermission(actor.role, "user:manage");

  if (actor.id === userId) {
    throw new Error("لا يمكنك تغيير صلاحياتك الخاصة.");
  }

  const before = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const after = await prisma.user.update({ where: { id: userId }, data: { role: newRole } });

  await logAction({
    actorId: actor.id,
    action: "user.role_change",
    entityType: "User",
    entityId: userId,
    before: { role: before.role },
    after: { role: after.role },
  });

  revalidatePath("/admin/users");
}
