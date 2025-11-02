// src/lib/log.ts
// 本物のエラーだけを出力する安全ロガー（v2：関数名を変更して旧コードと衝突回避）
export function logIfMeaningfulErrorV2(label: string, e: unknown) {
  if (!e || typeof e !== "object") return;

  const rec = e as Record<string, unknown>;
  if (Object.keys(rec).length === 0) return; // Supabase の “空エラー {}” を無視

  const msg = rec["message"];
  const details = rec["details"];
  const hint = rec["hint"];
  const hasMeaning =
    typeof msg === "string" || typeof details === "string" || typeof hint === "string";
  if (!hasMeaning) return;

  // 必要なら本番で抑止: if (process.env.NODE_ENV === "production") return;

  console.error(`[${label}]`, {
    message: typeof msg === "string" ? msg : null,
    details: typeof details === "string" ? details : null,
    hint: typeof hint === "string" ? hint : null,
    code: rec["code"] ?? null,
  });
}
