// src/lib/supabase/client.ts
"use client";

import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

let _clientAnon: SupabaseClient | null = null;

/**
 * ブラウザ用 Supabase クライアント
 * - token が「非空の文字列」のときだけ Authorization を付与
 * - persistSession を false にしてキャッシュを完全無効化
 * - schema: "public" を明示してキャッシュ再読込を強制
 */
export function createBrowserClient(token?: unknown): SupabaseClient {
  const isValidToken = typeof token === "string" && token.trim().length > 0;

  if (!isValidToken) {
    console.warn("⚠️ Supabaseクライアント作成：JWTなし（匿名モード）");
    // 匿名クライアントもキャッシュせず毎回再生成（古い型キャッシュを避ける）
    return createSupabaseClient(URL, ANON, {
      db: { schema: "public" },
      auth: { persistSession: false },
    });
  }

  // 🔍 Clerkトークンが渡っているか確認
  const shortToken = (token as string).slice(0, 50);
  console.log("🪪 Supabaseクライアント作成：Clerk JWT付き →", shortToken + "...");

  return createSupabaseClient(URL, ANON, {
    global: {
      headers: {
        Authorization: `Bearer ${token as string}`,
      },
    },
    db: { schema: "public" }, // ✅ 明示
    auth: { persistSession: false }, // ✅ キャッシュ無効化
  });
}
