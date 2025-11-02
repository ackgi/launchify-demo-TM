// src/app/creator/plans/components/PlanForm.tsx
/* cspell:disable */


/** @jsxImportSource react */
"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import {
  CreditCard, Zap, Shield, CheckCircle, AlertTriangle, Info,
  Image as ImageIcon, X, Palette, Edit3,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/app/components/ui/Card";
import Badge from "@/app/components/ui/Badge";
import { Button } from "@/app/components/ui/Button";

import {
  PlanFormData, PlanStatus, TemplateKey, TemplateConfig, IconKey, EndpointGroupLite,
} from "./types";

/* ================================
  テンプレ定義（必要なら外部から上書き可）
================================ */
const iconMap = { zap: Zap, "credit-card": CreditCard, shield: Shield } as const;

export const defaultTemplates: Record<TemplateKey, TemplateConfig> = {
  free: {
    label: "Free",
    description: "Free tier with basic features",
    iconKey: "zap",
    bgColor: "#eff6ff",
    bgImage: null,
    apply: (p) => ({
      ...p,
      name: p.name || "Free Plan",
      billingType: "subscription",
      interval: "month",
      price: 0,
      monthlyQuota: 1000,
      trialDays: 0,
      cancelAtPeriodEnd: true,
      initialCredits: 0,
      quotaUnit: "requests",
      carryOver: false,
      unitPrice: 0,
      monthlyCap: 0,
      minimumCharge: 0,
    }),
  },
  pro: {
    label: "Pro",
    description: "Professional tier for growing businesses",
    iconKey: "credit-card",
    bgColor: "#f8fafc",
    bgImage: null,
    apply: (p) => ({
      ...p,
      name: p.name || "Pro Plan",
      billingType: "subscription",
      interval: "month",
      price: 9.99,
      monthlyQuota: 10000,
      trialDays: 0,
      cancelAtPeriodEnd: true,
      initialCredits: 0,
      quotaUnit: "requests",
      carryOver: false,
      unitPrice: 0,
      monthlyCap: 0,
      minimumCharge: 0,
    }),
  },
  enterprise: {
    label: "Enterprise",
    description: "Enterprise tier with advanced features",
    iconKey: "shield",
    bgColor: "#f5f3ff",
    bgImage: null,
    apply: (p) => ({
      ...p,
      name: p.name || "Enterprise Plan",
      billingType: "subscription",
      interval: "year",
      price: 0,
      monthlyQuota: 0,
      trialDays: 0,
      cancelAtPeriodEnd: true,
      initialCredits: 0,
      quotaUnit: "requests",
      carryOver: false,
      unitPrice: 0,
      monthlyCap: 0,
      minimumCharge: 0,
    }),
  },
};

/** 🔧 自動管理とロックの定義を要件に合わせて修正
 * - AUTO_STATUSES: public / live（← paused は手動操作のため除外）
 * - LOCKED_STATUSES: disabled
 */
const AUTO_STATUSES: PlanStatus[] = ["public", "live"];
const LOCKED_STATUSES: PlanStatus[] = ["disabled"];

/** UIでユーザーが選べるのは下記4つのみ */
const EDITABLE_STATUSES: PlanStatus[] = [
  "draft",
  "private",
  "restricted",
  "pending_public",
];

function isRequired(
  field:
    | "name"
    | "billingType"
    | "stripePriceId"
    | "interval"
    | "price"
    | "initialCredits"
    | "quotaUnit"
    | "unitPrice"
    | "linkedGroups",
  status: PlanStatus,
  billingType: PlanFormData["billingType"]
): boolean {
  if (field === "name") return true;
  if (AUTO_STATUSES.includes(status) || LOCKED_STATUSES.includes(status)) return false;

  if (status === "draft") {
    if (field === "billingType") return true;
    return false;
  }
  if (status === "private" || status === "restricted" || status === "pending_public") {
    if (field === "billingType") return true;
    if (field === "linkedGroups") return true;

    if (billingType === "subscription") {
      return field === "stripePriceId" || field === "interval";
    }
    if (billingType === "prepaid") {
      return field === "initialCredits" || field === "quotaUnit";
    }
    if (billingType === "metered") {
      return field === "unitPrice" || field === "quotaUnit";
    }
  }
  return false;
}

