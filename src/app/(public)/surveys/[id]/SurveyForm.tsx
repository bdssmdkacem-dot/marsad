"use client";

import { useActionState } from "react";
import { submitSurveyResponses, type SubmitSurveyState } from "./actions";

type Question = { id: string; text: string; options: string[] };

const initialState: SubmitSurveyState = {};

export default function SurveyForm({
  surveyId,
  questions,
}: {
  surveyId: string;
  questions: Question[];
}) {
  const action = submitSurveyResponses.bind(null, surveyId);
  const [state, formAction, pending] = useActionState(action, initialState);

  if (state.success) {
    return (
      <div className="rounded-xl border border-teal-200 bg-teal-50 p-6 text-center">
        <p className="font-medium text-teal-800">شكرًا لمشاركتك!</p>
        <p className="text-sm text-teal-700 mt-1">تم تسجيل إجاباتك بشكل مجهول الهوية.</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      {questions.map((q) => (
        <div key={q.id}>
          <label className="block text-sm font-medium mb-2">{q.text}</label>
          {q.options.length > 0 ? (
            <div className="space-y-2">
              {q.options.map((opt) => (
                <label key={opt} className="flex items-center gap-2 text-sm">
                  <input type="radio" name={`q_${q.id}`} value={opt} />
                  {opt}
                </label>
              ))}
            </div>
          ) : (
            <textarea
              name={`q_${q.id}`}
              rows={3}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2"
              placeholder="إجابتك..."
            />
          )}
        </div>
      ))}

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
        {pending ? "جارٍ الإرسال..." : "إرسال الإجابات"}
      </button>
    </form>
  );
}
