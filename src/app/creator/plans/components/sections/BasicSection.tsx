// src/app/creator/plans/components/sections/BasicSection.tsx
"use client";

import { PlanStatus } from "../types";
import { isRequired } from "../PlanTemplateConfig"; // ← 🔵 これが必要！

type Props = {
  formData: {
    name: string;
    status: PlanStatus;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  errors: Record<string, string>;
  dis: boolean;

  // 🔵 修正：isRequired と同じ型を使う
  req: (field: Parameters<typeof isRequired>[0]) => boolean;

  statusIsEditableNow: boolean;
  EDITABLE_STATUSES: PlanStatus[];
  isSaving: boolean;
};


export function BasicSection({
  formData,
  setFormData,
  errors,
  dis,
  req,
  statusIsEditableNow,
  EDITABLE_STATUSES,
  isSaving,
}: Props) {
  return (
    <section className="space-y-4">
      <h3 className="font-semibold text-gray-900">Basic</h3>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* --------------- Plan Name ---------------- */}
        <div className="md:col-span-2">
          <label
            htmlFor="planName"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Plan Name {req("name") && <span className="text-red-600">*</span>}
          </label>

          <input
            id="planName"
            type="text"
            disabled={dis}
            value={formData.name}
            onChange={(e) =>
              setFormData((p: any) => ({ ...p, name: e.target.value }))
            }
            placeholder="e.g., Starter, Pro, Enterprise"
            className={`w-full rounded-lg border px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
              errors.name ? "border-red-300" : "border-gray-300"
            }`}
            aria-describedby={errors.name ? "planNameError" : undefined}
          />

          {errors.name && (
            <p id="planNameError" className="mt-1 text-sm text-red-600">
              {errors.name}
            </p>
          )}
        </div>

        {/* ---------------- Status ---------------- */}
        <div>
          <label
            htmlFor="status"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Status
          </label>

          {statusIsEditableNow ? (
            <select
              id="status"
              value={formData.status}
              onChange={(e) =>
                setFormData((p: any) => ({
                  ...p,
                  status: e.target.value as PlanStatus,
                }))
              }
              disabled={isSaving}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            >
              {EDITABLE_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          ) : (
            <div
              aria-disabled="true"
              aria-label="Status is system-managed and cannot be changed"
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-700"
            >
              {formData.status}
            </div>
          )}

          {!statusIsEditableNow && (
            <input type="hidden" value={formData.status} aria-hidden />
          )}
        </div>
      </div>
    </section>
  );
}
