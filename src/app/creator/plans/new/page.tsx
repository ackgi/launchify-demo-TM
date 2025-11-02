// src/app/creator/plans/new/page.tsx
"use client";

import NewPlanPageClient from "./NewPlanPageClient";

/**
 * ✅ 修正版ポイント
 * - URLに productId は不要
 * - ここはサーバーコンポーネントでなくクライアントでOK
 * - Clerk認証＋Supabase作成は NewPlanPageClient に委譲
 */
export default function NewPlanPage() {
  return <NewPlanPageClient />;
}
