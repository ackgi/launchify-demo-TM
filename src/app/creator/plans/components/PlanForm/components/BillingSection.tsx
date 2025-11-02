/** @jsxImportSource react */
import { CreditCard, Zap, Shield } from "lucide-react";
import { PlanFormData } from "../../types";

type Props = {
  data: PlanFormData;
  setData: (u: Partial<PlanFormData>) => void;
  errors: Record<string, string>;
  req: (
    f:
      | "name"
      | "billingType"
      | "stripePriceId"
      | "interval"
      | "price"
      | "initialCredits"
      | "quotaUnit"
      | "unitPrice"
      | "linkedGroups"
  ) => boolean;
  disabled: boolean;
};

export default function BillingSection({ data, setData, errors, req, disabled }: Props) {
  return (
    <section className="space-y-4">
      <h3 className="font-semibold text-gray-900">
        Billing {req("billingType") && <span className="text-red-600">*</span>}
      </h3>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {([
          {
            key: "subscription",
            title: "Subscription",
            icon: CreditCard,
            description: "Recurring monthly or yearly payments",
          },
          { key: "prepaid", title: "Prepaid", icon: Zap, description: "Pay upfront for credits or usage" },
          { key: "metered", title: "Metered", icon: Shield, description: "Pay per usage with flexible pricing" },
        ] as const).map(({ key, title, icon: Icon, description }) => {
          const id = `bill-${key}`;
          const selected = data.billingType === key;
          return (
            <label
              key={key}
              htmlFor={id}
              className={`cursor-pointer rounded-xl border-2 p-4 text-left transition-all ${
                selected ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
              } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
            >
              <input
                id={id}
                type="radio"
                name="billingType"
                className="sr-only"
                disabled={disabled}
                checked={selected}
                onChange={() => setData({ billingType: key as any })}
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
      {data.billingType === "subscription" && (
        <div className="rounded-lg bg-blue-50 p-4">
          <h4 className="font-semibold text-blue-900">Subscription Settings</h4>
          <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="stripePriceId"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Stripe Price ID {req("stripePriceId") && <span className="text-red-600">*</span>}
              </label>
              <input
                id="stripePriceId"
                type="text"
                disabled={disabled}
                value={data.stripePriceId}
                onChange={(e) => setData({ stripePriceId: e.target.value })}
                placeholder="price_1234567890"
                aria-describedby={errors.stripePriceId ? "stripePriceId-error" : undefined}
                className={`w-full rounded-lg border px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
                  errors.stripePriceId ? "border-red-300" : "border-gray-300"
                }`}
              />
              {errors.stripePriceId && (
                <p id="stripePriceId-error" className="mt-1 text-sm text-red-600">
                  {errors.stripePriceId}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="interval"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Billing Interval {req("interval") && <span className="text-red-600">*</span>}
              </label>
              <select
                id="interval"
                disabled={disabled}
                value={data.interval}
                onChange={(e) => setData({ interval: e.target.value as "month" | "year" })}
                aria-describedby={errors.interval ? "interval-error" : undefined}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              >
                <option value="month">Monthly</option>
                <option value="year">Yearly</option>
              </select>
              {errors.interval && (
                <p id="interval-error" className="mt-1 text-sm text-red-600">
                  {errors.interval}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="monthlyQuota"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Monthly Quota
              </label>
              <input
                id="monthlyQuota"
                type="number"
                min={0}
                disabled={disabled}
                value={data.monthlyQuota}
                onChange={(e) => setData({ monthlyQuota: parseInt(e.target.value) || 0 })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Prepaid */}
      {data.billingType === "prepaid" && (
        <div className="rounded-lg bg-green-50 p-4">
          <h4 className="font-semibold text-green-900">Prepaid Settings</h4>
          <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="initialCredits"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Initial Credits {req("initialCredits") && <span className="text-red-600">*</span>}
              </label>
              <input
                id="initialCredits"
                type="number"
                min={1}
                disabled={disabled}
                value={data.initialCredits}
                onChange={(e) => setData({ initialCredits: parseInt(e.target.value) || 0 })}
                aria-describedby={errors.initialCredits ? "initialCredits-error" : undefined}
                className={`w-full rounded-lg border px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
                  errors.initialCredits ? "border-red-300" : "border-gray-300"
                }`}
              />
              {errors.initialCredits && (
                <p id="initialCredits-error" className="mt-1 text-sm text-red-600">
                  {errors.initialCredits}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="quotaUnitPrepaid"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Quota Unit {req("quotaUnit") && <span className="text-red-600">*</span>}
              </label>
              <input
                id="quotaUnitPrepaid"
                type="text"
                disabled={disabled}
                value={data.quotaUnit}
                onChange={(e) => setData({ quotaUnit: e.target.value })}
                placeholder="requests, GB, minutes"
                aria-describedby={errors.quotaUnit ? "quotaUnitPrepaid-error" : undefined}
                className={`w-full rounded-lg border px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
                  errors.quotaUnit ? "border-red-300" : "border-gray-300"
                }`}
              />
              {errors.quotaUnit && (
                <p id="quotaUnitPrepaid-error" className="mt-1 text-sm text-red-600">
                  {errors.quotaUnit}
                </p>
              )}
            </div>
          </div>

          <div className="mt-2 flex items-center gap-2">
            <input
              id="carryOver"
              type="checkbox"
              disabled={disabled}
              checked={data.carryOver}
              onChange={(e) => setData({ carryOver: e.target.checked })}
              className="rounded border-gray-300"
            />
            <label htmlFor="carryOver" className="text-sm font-medium text-gray-700">
              Allow unused credits to carry over
            </label>
          </div>
        </div>
      )}

      {/* Metered */}
      {data.billingType === "metered" && (
        <div className="rounded-lg bg-purple-50 p-4">
          <h4 className="font-semibold text-purple-900">Metered Settings</h4>
          <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="unitPrice"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Unit Price (USD) {req("unitPrice") && <span className="text-red-600">*</span>}
              </label>
              <input
                id="unitPrice"
                type="number"
                min={0}
                step={0.001}
                disabled={disabled}
                value={data.unitPrice}
                onChange={(e) => setData({ unitPrice: parseFloat(e.target.value) || 0 })}
                aria-describedby={errors.unitPrice ? "unitPrice-error" : undefined}
                className={`w-full rounded-lg border px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
                  errors.unitPrice ? "border-red-300" : "border-gray-300"
                }`}
              />
              {errors.unitPrice && (
                <p id="unitPrice-error" className="mt-1 text-sm text-red-600">
                  {errors.unitPrice}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="quotaUnitMetered"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Quota Unit {req("quotaUnit") && <span className="text-red-600">*</span>}
              </label>
              <input
                id="quotaUnitMetered"
                type="text"
                disabled={disabled}
                value={data.quotaUnit}
                onChange={(e) => setData({ quotaUnit: e.target.value })}
                placeholder="requests, GB, minutes"
                aria-describedby={errors.quotaUnit ? "quotaUnitMetered-error" : undefined}
                className={`w-full rounded-lg border px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
                  errors.quotaUnit ? "border-red-300" : "border-gray-300"
                }`}
              />
              {errors.quotaUnit && (
                <p id="quotaUnitMetered-error" className="mt-1 text-sm text-red-600">
                  {errors.quotaUnit}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="monthlyCap"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Monthly Cap (0 = unlimited)
              </label>
              <input
                id="monthlyCap"
                type="number"
                min={0}
                disabled={disabled}
                value={data.monthlyCap}
                onChange={(e) => setData({ monthlyCap: parseInt(e.target.value) || 0 })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="minimumCharge"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Minimum Charge (USD)
              </label>
              <input
                id="minimumCharge"
                type="number"
                min={0}
                step={0.01}
                disabled={disabled}
                value={data.minimumCharge}
                onChange={(e) => setData({ minimumCharge: parseFloat(e.target.value) || 0 })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
