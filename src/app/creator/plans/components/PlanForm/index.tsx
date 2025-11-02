//src\app\creator\plans\components\PlanForm\index.tsx
// src/app/creator/plans/components/PlanForm/index.tsx
/** @jsxImportSource react */
"use client";

import { Info } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { PlanFormData, PlanStatus, TemplateKey, TemplateConfig } from "../types";
import { AUTO_STATUSES } from "./constants";
import { usePlanForm } from "./hooks/usePlanForm";
import TemplateEditModal from "./components/TemplateEditModal";
import TemplatePicker from "./components/TemplatePicker";
import BillingSection from "./components/BillingSection";
import GroupsSection from "./components/GroupsSection";
import SummaryCard from "./components/SummaryCard";

export type PlanFormProps = {
  mode: "new" | "edit";
  initialData?: Partial<PlanFormData>;
  currentPlanId?: string;
  availableGroups: any[];
  existingPlanNames?: string[];
  onSubmit: (data: PlanFormData) => Promise<void>;
  onCancel?: () => void;
  isSaving?: boolean;
  templatesOverride?: Partial<Record<TemplateKey, Partial<TemplateConfig>>>;
};

export function PlanForm({
  mode,
  initialData,
  availableGroups,
  existingPlanNames = [],
  onSubmit,
  onCancel,
  isSaving = false,
  templatesOverride,
}: PlanFormProps) {
  const {
    templates, setTemplates,
    editingKey, setEditingKey,
    errors, setErrors,
    formData, setFormData,
    locked, disabled, req, runValidate,
  } = usePlanForm({ initialData, existingPlanNames, isSaving, templatesOverride });

  const setData = (u: Partial<PlanFormData>) => setFormData((p) => ({ ...p, ...u }));

  const handleSubmit = async () => {
    if (!runValidate()) return;
    await onSubmit(formData);
  };

  // a11y用のID
  const planNameId = "planName";
  const statusId = "status";

  return (
    <div className="space-y-10">
      {(AUTO_STATUSES.includes(formData.status) || locked) && (
        <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <Info className="mt-0.5 h-5 w-5 text-blue-600" />
          <div className="text-sm text-blue-900">
            <p className="font-medium">
              {formData.status === "disabled"
                ? "This plan is disabled. All fields are read-only."
                : "This status is auto-managed. Fields are read-only and reflect runtime state."}
            </p>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === "new" ? "Plan settings" : "Edit plan settings"}
          </h2>
          <p className="text-gray-600">Configure billing and allowed endpoint groups.</p>
        </CardHeader>

        <CardContent className="space-y-10">
          {/* Basic */}
          <section className="space-y-4">
            <h3 className="font-semibold text-gray-900">Basic</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="md:col-span-2">
                <label htmlFor={planNameId} className="mb-2 block text-sm font-medium text-gray-700">
                  Plan Name {req("name") && <span className="text-red-600">*</span>}
                </label>
                <input
                  id={planNameId}
                  type="text"
                  disabled={disabled}
                  value={formData.name}
                  onChange={(e) => setData({ name: e.target.value })}
                  placeholder="e.g., Starter, Pro, Enterprise"
                  className={`w-full rounded-lg border px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? "border-red-300" : "border-gray-300"
                  }`}
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor={statusId} className="mb-2 block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  id={statusId}
                  value={formData.status}
                  onChange={(e) => setData({ status: e.target.value as PlanStatus })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                >
                  {[
                    "draft","private","restricted","pending_public","public","live","paused","deprecated","disabled",
                  ].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Templates */}
          <section className="space-y-2">
            <div className="flex items-baseline gap-2">
              <h3 className="font-semibold text-gray-900">Category Template</h3>
              <span className="text-xs text-gray-500">(optional – picks sensible defaults)</span>
              {formData.templateKey && (
                <button
                  type="button"
                  onClick={() => setData({ templateKey: null })}
                  className="ml-auto text-xs underline text-gray-600 hover:text-gray-900"
                >
                  Reset
                </button>
              )}
            </div>

            <TemplatePicker
              templates={templates}
              selectedKey={formData.templateKey as TemplateKey | null}
              onPick={(
                key: TemplateKey,
                apply: (p: PlanFormData) => PlanFormData
              ) => setData({ ...apply(formData), templateKey: key })}
              onEdit={(key: TemplateKey) => setEditingKey(key)}
            />
          </section>

          {/* Billing */}
          <BillingSection
            data={formData}
            setData={setData}
            errors={errors}
            req={req}
            disabled={disabled}
          />

          {/* Groups */}
          <section className="space-y-4">
            <h3 className="font-semibold text-gray-900">
              Endpoint Groups {req("linkedGroups") && <span className="text-red-600">*</span>}
            </h3>
            <GroupsSection
              groups={availableGroups}
              data={formData}
              setData={setData}
              disabled={disabled}
              error={errors.linkedGroups}
            />
          </section>

          {/* Summary */}
          <SummaryCard data={formData} templates={templates} />

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t pt-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
                Cancel
              </Button>
            )}
            <Button type="button" onClick={handleSubmit} disabled={isSaving || availableGroups.length === 0}>
              {isSaving ? (mode === "new" ? "Creating..." : "Saving...") : mode === "new" ? "Create Plan" : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Template editor */}
      {editingKey && (
        <TemplateEditModal
          open={true}
          onClose={() => setEditingKey(null)}
          templateKey={editingKey}
          value={templates[editingKey]}
          onChange={(updated) =>
            setTemplates((prev) => ({ ...prev, [editingKey]: { ...prev[editingKey], ...updated } }))
          }
        />
      )}
    </div>
  );
}
