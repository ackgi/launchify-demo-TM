"use client";

import { CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";
import Badge from "@/app/components/ui/Badge";

type VerificationStatus =
  | "success" | "verified" | "ok" | "healthy" | "operational"
  | "failure" | "failed" | "error" | "down"
  | "warning" | "degraded" | "partial"
  | "unknown" | "pending";

interface VerificationBadgeProps {
  status: VerificationStatus;
  lastChecked?: string | Date;
  showTime?: boolean;
  /** Badgeサイズ（Badgeが size="sm" をサポートしている前提） */
  size?: "sm" | "md";
}

export function VerificationBadge({
  status,
  lastChecked,
  showTime = false,
  size = "sm",
}: VerificationBadgeProps) {
  // ステータスを4系統に正規化
  const normalized = (() => {
    const s = status.toLowerCase();
    if (["success", "verified", "ok", "healthy", "operational"].includes(s)) return "ok" as const;
    if (["failure", "failed", "error", "down"].includes(s)) return "err" as const;
    if (["warning", "degraded", "partial"].includes(s)) return "warn" as const;
    return "unk" as const;
  })();

  const config = {
    ok:   { variant: "success" as const, Icon: CheckCircle, text: "Verified" },
    warn: { variant: "warning" as const, Icon: AlertTriangle, text: "Degraded" },
    err:  { variant: "error"   as const, Icon: XCircle,      text: "Failed"   },
    unk:  { variant: "neutral" as const, Icon: Clock,        text: "Unknown"  },
  }[normalized];

  const formatTime = (ts: string | Date) => {
    const d = ts instanceof Date ? ts : new Date(ts);
    const diffMs = Date.now() - d.getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  const { variant, Icon, text } = config;

  return (
    <div className="flex items-center gap-2">
      <Badge variant={variant} size={size} className="flex items-center gap-1">
        <Icon size={12} />
        {text}
      </Badge>
      {showTime && lastChecked && (
        <span className="text-xs text-gray-500">{formatTime(lastChecked)}</span>
      )}
    </div>
  );
}
