"use client";

import { useActionState } from "react";
import { adminLogin, type LoginState } from "./actions";

const initialState: LoginState = {};

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(adminLogin, initialState);

  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-100 px-4">
      <form
        action={formAction}
        className="w-full max-w-sm bg-white rounded-xl border border-neutral-200 p-6 shadow-sm space-y-4"
      >
        <div className="text-center mb-2">
          <h1 className="font-bold text-lg">لوحة إدارة مرصد المواطن</h1>
          <p className="text-xs text-neutral-500 mt-1">للمشرفين والمسؤولين فقط</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">البريد الإلكتروني</label>
          <input
            type="email"
            name="email"
            required
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">كلمة المرور</label>
          <input
            type="password"
            name="password"
            required
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
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
          {pending ? "جارٍ الدخول..." : "تسجيل الدخول"}
        </button>
      </form>
    </main>
  );
}
