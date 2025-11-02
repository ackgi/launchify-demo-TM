// src/lib/supabase/server.ts
import "server-only";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY ?? "";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    "Missing Supabase anon credentials. Need NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
  );
}

/**
 * Clerk の JWT を Authorization ヘッダーに注入して
 * サーバー側 Supabase クライアントを生成（RLS 有効）
 */
export function createServerClient(jwt?: string) {
  const token = jwt?.trim();
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      // JWT がある場合のみ Authorization を送る
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
    auth: {
      persistSession: false,      // サーバーなのでセッション永続化は不要
      detectSessionInUrl: false,  // サーバーでのURLフラグメント検出を無効化
    },
  });
}
