import Badge from "@/app/components/ui/Badge";
import type { GroupStatus } from "./types";

export const STATUS_BADGE_VARIANT: Record<GroupStatus, "neutral" | "warning" | "info" | "success" | "error"> = {
  draft: "neutral",
  private: "warning",
  pending_public: "info",
  public: "success",
  deprecated: "neutral",
  disabled: "error",
};

export default function GroupStatusBadge({ status }: { status: GroupStatus | null }) {
  if (!status) return null;
  return <Badge variant={STATUS_BADGE_VARIANT[status]}>{status}</Badge>;
}
