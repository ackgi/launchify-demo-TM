// 共通型
export type PlanStatus =
  | "draft"
  | "private"
  | "restricted"
  | "pending_public"
  | "public"
  | "live"
  | "paused"
  | "deprecated"
  | "disabled";

export interface PlanFormData {
  name: string;
  templateKey: "free" | "pro" | "enterprise" | null;
  billingType: "subscription" | "prepaid" | "metered";
  status: PlanStatus;

  // Subscription（UIのみ）
  stripePriceId: string;
  interval: "month" | "year";
  price: number; // UIのみ

  // 共通上限
  monthlyQuota: number;
  trialDays: number;
  cancelAtPeriodEnd: boolean;

  // Prepaid
  initialCredits: number;
  quotaUnit: string;
  carryOver: boolean;

  // Metered
  unitPrice: number;
  monthlyCap: number;
  minimumCharge: number;

  // Group link
  linkedGroups: string[];
}

export type IconKey = "zap" | "credit-card" | "shield";
export type TemplateKey = "free" | "pro" | "enterprise";

export type TemplateConfig = {
  label: string;
  description: string;
  iconKey: IconKey;
  bgColor: string;
  bgImage?: string | null;
  apply: (p: PlanFormData) => PlanFormData;
};

export type EndpointGroupLite = {
  id: string;
  name: string;
  description?: string;
  category?: "light" | "heavy" | "general" | string;
  endpointCount?: number;
  loadLevel?: string;
  isDefault?: boolean;
};
