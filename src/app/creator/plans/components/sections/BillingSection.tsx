// src/app/creator/plans/components/sections/BillingSection.tsx
"use client";

import { CreditCard, Zap, Shield } from "lucide-react";
import { PlanFormData } from "../types";
import { isRequired } from "../PlanTemplateConfig";

type Props = {
  formData: PlanFormData;
  setFormData: React.Dispatch<React.SetStateAction<PlanFormData>>;
  errors: Record<string, string>;
  dis: boolean;
  req: (field: Parameters<typeof isRequired>[0]) => boolean;
};

export function BillingSection({
  formData,
  setFormData,
  errors,
  dis,
  req,
}: Props) {
  return (
    <section className="space-y-4">
      <h3 className="font-semibold text-gray-900">
        Billing {req("billingType") && <span className="text-red-600">*</span>}
      </h3>

      {/* Billing Type Selection */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {([
          {
            key: "subscription",
            title: "Subscription",
            icon: CreditCard,
            description: "Recurring monthly or yearly payments",
          },
          {
            key: "prepaid",
            title: "Prepaid",
            icon: Zap,
            description: "Pay upfront for credits or usage",
          },
          {
            key: "metered",
            title: "Metered",
            icon: Shield,
            description: "Pay per usage with flexible pricing",
          },
        ] as const).map(({ key, title, icon: Icon, description }) => {
          const id = `bill-${key}`;
          const selected = formData.billingType === key;

          return (
            <label
              key={key}
              htmlFor={id}
              className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${
                selected
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              } ${dis ? "cursor-not-allowed opacity-60" : ""}`}
            >
              <input
                id={id}
                type="radio"
                name="billingType"
                className="sr-only"
                aria-label={`Billing type: ${title}`}
                disabled={dis}
                checked={selected}
                onChange={() =>
                  setFormData((p) => ({
                    ...p,
                    billingType: key as PlanFormData["billingType"],
                  }))
                }
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

      {/* ============================ Subscription ============================ */}
      {formData.billingType === "subscription" && (
        <div className="rounded-lg bg-blue-50 p-4">
          <h4 className="font-semibold text-blue-900">
            Subscription Settings
          </h4>

          <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Stripe Price ID */}
            <div>
              <label
                htmlFor="stripePriceId"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Stripe Price ID{" "}
                {req("stripePriceId") && <span className="text-red-600">*</span>}
              </label>

              <input
                id="stripePriceId"
                aria-label="Stripe Price ID"
                type="text"
                disabled={dis}
                value={formData.stripePriceId}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, stripePriceId: e.target.value }))
                }
                placeholder="price_123456"
                className={`w-full rounded-lg border px-3 py-2 ${
                  errors.stripePriceId ? "border-red-300" : "border-gray-300"
                }`}
              />

              {errors.stripePriceId && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.stripePriceId}
                </p>
              )}
            </div>

            {/* Billing Interval */}
            <div>
              <label
                htmlFor="interval"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Billing Interval {req("interval") && <span className="text-red-600">*</span>}
              </label>

              <select
                id="interval"
                aria-label="Billing Interval"
                disabled={dis}
                value={formData.interval}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    interval: e.target.value as "month" | "year",
                  }))
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              >
                <option value="month">Monthly</option>
                <option value="year">Yearly</option>
              </select>

              {errors.interval && (
                <p className="mt-1 text-sm text-red-600">{errors.interval}</p>
              )}
            </div>

            {/* Monthly Quota */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Monthly Quota
              </label>

              <input
                aria-label="Monthly Quota"
                type="number"
                min={0}
                disabled={dis}
                value={formData.monthlyQuota}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    monthlyQuota: parseInt(e.target.value) || 0,
                  }))
                }
                placeholder="0"
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </div>
          </div>
        </div>
      )}

      {/* ============================ Prepaid ============================ */}
      {formData.billingType === "prepaid" && (
        <div className="rounded-lg bg-green-50 p-4">
          <h4 className="font-semibold text-green-900">
            Prepaid Settings
          </h4>

          <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Initial Credits */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Initial Credits{" "}
                {req("initialCredits") && <span className="text-red-600">*</span>}
              </label>

              <input
                aria-label="Initial Credits"
                type="number"
                min={1}
                disabled={dis}
                value={formData.initialCredits}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    initialCredits: parseInt(e.target.value) || 0,
                  }))
                }
                placeholder="0"
                className={`w-full rounded-lg border px-3 py-2 ${
                  errors.initialCredits ? "border-red-300" : "border-gray-300"
                }`}
              />

              {errors.initialCredits && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.initialCredits}
                </p>
              )}
            </div>

            {/* Quota Unit */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Quota Unit {req("quotaUnit") && <span className="text-red-600">*</span>}
              </label>

              <input
                aria-label="Quota Unit"
                type="text"
                disabled={dis}
                value={formData.quotaUnit}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    quotaUnit: e.target.value,
                  }))
                }
                placeholder="requests, GB, minutes"
                className={`w-full rounded-lg border px-3 py-2 ${
                  errors.quotaUnit ? "border-red-300" : "border-gray-300"
                }`}
              />

              {errors.quotaUnit && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.quotaUnit}
                </p>
              )}
            </div>
          </div>

          {/* Carry Over */}
          <div className="mt-2 flex items-center gap-2">
            <input
              id="carryOver"
              aria-label="Carry over unused credits"
              type="checkbox"
              disabled={dis}
              checked={formData.carryOver}
              onChange={(e) =>
                setFormData((p) => ({
                  ...p,
                  carryOver: e.target.checked,
                }))
              }
              className="rounded border-gray-300"
            />
            <label htmlFor="carryOver" className="text-sm font-medium text-gray-700">
              Allow unused credits to carry over
            </label>
          </div>
        </div>
      )}

      {/* ============================ Metered ============================ */}
      {formData.billingType === "metered" && (
        <div className="rounded-lg bg-purple-50 p-4">
          <h4 className="font-semibold text-purple-900">
            Metered Settings
          </h4>

          <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Unit Price */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Unit Price (USD) {req("unitPrice") && <span className="text-red-600">*</span>}
              </label>

              <input
                aria-label="Unit Price"
                type="number"
                min={0}
                step={0.001}
                disabled={dis}
                value={formData.unitPrice}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    unitPrice: parseFloat(e.target.value) || 0,
                  }))
                }
                placeholder="0"
                className={`w-full rounded-lg border px-3 py-2 ${
                  errors.unitPrice ? "border-red-300" : "border-gray-300"
                }`}
              />

              {errors.unitPrice && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.unitPrice}
                </p>
              )}
            </div>

            {/* Quota Unit */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Quota Unit {req("quotaUnit") && <span className="text-red-600">*</span>}
              </label>

              <input
                aria-label="Quota Unit Metered"
                type="text"
                disabled={dis}
                value={formData.quotaUnit}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    quotaUnit: e.target.value,
                  }))
                }
                placeholder="requests, GB, minutes"
                className={`w-full rounded-lg border px-3 py-2 ${
                  errors.quotaUnit ? "border-red-300" : "border-gray-300"
                }`}
              />

              {errors.quotaUnit && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.quotaUnit}
                </p>
              )}
            </div>

            {/* Monthly Cap */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Monthly Cap (0 = unlimited)
              </label>

              <input
                aria-label="Monthly Cap"
                type="number"
                min={0}
                disabled={dis}
                value={formData.monthlyCap}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    monthlyCap: parseInt(e.target.value) || 0,
                  }))
                }
                placeholder="0"
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </div>

            {/* Minimum Charge */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Minimum Charge (USD)
              </label>

              <input
                aria-label="Minimum Charge"
                type="number"
                min={0}
                step={0.01}
                disabled={dis}
                value={formData.minimumCharge}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    minimumCharge: parseFloat(e.target.value) || 0,
                  }))
                }
                placeholder="0"
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
