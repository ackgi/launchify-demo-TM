/** @jsxImportSource react */
import { CreditCard, Zap, Shield } from "lucide-react";
import { TemplateConfig, TemplateKey, PlanStatus } from "../types";

export const iconMap = { zap: Zap, "credit-card": CreditCard, shield: Shield } as const;

export const AUTO_STATUSES: PlanStatus[] = ["public", "live", "paused"];
export const LOCKED_STATUSES: PlanStatus[] = ["disabled"];

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
