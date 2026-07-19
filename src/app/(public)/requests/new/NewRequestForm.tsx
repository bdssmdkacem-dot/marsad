"use client";

import { useActionState, useState } from "react";
import { createCitizenRequest, type CreateRequestState } from "../actions";
import LocationPickerLoader from "@/components/modules/LocationPickerLoader";

const CATEGORY_OPTIONS = [
  { value: "EDUCATION", label: "التعليم" },
  { value: "HEALTH", label: "الصحة" },
  { value: "EMPLOYMENT", label: "التشغيل" },
  { value: "TRANSPORT", label: "النقل" },
  { value: "WATER", label: "الماء" },
  { value: "ELECTRICITY", label: "الكهرباء" },
  { value: "ENVIRONMENT", label: "البيئة" },
  { value: "INFRASTRUCTURE", label: "البنية التحتية" },
  { value: "YOUTH", label: "الشباب" },
  { value: "CULTURE", label: "الثقافة" },
  { value: "SPORTS", label: "الرياضة" },
  { value: "ADMINISTRATION", label: "الإدارة" },
];

const initialState: CreateRequestState = {};

export default function NewRequestForm({ regions }: { regions: { id: string; nameAr: string }[] }) {
  const [state, formAction, pending] = useActionState(createCitizenRequest, initialState);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  if (state.success) {
    return (
      <div className="rounded-xl border border-teal-200 bg-teal-50 p-6 text-center">
        <p className="font-medium text-teal-800">تم استلام مطلبك بنجاح.</p>
        <p className="text-sm text-teal-700 mt-1">
          سيظهر مطلبك علنًا بعد مراجعته من طرف فريق الإشراف.
        </p>
        <a href="/requests" className="text-sm text-teal-800 underline mt-3 inline-block">
          العودة إلى قائمة المطالب
        </a>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label className="block text-sm font-medium mb-1">العنوان</label>
        <input
          name="title"
          required
          minLength={5}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          placeholder="مثال: غياب الإنارة العمومية بحي..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">الوصف</label>
        <textarea
          name="description"
          required
          minLength={15}
          rows={5}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          placeholder="صف المشكلة بالتفصيل..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">الفئة</label>
        <select name="category" required className="w-full rounded-lg border border-neutral-300 px-3 py-2">
          <option value="">اختر فئة</option>
          {CATEGORY_OPTIONS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">الجهة</label>
        <select name="regionId" className="w-full rounded-lg border border-neutral-300 px-3 py-2">
          <option value="">غير محدد</option>
          {regions.map((r) => (
            <option key={r.id} value={r.id}>
              {r.nameAr}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">الموقع الجغرافي (اختياري)</label>
        <LocationPickerLoader onChange={(lat, lng) => setCoords({ lat, lng })} />
        <input type="hidden" name="latitude" value={coords?.lat ?? ""} />
        <input type="hidden" name="longitude" value={coords?.lng ?? ""} />
      </div>

      {state.error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-teal-700 text-white rounded-lg px-4 py-2.5 hover:bg-teal-800 disabled:opacity-50"
      >
        {pending ? "جارٍ الإرسال..." : "إرسال المطلب"}
      </button>
    </form>
  );
}
