/* cspell:disable */
//src\app\creator\plans\components\PlanForm.tsx
/** @jsxImportSource react */
"use client";

import { useMemo, useState, useEffect } from "react";
import { ProductSelector } from "./sections/ProductSelector";
import {
  CreditCard,
  Zap,
  Shield,
  CheckCircle,
  AlertTriangle,
  Info,
} from "lucide-react";

import { Card, CardContent, CardHeader } from "@/app/components/ui/Card";
import Badge from "@/app/components/ui/Badge";
import { Button } from "@/app/components/ui/Button";

import {
  PlanFormData,
  PlanStatus,
  TemplateKey,
  TemplateConfig,
  EndpointGroupLite,
} from "./types";

import {
  iconMap,
  defaultTemplates,
  AUTO_STATUSES,
  LOCKED_STATUSES,
  EDITABLE_STATUSES,
  isRequired,
} from "./PlanTemplateConfig";

import { TemplateEditModal } from "./PlanTemplateEditModal";
import { BasicSection } from "./sections/BasicSection";
import { BillingSection } from "./sections/BillingSection";
import { GroupSection } from "./sections/GroupSection";
import { TemplateSection } from "./sections/TemplateSection";
import { SummarySection } from "./sections/SummarySection";

export type PlanFormProps = {
  mode: "new" | "edit";
  initialData?: Partial<PlanFormData>;
  currentPlanId?: string;
  availableGroups: EndpointGroupLite[];
  availableProducts?: { id: string; name: string }[];
  existingPlanNames?: string[];
  onSubmit: (data: PlanFormData) => Promise<void>;
  onCancel?: () => void;
  isSaving?: boolean;
  templatesOverride?: Partial<Record<TemplateKey, Partial<TemplateConfig>>>;
};

export function PlanForm({
  mode,
  initialData,
  currentPlanId,
  availableGroups,
  availableProducts = [],
  existingPlanNames = [],
  onSubmit,
  onCancel,
  isSaving = false,
  templatesOverride,
}: PlanFormProps) {
  const [templates, setTemplates] = useState<Record<TemplateKey, TemplateConfig>>(
    () => {
      const base = { ...defaultTemplates };
      if (templatesOverride) {
        (Object.keys(templatesOverride) as TemplateKey[]).forEach((k) => {
          base[k] = {
            ...base[k],
            ...(templatesOverride[k] as Partial<TemplateConfig>),
          } as TemplateConfig;
        });
      }
      return base;
    }
  );

  const [editingKey, setEditingKey] = useState<TemplateKey | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 🔵 修正①：productId の初期値を formData に必ず作る（ここが超重要）
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

    // ★ これがあることで、controlled component が安定する
    productId: initialData?.productId ?? "",

    ...(initialData ?? {}),
  });

  // 🔵 修正②：再読み込み時も productId を維持
  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
        productId: initialData.productId ?? prev.productId ?? "",
      }));
    }
  }, [initialData]);

  const allLocked = useMemo(
    () =>
      AUTO_STATUSES.includes(formData.status) ||
      LOCKED_STATUSES.includes(formData.status),
    [formData.status]
  );

  const req = (field: Parameters<typeof isRequired>[0]) =>
    isRequired(field, formData.status, formData.billingType);

  const dis = allLocked || isSaving;

  const validateAll = () => {
    const e: Record<string, string> = {};

    if (!formData.name.trim()) e.name = "Plan name is required";
    const dup = existingPlanNames
      .filter(Boolean)
      .some((n) => n.toLowerCase() === formData.name.trim().toLowerCase());
    if (dup) e.name = "Plan name must be unique";

    if (allLocked) {
      setErrors(e);
      return Object.keys(e).length === 0;
    }

    const need = (field: Parameters<typeof isRequired>[0]) =>
      isRequired(field, formData.status, formData.billingType);

    if (formData.billingType === "subscription") {
      if (need("stripePriceId") && !formData.stripePriceId.trim()) {
        e.stripePriceId = "Stripe Price ID is required";
      }
      if (need("interval") && !formData.interval) {
        e.interval = "Interval is required";
      }
    }

    if (need("linkedGroups") && formData.linkedGroups.length === 0) {
      e.linkedGroups = "At least one group must be linked";
    }

    // 🔵 product 必須ならここに追加可能
    // if (!formData.productId) e.productId = "Product is required";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateAll()) return;
    await onSubmit(formData);
  };

  const statusIsEditableNow = EDITABLE_STATUSES.includes(formData.status);

  return (
    <div className="space-y-10">
      {(AUTO_STATUSES.includes(formData.status) ||
        LOCKED_STATUSES.includes(formData.status)) && (
        <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <Info className="mt-0.5 h-5 w-5 text-blue-600" />
          <div className="text-sm text-blue-900">
            <p className="font-medium">
              {formData.status === "disabled"
                ? "This plan is disabled. All fields are read-only."
                : "This status is system-managed. Fields cannot be edited."}
            </p>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === "new" ? "Plan settings" : "Edit plan settings"}
          </h2>
          <p className="text-gray-600">
            Configure billing and allowed endpoint groups.
          </p>
        </CardHeader>

        <CardContent className="space-y-10">
          {/* Product Selector */}
          <ProductSelector
            products={availableProducts}
            value={formData.productId}
            onChange={(id) => setFormData((p) => ({ ...p, productId: id }))}
            disabled={isSaving}
            error={errors.productId}
          />

          {/* Basics */}
          <BasicSection
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            dis={dis}
            req={req}
            statusIsEditableNow={statusIsEditableNow}
            EDITABLE_STATUSES={EDITABLE_STATUSES}
            isSaving={isSaving}
          />

          {/* Template */}
          <TemplateSection
            formData={formData}
            setFormData={setFormData}
            setEditingKey={setEditingKey}
          />

          {/* Billing */}
          <BillingSection
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            dis={dis}
            req={req}
          />

          {/* Groups */}
          <GroupSection
            formData={formData}
            setFormData={setFormData}
            availableGroups={availableGroups}
            errors={errors}
            dis={dis}
            req={req}
          />

          {/* Summary */}
          <SummarySection formData={formData} templates={templates} />

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t pt-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSaving}
              >
                Cancel
              </Button>
            )}
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSaving || availableGroups.length === 0}
            >
              {isSaving
                ? mode === "new"
                  ? "Creating..."
                  : "Saving..."
                : mode === "new"
                ? "Create Plan"
                : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {editingKey && (
        <TemplateEditModal
          open={true}
          onClose={() => setEditingKey(null)}
          templateKey={editingKey}
          value={templates[editingKey]}
          onChange={(updated) =>
            setTemplates((prev) => ({
              ...prev,
              [editingKey]: { ...prev[editingKey], ...updated },
            }))
          }
        />
      )}
    </div>
  );
}
