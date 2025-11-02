/** @jsxImportSource react */
import { useMemo, useState, useEffect } from "react";
import { PlanFormData, TemplateConfig, TemplateKey } from "../../types";
import { AUTO_STATUSES, LOCKED_STATUSES, defaultTemplates } from "../constants";
import { isRequired, validateForm, RequiredField } from "../validation";

type Params = {
  initialData?: Partial<PlanFormData>;
  existingPlanNames?: string[];
  isSaving?: boolean;
  templatesOverride?: Partial<Record<TemplateKey, Partial<TemplateConfig>>>;
};

export function usePlanForm({
  initialData,
  existingPlanNames = [],
  isSaving = false,
  templatesOverride,
}: Params) {
  const [templates, setTemplates] = useState<Record<TemplateKey, TemplateConfig>>(() => {
    const base = { ...defaultTemplates };
    if (templatesOverride) {
      (Object.keys(templatesOverride) as TemplateKey[]).forEach((k) => {
        base[k] = { ...base[k], ...(templatesOverride[k] as Partial<TemplateConfig>) } as TemplateConfig;
      });
    }
    return base;
  });

  const [editingKey, setEditingKey] = useState<TemplateKey | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<PlanFormData>({
    name: "",
    templateKey: null,
    billingType: "subscription",
    status: "draft",
    stripePriceId: "",
    interval: "month",
    price: 0,
    monthlyQuota: 10000,
    trialDays: 0,
    cancelAtPeriodEnd: false,
    initialCredits: 1000,
    quotaUnit: "requests",
    carryOver: false,
    unitPrice: 0.01,
    monthlyCap: 0,
    minimumCharge: 0,
    linkedGroups: [],
    ...(initialData ?? {}),
  });

  useEffect(() => {
    if (initialData) setFormData((prev) => ({ ...prev, ...(initialData ?? {}) }));
  }, [initialData]);

  const locked = useMemo(
    () => AUTO_STATUSES.includes(formData.status) || LOCKED_STATUSES.includes(formData.status),
    [formData.status]
  );

  const req = (f: RequiredField) => isRequired(f, formData.status, formData.billingType);
  const disabled = locked || isSaving;

  const runValidate = () => {
    const e = validateForm(formData, existingPlanNames, req, locked);
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  return {
    templates,
    setTemplates,
    editingKey,
    setEditingKey,
    errors,
    setErrors,
    formData,
    setFormData,
    locked,
    disabled,
    req,
    runValidate,
  };
}
