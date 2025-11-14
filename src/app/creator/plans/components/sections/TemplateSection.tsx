// src/app/creator/plans/components/sections/TemplateSection.tsx
"use client";

import { TemplateKey, PlanFormData } from "../types";
import { iconMap, defaultTemplates } from "../PlanTemplateConfig";

type Props = {
  formData: PlanFormData;
  setFormData: React.Dispatch<React.SetStateAction<PlanFormData>>;

  // for modal: "Edit" button → open modal with key
  setEditingKey: (key: TemplateKey | null) => void;
};

export function TemplateSection({
  formData,
  setFormData,
  setEditingKey,
}: Props) {
  return (
    <section className="space-y-2">
      <div className="flex items-baseline gap-2">
        <h3 className="font-semibold text-gray-900">Category Template</h3>
        <span className="text-xs text-gray-500">
          (optional – picks sensible defaults)
        </span>

        {formData.templateKey && (
          <button
            type="button"
            onClick={() =>
              setFormData((p) => ({ ...p, templateKey: null }))
            }
            className="ml-auto text-xs text-gray-600 underline hover:text-gray-900"
          >
            Reset
          </button>
        )}
      </div>

      <div
        role="radiogroup"
        aria-label="Category Template"
        className="grid grid-cols-1 gap-4 md:grid-cols-3"
      >
        {(Object.keys(defaultTemplates) as TemplateKey[]).map((key) => {
          const cfg = defaultTemplates[key];
          const Icon = iconMap[cfg.iconKey];
          const selected = formData.templateKey === key;

          return (
            <div
              key={key}
              className={`relative overflow-hidden rounded-xl border-2 transition-all ${
                selected
                  ? "border-blue-500"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              style={{ backgroundColor: cfg.bgColor }}
            >
              {/* background overlay */}
              {cfg.bgImage && (
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-15"
                  style={{
                    backgroundImage: `url(${cfg.bgImage})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
              )}

              {/* Edit button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingKey(key);
                }}
                className="absolute right-3 top-3 z-10 inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white/80 px-2 py-1 text-xs text-gray-700 backdrop-blur hover:bg-white"
              >
                Edit
              </button>

              {/* Select template card */}
              <label
                htmlFor={`tpl-${key}`}
                className="relative block cursor-pointer p-6"
                onClick={() =>
                  setFormData((prev) => {
                    const applied = cfg.apply(prev);
                    return { ...applied, templateKey: key };
                  })
                }
              >
                <input
                  id={`tpl-${key}`}
                  type="radio"
                  name="template"
                  className="sr-only"
                  readOnly
                  checked={selected}
                />

                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-white/60">
                  <Icon className="h-6 w-6 text-gray-700" />
                </div>

                <div className="font-semibold text-gray-900">
                  {cfg.label}
                </div>
                <div className="text-sm text-gray-700">{cfg.description}</div>
              </label>
            </div>
          );
        })}
      </div>
    </section>
  );
}
