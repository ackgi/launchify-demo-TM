// src/app/creator/endpoints/actions.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// ✅ 型を広げる：成功でも deleted を持てるように
type ActionResult =
  | { ok: true; deleted?: number }
  | { ok: false; message: string; code?: string; deleted?: number };

const looksLikeUuid = (s: string) => /^[0-9a-fA-F-]{16,}$/.test(s);

export async function deleteEndpointAction(id: string): Promise<ActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) return { ok: false, message: "Unauthorized" };
    if (!id || !looksLikeUuid(id)) return { ok: false, message: "Invalid id" };

    const { data, error } = await supabaseAdmin
      .from("api_endpoints")
      .delete()
      .eq("id", id)
      .eq("created_by", userId) // Clerk userId と比較
      .select("id")
      .maybeSingle();

    if (error) {
      return { ok: false, message: error.message, code: (error as any).code };
    }
    if (!data) {
      return { ok: false, message: "Not owner or not found" };
    }
    return { ok: true };
  } catch (e: any) {
    return { ok: false, message: e?.message ?? "Unexpected error" };
  }
}

export async function bulkDeleteAction(ids: string[]): Promise<ActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) return { ok: false, message: "Unauthorized", deleted: 0 };

    const validIds = (ids ?? []).filter((x) => x && looksLikeUuid(x));
    if (validIds.length === 0) return { ok: false, message: "No valid ids", deleted: 0 };

    const { data, error } = await supabaseAdmin
      .from("api_endpoints")
      .delete()
      .in("id", validIds)
      .eq("created_by", userId)
      .select("id"); // returning 複数

    if (error) {
      return {
        ok: false,
        message: error.message,
        code: (error as any).code,
        deleted: 0,
      };
    }

    const deleted = Array.isArray(data) ? data.length : 0;
    if (deleted === 0) {
      return { ok: false, message: "Not owner or not found", deleted: 0 };
    }
    // ✅ ok: true でも deleted を返せる
    return { ok: true, deleted };
  } catch (e: any) {
    return { ok: false, message: e?.message ?? "Unexpected error", deleted: 0 };
  }
}
