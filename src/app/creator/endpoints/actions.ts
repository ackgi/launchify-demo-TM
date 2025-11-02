// src/app/creator/endpoints/actions.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function deleteEndpointAction(id: string) {
  const { userId } = await auth();
  if (!userId) return { ok: false, message: "Unauthorized" };

  // Clerk → profiles.id を取得
  const { data: profile, error: eProfile } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("clerk_user_id", userId)
    .single();

  if (eProfile || !profile) return { ok: false, message: "Profile not found" };

  // 所有権チェック
  const { count, error: eCheck } = await supabaseAdmin
    .from("api_endpoints")
    .select("id", { count: "exact", head: true })
    .eq("id", id)
    .eq("created_by", profile.id);

  if (eCheck) return { ok: false, message: eCheck.message };
  if (!count) return { ok: false, message: "Not owner or not found" };

  const { error: eDel } = await supabaseAdmin
    .from("api_endpoints")
    .delete()
    .eq("id", id);

  if (eDel) return { ok: false, message: eDel.message };
  return { ok: true };
}

export async function bulkDeleteAction(ids: string[]) {
  const { userId } = await auth();
  if (!userId) return { ok: false, message: "Unauthorized" };

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("clerk_user_id", userId)
    .single();
  if (!profile) return { ok: false, message: "Profile not found" };

  // 自分のものだけ削除
  const { data, error } = await supabaseAdmin
    .from("api_endpoints")
    .delete()
    .in("id", ids)
    .eq("created_by", profile.id)
    .select("id");

  if (error) return { ok: false, message: error.message };
  const deleted = Array.isArray(data) ? data.length : 0;
  return { ok: true, deleted };
}
