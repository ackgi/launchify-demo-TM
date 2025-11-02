import { z } from "zod";

/** 入力スキーマ（フォーム → サーバーアクション） */
export const endpointSchema = z
  .object({
    planId: z.string().trim().optional().default(""), // Plan紐づけ（任意）
    productId: z.string().trim().optional().default(""), // 旧互換
    groupId: z.string().trim().optional().default(""),  // Group紐づけ（任意）
    endpoint_name: z.string().trim().min(1, "Endpoint name is required"),
    path: z.string().trim().optional().default(""),
    method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"]),
    status: z.enum([
  "draft",           // 作成中
  "private",         // 限定公開（内部テスト）
  "restricted",      // 限定販売（B2B準備）
  "pending_public",  // 公開申請中
  "public",          // カタログ公開中
  "live",            // 商用運用中
  "paused",          // 一時停止
  "deprecated",      // 非推奨
  "disabled"         // 無効・削除済み
]),
    isPrimary: z.boolean(),
    description: z.string().optional().default(""),
    inputSchema: z.string().optional().default(""),
    outputSchema: z.string().optional().default(""),
    visibility: z.enum(["catalog", "unlisted", "invited", "internal"]),
  })
  .superRefine((val, ctx) => {
    /**
     * ✅ 登録独立性を確保しつつ、状態ごとのバリデーションを柔軟化
     * draft: endpoint_name のみ必須（完全自由）
     * preview: path は必須、planId/groupId は任意
     * public: path は必須、planId/groupId は「望ましい」(警告レベル)
     * deprecated/disabled: endpoint_name のみ必須
     */

    // draft は制約なし
    if (val.status === "draft") return;

    // preview / public では path のみ必須
    if (!val.path) {
      ctx.addIssue({
        path: ["path"],
        code: "custom",
        message: "Path is required for non-draft endpoints",
      });
    }

    // path 形式チェック（相対 or フルURL）
    if (val.path) {
      const isRelative = val.path.startsWith("/");
      const isFullUrl =
        val.path.startsWith("http://") || val.path.startsWith("https://");
      if (!isRelative && !isFullUrl) {
        ctx.addIssue({
          path: ["path"],
          code: "custom",
          message: "Path must start with / or include full URL (http/https)",
        });
      }
    }

    // 公開時（public）は planId/groupId が無い場合に警告（許容）
    if (val.status === "public" && (!val.planId || !val.groupId)) {
      console.warn(
        "⚠️ Warning: Public endpoint without plan/group — will be linked automatically when plan is published."
      );
      // ctx.addIssue() は呼ばず、警告ログのみに留める
    }

    // JSON 妥当性チェック
    for (const [k, v] of [
      ["inputSchema", val.inputSchema],
      ["outputSchema", val.outputSchema],
    ] as const) {
      if (v) {
        try {
          JSON.parse(v);
        } catch {
          ctx.addIssue({
            path: [k],
            code: "custom",
            message: "Invalid JSON format",
          });
        }
      }
    }
  });

/** サーバー側で使う型 */
export type EndpointInput = z.infer<typeof endpointSchema>;

/** DB挿入用行に整形（Supabaseのカラム名へ変換） */
export const toEndpointRow = (v: EndpointInput) => ({
  plan_id: v.planId || null,
  product_id: v.productId || null,
  group_id: v.groupId || null,
  endpoint_name: v.endpoint_name,
  path: v.path || null,
  method: v.method,
  status: v.status,
  is_primary: v.isPrimary,
  description: v.description || null,
  input_schema: v.inputSchema || null,
  output_schema: v.outputSchema || null,
  visibility: v.visibility,
});
