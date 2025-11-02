// src/app/creator/endpoints/new/actions.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { createServerClient } from "@/lib/supabase/server";
import { endpointSchema } from "@/lib/validators/endpoint";
import type { EndpointFormData, TestResult } from "./types";

/**
 * エンドポイント作成（RLS対応：JWT注入 + created_by を明示挿入）
 */
export async function createEndpointAction(raw: EndpointFormData) {
  // 1) Clerk 認証（ユーザー確認 & Supabase用JWT発行）
  const { userId, getToken } = await auth();
  if (!userId) return { ok: false, message: "Unauthorized" };

  const jwt = await getToken({ template: "supabase" });
  if (!jwt) return { ok: false, message: "Failed to get Supabase token" };

  // 2) 入力バリデーション（Zod）
  const parsed = endpointSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const data = parsed.data;

  // 3) Supabase（ユーザー文脈付きクライアント）
  const sb = createServerClient(jwt);

  // 4) JSON フィールドを安全にパース
  let inputJson: any = null;
  let outputJson: any = null;
  if (data.inputSchema) {
    try {
      inputJson = JSON.parse(data.inputSchema);
    } catch {
      return {
        ok: false,
        fieldErrors: { inputSchema: ["Invalid JSON"] },
      };
    }
  }
  if (data.outputSchema) {
    try {
      outputJson = JSON.parse(data.outputSchema);
    } catch {
      return {
        ok: false,
        fieldErrors: { outputSchema: ["Invalid JSON"] },
      };
    }
  }

  // 5) 重複チェック（同一 Group 内の endpoint_name 重複防止）
  if (data.status !== "draft" && data.endpoint_name && data.groupId) {
    const { data: dup, error: dupErr } = await sb
      .from("api_endpoints")
      .select("id,endpoint_name,group_id")
      .eq("group_id", data.groupId)
      .ilike("endpoint_name", data.endpoint_name)
      .limit(1);

    if (dupErr) return { ok: false, message: dupErr.message };
    if (dup && dup.length > 0) {
      return {
        ok: false,
        fieldErrors: {
          endpoint_name: ["Endpoint name must be unique within the selected group"],
        },
      };
    }
  }

  // 6) INSERT（created_by を明示的に保存）
  const { data: inserted, error } = await sb
    .from("api_endpoints")
    .insert({
      plan_id: data.planId || null,
      group_id: data.groupId || null,
      endpoint_name: data.endpoint_name,
      path: data.path || null,          // Full URL を入れる運用
      method: data.method,              // enum: http_method_enum
      status: data.status,              // enum: launchify_status_enum
      description: data.description || null,
      input_schema: inputJson,
      output_schema: outputJson,
      visibility: data.visibility,      // enum: endpoint_visibility_enum
      is_primary: data.isPrimary ?? false,
      created_by: userId,               // ★ ここが肝（default auth.uid()は使わない）
    })
    .select("id")
    .single();

  if (error) return { ok: false, message: error.message };
  return { ok: true, id: inserted!.id as string };
}

/**
 * グループ作成（RLS対応：JWT注入 + created_by を明示挿入）
 */
export async function createGroupAction(planId: string, name: string) {
  const { userId, getToken } = await auth();
  if (!userId) return { ok: false, message: "Unauthorized" };

  const jwt = await getToken({ template: "supabase" });
  if (!jwt) return { ok: false, message: "Failed to get Supabase token" };

  const sb = createServerClient(jwt);

  const { data, error } = await sb
    .from("api_endpoint_groups")
    .insert({
      plan_id: planId || null,
      name: name.trim(),
      created_by: userId,               // ★ 明示挿入
    })
    .select("id")
    .single();

  if (error) return { ok: false, message: error.message };
  return { ok: true, id: data!.id as string };
}

/**
 * エンドポイント疎通テスト（GET/POSTなどを素直に叩く）
 * ※ 認証が必要な外部APIなら、必要に応じてHeader追加ロジックを拡張してください。
 */
export async function testEndpointAction(
  baseUrl: string,
  path: string,
  method: string
): Promise<TestResult> {
  if (!baseUrl || !path) return null;

  // path がフルURLの運用なら、そのまま使えるように判定
  const url = path.startsWith("http") ? path : `${baseUrl}${path}`;
  const t0 = Date.now();

  try {
    const res = await fetch(url, { method, cache: "no-store" });
    const latency = Date.now() - t0;
    const text = await res.text();
    return { success: res.ok, status: res.status, latency, response: text };
  } catch (e) {
    const latency = Date.now() - t0;
    return { success: false, status: 500, latency, response: "Request failed" };
  }
}