/* ================================
  テンプレ編集モーダル
================================ */
type TemplateEditModalProps = {
  open: boolean;
  onClose: () => void;
  templateKey: TemplateKey;
  value: TemplateConfig;
  onChange: (updated: Omit<TemplateConfig, "apply">) => void;
};

function TemplateEditModal({ open, onClose, templateKey, value, onChange }: TemplateEditModalProps) {
  const [label, setLabel] = useState(value.label);
  const [description, setDescription] = useState(value.description);
  const [iconKey, setIconKey] = useState<IconKey>(value.iconKey);
  const [bgColor, setBgColor] = useState(value.bgColor);
  const [bgImage, setBgImage] = useState<string | null | undefined>(value.bgImage ?? null);

  const colorId = `tpl-${templateKey}-bgcolor`;
  const colorTextId = `tpl-${templateKey}-bgcolor-text`;
  const imageId = `tpl-${templateKey}-bgimage`;
  const iconGroupId = `tpl-${templateKey}-icongroup`;

  const onPickImage = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = () => setBgImage(reader.result as string);
    reader.readAsDataURL(file);
  }, []);

  useEffect(() => {
    // valueが外側で更新されたときに同期
    setLabel(value.label);
    setDescription(value.description);
    setIconKey(value.iconKey);
    setBgColor(value.bgColor);
    setBgImage(value.bgImage ?? null);
  }, [value]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Edit template: {templateKey}</h3>
          <button
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor={`tpl-${templateKey}-title`} className="mb-1 block text-sm font-medium">
              Title
            </label>
            <input
              id={`tpl-${templateKey}-title`}
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              placeholder="Free / Pro / Enterprise..."
            />
          </div>

          <div>
            <label htmlFor={`tpl-${templateKey}-desc`} className="mb-1 block text-sm font-medium">
              Description
            </label>
            <textarea
              id={`tpl-${templateKey}-desc`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              placeholder="Short description for this template"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor={colorId} className="mb-1 block text-sm font-medium flex items-center gap-2">
                <Palette className="h-4 w-4" /> Background color
              </label>
              <div className="flex items-center gap-3">
                <input
                  id={colorId}
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="h-9 w-14 cursor-pointer rounded border border-gray-300"
                  aria-label="Pick background color"
                />
                <input
                  id={colorTextId}
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2"
                  aria-labelledby={colorId}
                />
              </div>
            </div>

            <div>
              <label htmlFor={imageId} className="mb-1 block text-sm font-medium flex items-center gap-2">
                <ImageIcon className="h-4 w-4" /> Background image (optional)
              </label>
              <div className="flex items-center gap-3">
                <input
                  id={imageId}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onPickImage(f);
                  }}
                  aria-label="Choose background image file"
                  aria-describedby={bgImage ? `${imageId}-preview` : undefined}
                />
                {bgImage && (
                  <button type="button" className="text-sm text-gray-600 underline" onClick={() => setBgImage(null)}>
                    Remove
                  </button>
                )}
              </div>
              {bgImage && (
                <div
                  id={`${imageId}-preview`}
                  className="mt-2 h-20 w-full overflow-hidden rounded-lg border"
                  style={{ backgroundImage: `url(${bgImage})`, backgroundSize: "cover", backgroundPosition: "center" }}
                  role="img"
                  aria-label="Background image preview"
                />
              )}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Icon</label>
            <div role="radiogroup" aria-labelledby={`${iconGroupId}-label`} className="flex items-center gap-3">
              <span id={`${iconGroupId}-label`} className="sr-only">
                Template icon
              </span>
              {(["zap", "credit-card", "shield"] as IconKey[]).map((k) => {
                const Icon = iconMap[k];
                const selected = iconKey === k;
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setIconKey(k)}
                    className={`flex h-10 w-10 items-center justify-center rounded-lg border transition ${
                      selected ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:bg-gray-50"
                    }`}
                    aria-pressed={selected}
                    aria-label={k}
                  >
                    <Icon className="h-5 w-5" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button onClick={onClose} className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={() => {
              onChange({ label, description, iconKey, bgColor, bgImage });
              onClose();
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
          >
            <Edit3 className="h-4 w-4" /> Save
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================================
  PlanForm（新規/編集 共通UI）
================================ */
export type PlanFormProps = {
  mode: "new" | "edit";
  initialData?: Partial<PlanFormData>;
  currentPlanId?: string; // 重複名チェックで自分を除外
  availableGroups: EndpointGroupLite[];
  // 既存プラン名一覧（重複チェック用）
  existingPlanNames?: string[];

  // 保存ハンドラ（DB処理は親で）
  onSubmit: (data: PlanFormData) => Promise<void>;
  onCancel?: () => void;

  // 進行状況
  isSaving?: boolean;

  // テンプレ差し替え可
  templatesOverride?: Partial<Record<TemplateKey, Partial<TemplateConfig>>>;
};

export function PlanForm({
  mode,
  initialData,
  currentPlanId,
  availableGroups,
  existingPlanNames = [],
  onSubmit,
  onCancel,
  isSaving = false,
  templatesOverride,
}: PlanFormProps) {
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
    if (initialData) {
      setFormData((prev) => ({ ...prev, ...(initialData ?? {}) }));
    }
  }, [initialData]);

  const allLocked = useMemo(
    () => AUTO_STATUSES.includes(formData.status) || LOCKED_STATUSES.includes(formData.status),
    [formData.status]
  );

  const req = (field: Parameters<typeof isRequired>[0]) =>
    isRequired(field, formData.status, formData.billingType);

  const dis = allLocked || isSaving;

  // バリデーション
  const validateAll = () => {
    const e: Record<string, string> = {};
    const { status, billingType } = formData;

    if (!formData.name.trim()) e.name = "Plan name is required";
    const dup = existingPlanNames
      .filter(Boolean)
      .some((n) => n.toLowerCase() === formData.name.trim().toLowerCase());
    if (dup) e.name = "Plan name must be unique";

    if (allLocked) {
      setErrors(e);
      return Object.keys(e).length === 0;
    }

    const need = (field: Parameters<typeof isRequired>[0]) => isRequired(field, status, billingType);
    if (need("billingType") && !formData.billingType) e.billingType = "Billing type is required";

    if (billingType === "subscription") {
      if (need("stripePriceId") && !formData.stripePriceId.trim()) e.stripePriceId = "Stripe Price ID is required";
      if (need("interval") && !formData.interval) e.interval = "Interval is required";
    } else if (billingType === "prepaid") {
      if (need("initialCredits") && formData.initialCredits <= 0) e.initialCredits = "Initial credits must be positive";
      if (need("quotaUnit") && !formData.quotaUnit.trim()) e.quotaUnit = "Quota unit is required";
    } else if (billingType === "metered") {
      if (need("unitPrice") && formData.unitPrice <= 0) e.unitPrice = "Unit price must be positive";
      if (need("quotaUnit") && !formData.quotaUnit.trim()) e.quotaUnit = "Quota unit is required";
    }

    if (need("linkedGroups") && formData.linkedGroups.length === 0) {
      e.linkedGroups = "At least one group must be linked";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateAll()) return;
    await onSubmit(formData);
  };

  /** 現在のstatusがユーザー操作可能か */
  const statusIsEditableNow = EDITABLE_STATUSES.includes(formData.status);

  return (
    <div className="space-y-10">
      {/* ステータスによるロック表示 */}
      {(AUTO_STATUSES.includes(formData.status) || LOCKED_STATUSES.includes(formData.status)) && (
        <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <Info className="mt-0.5 h-5 w-5 text-blue-600" />
          <div className="text-sm text-blue-900">
            <p className="font-medium">
              {formData.status === "disabled"
                ? "This plan is disabled. All fields are read-only."
                : "This status is system-managed. Fields reflect runtime state and cannot be edited here."}
            </p>
          </div>
        </div>
      )}

      {/* 1画面フォーム */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === "new" ? "Plan settings" : "Edit plan settings"}
          </h2>
          <p className="text-gray-600">Configure billing and allowed endpoint groups.</p>
        </CardHeader>

        <CardContent className="space-y-10">
          {/* Basics */}
          <section className="space-y-4">
            <h3 className="font-semibold text-gray-900">Basic</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="md:col-span-2">
                <label htmlFor="planName" className="mb-2 block text-sm font-medium text-gray-700">
                  Plan Name {req("name") && <span className="text-red-600">*</span>}
                </label>
                <input
                  id="planName"
                  type="text"
                  disabled={dis}
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
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

              <div>
                <label htmlFor="status" className="mb-2 block text-sm font-medium text-gray-700">
                  Status
                </label>

                {/* 現在のstatusが編集可能な4種ならセレクトを表示。そうでなければ読み取り専用表示に */}
                {statusIsEditableNow ? (
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value as PlanStatus }))}
                    disabled={isSaving}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  >
                    {EDITABLE_STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
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
                {/* hidden input to keep value in forms if needed */}
                {!statusIsEditableNow && (
                  <input type="hidden" value={formData.status} aria-hidden />
                )}
              </div>
            </div>
          </section>

          {/* Category Template */}
          <section className="space-y-2">
            <div className="flex items-baseline gap-2">
              <h3 className="font-semibold text-gray-900">Category Template</h3>
              <span className="text-xs text-gray-500">(optional – picks sensible defaults)</span>

              {formData.templateKey && (
                <button
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, templateKey: null }))}
                  className="ml-auto text-xs underline text-gray-600 hover:text-gray-900"
                >
                  Reset
                </button>
              )}
            </div>

            <div role="radiogroup" aria-label="Category Template" className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {(Object.keys(templates) as TemplateKey[]).map((key) => {
                const cfg = templates[key];
                const Icon = iconMap[cfg.iconKey];
                const selected = formData.templateKey === key;

                return (
                  <div
                    key={key}
                    className={`relative overflow-hidden rounded-xl border-2 transition-all ${
                      selected ? "border-blue-500" : "border-gray-200 hover:border-gray-300"
                    }`}
                    style={{ backgroundColor: cfg.bgColor }}
                  >
                    {cfg.bgImage && (
                      <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 opacity-15"
                        style={{ backgroundImage: `url(${cfg.bgImage})`, backgroundSize: "cover", backgroundPosition: "center" }}
                      />
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingKey(key);
                      }}
                      className="absolute right-3 top-3 z-10 inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white/80 px-2 py-1 text-xs text-gray-700 backdrop-blur hover:bg-white"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      Edit
                    </button>

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
                      <input id={`tpl-${key}`} type="radio" name="template" className="sr-only" readOnly checked={selected} />
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-white/60">
                        <Icon className="h-6 w-6 text-gray-700" />
                      </div>
                      <div className="font-semibold text-gray-900">{cfg.label}</div>
                      <div className="text-sm text-gray-700">{cfg.description}</div>
                    </label>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Billing */}
          <section className="space-y-4">
            <h3 className="font-semibold text-gray-900">
              Billing {req("billingType") && <span className="text-red-600">*</span>}
            </h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {([
                { key: "subscription", title: "Subscription", icon: CreditCard, description: "Recurring monthly or yearly payments" },
                { key: "prepaid", title: "Prepaid", icon: Zap, description: "Pay upfront for credits or usage" },
                { key: "metered", title: "Metered", icon: Shield, description: "Pay per usage with flexible pricing" },
              ] as const).map(({ key, title, icon: Icon, description }) => {
                const id = `bill-${key}`;
                const selected = formData.billingType === key;
                return (
                  <label
                    key={key}
                    htmlFor={id}
                    className={`cursor-pointer rounded-xl border-2 p-4 text-left transition-all ${
                      selected ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                    } ${dis ? "cursor-not-allowed opacity-60" : ""}`}
                  >
                    <input
                      id={id}
                      type="radio"
                      name="billingType"
                      className="sr-only"
                      disabled={dis}
                      checked={selected}
                      onChange={() => setFormData((p) => ({ ...p, billingType: key as PlanFormData["billingType"] }))}
                    />
                    <div className="mb-2 flex items-center gap-3">
                      <Icon size={20} className="text-gray-600" />
                      <h4 className="font-semibold text-gray-900">{title}</h4>
                    </div>
                    <p className="text-sm text-gray-600">{description}</p>
                  </label>
                );
              })}
            </div>

            {/* Subscription */}
            {formData.billingType === "subscription" && (
              <div className="rounded-lg bg-blue-50 p-4">
                <h4 className="font-semibold text-blue-900">Subscription Settings</h4>
                <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label htmlFor="stripePriceId" className="mb-2 block text-sm font-medium text-gray-700">
                      Stripe Price ID {req("stripePriceId") && <span className="text-red-600">*</span>}
                    </label>
                    <input
                      id="stripePriceId"
                      type="text"
                      disabled={dis}
                      value={formData.stripePriceId}
                      onChange={(e) => setFormData((p) => ({ ...p, stripePriceId: e.target.value }))}
                      placeholder="price_1234567890"
                      className={`w-full rounded-lg border px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
                        errors.stripePriceId ? "border-red-300" : "border-gray-300"
                      }`}
                      aria-describedby={errors.stripePriceId ? "stripePriceIdError" : undefined}
                    />
                    {errors.stripePriceId && <p id="stripePriceIdError" className="mt-1 text-sm text-red-600">{errors.stripePriceId}</p>}
                  </div>

                  <div>
                    <label htmlFor="interval" className="mb-2 block text-sm font-medium text-gray-700">
                      Billing Interval {req("interval") && <span className="text-red-600">*</span>}
                    </label>
                    <select
                      id="interval"
                      disabled={dis}
                      value={formData.interval}
                      onChange={(e) => setFormData((p) => ({ ...p, interval: e.target.value as "month" | "year" }))}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="month">Monthly</option>
                      <option value="year">Yearly</option>
                    </select>
                    {errors.interval && <p className="mt-1 text-sm text-red-600">{errors.interval}</p>}
                  </div>

                  <div>
                    <label htmlFor="monthlyQuota" className="mb-2 block text-sm font-medium text-gray-700">Monthly Quota</label>
                    <input
                      id="monthlyQuota"
                      type="number"
                      min={0}
                      disabled={dis}
                      value={formData.monthlyQuota}
                      onChange={(e) => setFormData((p) => ({ ...p, monthlyQuota: parseInt(e.target.value) || 0 }))}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Prepaid */}
            {formData.billingType === "prepaid" && (
              <div className="rounded-lg bg-green-50 p-4">
                <h4 className="font-semibold text-green-900">Prepaid Settings</h4>
                <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label htmlFor="initialCredits" className="mb-2 block text-sm font-medium text-gray-700">
                      Initial Credits {req("initialCredits") && <span className="text-red-600">*</span>}
                    </label>
                    <input
                      id="initialCredits"
                      type="number"
                      min={1}
                      disabled={dis}
                      value={formData.initialCredits}
                      onChange={(e) => setFormData((p) => ({ ...p, initialCredits: parseInt(e.target.value) || 0 }))}
                      className={`w-full rounded-lg border px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
                        errors.initialCredits ? "border-red-300" : "border-gray-300"
                      }`}
                      aria-describedby={errors.initialCredits ? "initialCreditsError" : undefined}
                    />
                    {errors.initialCredits && <p id="initialCreditsError" className="mt-1 text-sm text-red-600">{errors.initialCredits}</p>}
                  </div>

                  <div>
                    <label htmlFor="quotaUnit" className="mb-2 block text-sm font-medium text-gray-700">
                      Quota Unit {req("quotaUnit") && <span className="text-red-600">*</span>}
                    </label>
                    <input
                      id="quotaUnit"
                      type="text"
                      disabled={dis}
                      value={formData.quotaUnit}
                      onChange={(e) => setFormData((p) => ({ ...p, quotaUnit: e.target.value }))}
                      placeholder="requests, GB, minutes"
                      className={`w-full rounded-lg border px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
                        errors.quotaUnit ? "border-red-300" : "border-gray-300"
                      }`}
                      aria-describedby={errors.quotaUnit ? "quotaUnitError" : undefined}
                    />
                    {errors.quotaUnit && <p id="quotaUnitError" className="mt-1 text-sm text-red-600">{errors.quotaUnit}</p>}
                  </div>
                </div>

                <div className="mt-2 flex items-center gap-2">
                  <input
                    id="carryOver"
                    type="checkbox"
                    disabled={dis}
                    checked={formData.carryOver}
                    onChange={(e) => setFormData((p) => ({ ...p, carryOver: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="carryOver" className="text-sm font-medium text-gray-700">
                    Allow unused credits to carry over
                  </label>
                </div>
              </div>
            )}

            {/* Metered */}
            {formData.billingType === "metered" && (
              <div className="rounded-lg bg-purple-50 p-4">
                <h4 className="font-semibold text-purple-900">Metered Settings</h4>
                <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label htmlFor="unitPrice" className="mb-2 block text-sm font-medium text-gray-700">
                      Unit Price (USD) {req("unitPrice") && <span className="text-red-600">*</span>}
                    </label>
                    <input
                      id="unitPrice"
                      type="number"
                      min={0}
                      step={0.001}
                      disabled={dis}
                      value={formData.unitPrice}
                      onChange={(e) => setFormData((p) => ({ ...p, unitPrice: parseFloat(e.target.value) || 0 }))}
                      className={`w-full rounded-lg border px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
                        errors.unitPrice ? "border-red-300" : "border-gray-300"
                      }`}
                      aria-describedby={errors.unitPrice ? "unitPriceError" : undefined}
                    />
                    {errors.unitPrice && <p id="unitPriceError" className="mt-1 text-sm text-red-600">{errors.unitPrice}</p>}
                  </div>

                  <div>
                    <label htmlFor="quotaUnitMetered" className="mb-2 block text-sm font-medium text-gray-700">
                      Quota Unit {req("quotaUnit") && <span className="text-red-600">*</span>}
                    </label>
                    <input
                      id="quotaUnitMetered"
                      type="text"
                      disabled={dis}
                      value={formData.quotaUnit}
                      onChange={(e) => setFormData((p) => ({ ...p, quotaUnit: e.target.value }))}
                      placeholder="requests, GB, minutes"
                      className={`w-full rounded-lg border px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
                        errors.quotaUnit ? "border-red-300" : "border-gray-300"
                      }`}
                      aria-describedby={errors.quotaUnit ? "quotaUnitMeteredError" : undefined}
                    />
                    {errors.quotaUnit && <p id="quotaUnitMeteredError" className="mt-1 text-sm text-red-600">{errors.quotaUnit}</p>}
                  </div>

                  <div>
                    <label htmlFor="monthlyCap" className="mb-2 block text-sm font-medium text-gray-700">
                      Monthly Cap (0 = unlimited)
                    </label>
                    <input
                      id="monthlyCap"
                      type="number"
                      min={0}
                      disabled={dis}
                      value={formData.monthlyCap}
                      onChange={(e) => setFormData((p) => ({ ...p, monthlyCap: parseInt(e.target.value) || 0 }))}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                                          <label htmlFor="minimumCharge" className="mb-2 block text-sm font-medium text-gray-700">
                      Minimum Charge (USD)
                    </label>
                    <input
                      id="minimumCharge"
                      type="number"
                      min={0}
                      step={0.01}
                      disabled={dis}
                      value={formData.minimumCharge}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, minimumCharge: parseFloat(e.target.value) || 0 }))
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Groups */}
          <section className="space-y-4">
            <h3 className="font-semibold text-gray-900">
              Endpoint Groups {req("linkedGroups") && <span className="text-red-600">*</span>}
            </h3>

            {availableGroups.length === 0 ? (
              <div className="py-12 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
                  <AlertTriangle className="h-8 w-8 text-gray-400" aria-hidden />
                </div>
                <h4 className="mb-2 text-lg font-semibold text-gray-900">No Endpoint Groups</h4>
                <p className="mx-auto mb-6 max-w-sm text-gray-600">
                  You need to create endpoint groups before you can link them to plans.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {availableGroups.map((group) => {
                  const checked = formData.linkedGroups.includes(group.id);
                  const inputId = `linkGroup-${group.id}`;
                  return (
                    <label
                      key={group.id}
                      htmlFor={inputId}
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-4 hover:bg-gray-50 ${
                        dis ? "cursor-not-allowed opacity-60" : ""
                      }`}
                    >
                      <input
                        id={inputId}
                        type="checkbox"
                        disabled={dis}
                        checked={checked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData((p) => ({ ...p, linkedGroups: [...p.linkedGroups, group.id] }));
                          } else {
                            setFormData((p) => ({
                              ...p,
                              linkedGroups: p.linkedGroups.filter((id) => id !== group.id),
                            }));
                          }
                        }}
                        className="mt-1 rounded border-gray-300"
                        aria-describedby={`${inputId}-desc`}
                      />
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <h4 className="font-medium text-gray-900">{group.name}</h4>
                          {group.category && (
                            <Badge
                              variant={
                                group.category === "light"
                                  ? "success"
                                  : group.category === "heavy"
                                  ? "warning"
                                  : "info"
                              }
                            >
                              {group.category}
                            </Badge>
                          )}
                          {group.isDefault && (
                            <Badge variant="neutral" size="sm">
                              Default
                            </Badge>
                          )}
                        </div>
                        {group.description && (
                          <p id={`${inputId}-desc`} className="mb-2 text-sm text-gray-600">
                            {group.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          {typeof group.endpointCount === "number" && <span>{group.endpointCount} endpoints</span>}
                          {group.loadLevel && <span>{group.loadLevel} load</span>}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}

            {errors.linkedGroups && <p className="text-sm text-red-600">{errors.linkedGroups}</p>}
          </section>

          {/* Summary */}
          {formData.linkedGroups.length > 0 && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h4 className="font-semibold text-green-900">Plan Summary</h4>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
                  <div>
                    <span className="font-medium text-green-700">Plan:</span>
                    <p className="text-green-900">
                      {formData.name}
                      {formData.templateKey ? ` (${templates[formData.templateKey].label})` : ""}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-green-700">Billing:</span>
                    <p className="capitalize text-green-900">{formData.billingType}</p>
                  </div>
                  <div>
                    <span className="font-medium text-green-700">Groups:</span>
                    <p className="text-green-900">{formData.linkedGroups.length} linked</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t pt-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
                Cancel
              </Button>
            )}
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSaving || availableGroups.length === 0}
            >
              {isSaving ? (mode === "new" ? "Creating..." : "Saving...") : mode === "new" ? "Create Plan" : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* テンプレ編集モーダル */}
      {editingKey && (
        <TemplateEditModal
          open={true}
          onClose={() => setEditingKey(null)}
          templateKey={editingKey}
          value={templates[editingKey]}
          onChange={(updated) =>
            setTemplates((prev) => ({
              ...prev,
              [editingKey]: { ...prev[editingKey], ...updated }, // apply は保持
            }))
          }
        />
      )}
    </div>
  );
}
