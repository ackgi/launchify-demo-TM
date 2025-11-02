/** @jsxImportSource react */
import { PlanFormData, PlanStatus } from "../types";
import { AUTO_STATUSES, LOCKED_STATUSES } from "./constants";

export type RequiredField =
  | "name" | "billingType" | "stripePriceId" | "interval" | "price"
  | "initialCredits" | "quotaUnit" | "unitPrice" | "linkedGroups";

export function isRequired(
  field: RequiredField,
  status: PlanStatus,
  billingType: PlanFormData["billingType"]
): boolean {
  if (field === "name") return true;
  if (AUTO_STATUSES.includes(status) || LOCKED_STATUSES.includes(status)) return false;
  if (status === "draft") return field === "billingType";

  if (status === "private" || status === "restricted" || status === "pending_public") {
    if (field === "billingType" || field === "linkedGroups") return true;
    if (billingType === "subscription") return field === "stripePriceId" || field === "interval";
    if (billingType === "prepaid") return field === "initialCredits" || field === "quotaUnit";
    if (billingType === "metered") return field === "unitPrice" || field === "quotaUnit";
  }
  return false;
}

export function validateForm(
  data: PlanFormData,
  existingNames: string[],
  req: (f: RequiredField) => boolean,
  locked: boolean
) {
  const e: Record<string, string> = {};
  if (!data.name.trim()) e.name = "Plan name is required";
  const dup = existingNames.some((n) => n.toLowerCase() === data.name.trim().toLowerCase());
  if (dup) e.name = "Plan name must be unique";

  if (!locked) {
    const { billingType } = data;
    if (req("billingType") && !data.billingType) e.billingType = "Billing type is required";

    if (billingType === "subscription") {
      if (req("stripePriceId") && !data.stripePriceId.trim()) e.stripePriceId = "Stripe Price ID is required";
      if (req("interval") && !data.interval) e.interval = "Interval is required";
    } else if (billingType === "prepaid") {
      if (req("initialCredits") && data.initialCredits <= 0) e.initialCredits = "Initial credits must be positive";
      if (req("quotaUnit") && !data.quotaUnit.trim()) e.quotaUnit = "Quota unit is required";
    } else if (billingType === "metered") {
      if (req("unitPrice") && data.unitPrice <= 0) e.unitPrice = "Unit price must be positive";
      if (req("quotaUnit") && !data.quotaUnit.trim()) e.quotaUnit = "Quota unit is required";
    }
    if (req("linkedGroups") && data.linkedGroups.length === 0) {
      e.linkedGroups = "At least one group must be linked";
    }
  }
  return e;
}
