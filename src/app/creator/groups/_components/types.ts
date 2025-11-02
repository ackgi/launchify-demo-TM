export type GroupStatus =
  | "draft"
  | "private"
  | "pending_public"
  | "public"
  | "deprecated"
  | "disabled";

export type GroupRow = {
  id: string;
  plan_id: string | null;
  group_name: string;
  description: string | null;
  is_default: boolean;
  status: GroupStatus | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type PlanShort = {
  id: string;
  plan_name: string | null;
};
