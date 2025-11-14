// src/app/creator/plans/components/PlanTemplateConfig.tsx
/* cspell:disable */

import { CreditCard, Zap, Shield } from "lucide-react";
import type {
  PlanFormData,
  PlanStatus,
  TemplateKey,
  TemplateConfig,
  IconKey,
} from "./types";

/**
 * テンプレカードで使うアイコンマップ
 */
export const iconMap = {
  zap: Zap,
  "credit-card": CreditCard,
  shield: Shield,
} as const;

/**
 * テンプレ定義（必要なら外部から上書き可）
 */
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

/** 🔧 自動管理とロックの定義
 * - AUTO_STATUSES: public / live（← paused は手動操作のため除外）
 * - LOCKED_STATUSES: disabled
 */
export const AUTO_STATUSES: PlanStatus[] = ["public", "live"];
export const LOCKED_STATUSES: PlanStatus[] = ["disabled"];

/** UIでユーザーが選べるのは下記4つのみ */
export const EDITABLE_STATUSES: PlanStatus[] = [
  "draft",
  "private",
  "restricted",
  "pending_public",
];

/**
 * status / billingType ごとの必須項目判定
 */
export function isRequired(
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
