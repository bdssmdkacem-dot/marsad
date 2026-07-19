import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { can } from "@/lib/permissions";

export default async function AuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ entityType?: string }>;
}) {
  const currentUser = await getCurrentUser();
  if (!currentUser || !can(currentUser.role, "audit_log:view")) {
    return <p className="text-red-600">لا تملك صلاحية الوصول إلى هذه الصفحة.</p>;
  }

  const params = await searchParams;

  const [logs, entityTypes] = await Promise.all([
    prisma.auditLog.findMany({
      where: { entityType: params.entityType || undefined },
      include: { actor: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.auditLog.findMany({ select: { entityType: true }, distinct: ["entityType"] }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">سجل التدقيق</h1>

      <div className="flex gap-2 mb-6 flex-wrap">
        <a href="/admin/audit-logs" className="text-sm px-3 py-1 rounded-full border border-neutral-300 hover:bg-neutral-100">
          الكل
        </a>
        {entityTypes.map((e) => (
          <a
            key={e.entityType}
            href={`/admin/audit-logs?entityType=${e.entityType}`}
            className="text-sm px-3 py-1 rounded-full border border-neutral-300 hover:bg-neutral-100"
          >
            {e.entityType}
          </a>
        ))}
      </div>

      <div className="space-y-2">
        {logs.map((log) => (
          <div key={log.id} className="rounded-lg border border-neutral-200 bg-white p-3 text-sm">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-medium">{log.action}</span>{" "}
                <span className="text-neutral-500">
                  · {log.entityType}#{log.entityId.slice(0, 8)}
                </span>
              </div>
              <span className="text-xs text-neutral-400">
                {new Intl.DateTimeFormat("ar-MA", { dateStyle: "medium", timeStyle: "short" }).format(
                  log.createdAt
                )}
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              بواسطة: {log.actor.name ?? log.actor.email}
            </p>
            {(log.before || log.after) && (
              <details className="mt-2">
                <summary className="text-xs text-teal-700 cursor-pointer">عرض التفاصيل</summary>
                <pre className="text-xs bg-neutral-50 rounded-lg p-2 mt-1 overflow-x-auto" dir="ltr">
                  {JSON.stringify({ before: log.before, after: log.after }, null, 2)}
                </pre>
              </details>
            )}
          </div>
        ))}
        {logs.length === 0 && (
          <p className="text-neutral-500 text-center py-10">لا توجد سجلات بعد.</p>
        )}
      </div>
    </div>
  );
}
