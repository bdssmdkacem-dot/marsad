"use client";

import { useActionState } from "react";
import { updatePromiseStatus, type UpdatePromiseState } from "./actions";

const STATUS_OPTIONS = [
  { value: "NOT_STARTED", label: "لم يبدأ" },
  { value: "IN_PROGRESS", label: "قيد الإنجاز" },
  { value: "COMPLETED", label: "منجز" },
  { value: "DELAYED", label: "متأخر" },
  { value: "UNKNOWN", label: "غير معروف" },
];

const initialState: UpdatePromiseState = {};

export default function PromiseStatusForm({
  promiseId,
  currentStatus,
}: {
  promiseId: string;
  currentStatus: string;
}) {
  const [state, formAction, pending] = useActionState(updatePromiseStatus, initialState);

  return (
    <form action={formAction} className="grid md:grid-cols-[160px_1fr_auto] gap-2 items-start">
      <input type="hidden" name="promiseId" value={promiseId} />
      <select
        name="status"
        defaultValue={currentStatus}
        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      <input
        name="sourceUrl"
        type="url"
        required
        placeholder="رابط المصدر (إلزامي) — https://..."
        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
      />
      <button
        type="submit"
        disabled={pending}
        className="text-sm bg-teal-700 text-white px-4 py-2 rounded-lg hover:bg-teal-800 disabled:opacity-50"
      >
        {pending ? "جارٍ الحفظ..." : "تحديث"}
      </button>
      {state.error && (
        <p className="md:col-span-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="md:col-span-3 text-xs text-teal-700">تم تحديث الحالة وتسجيلها في سجل التحديثات.</p>
      )}
    </form>
  );
}
