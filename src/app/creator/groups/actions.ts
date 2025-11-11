"use server";

import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

type Result =
  | { ok: true; unlinked: number }
  | { ok: false; message: string; code?: string; remaining?: number };

export async function deleteGroupAction(groupId: string): Promise<Result> {
  const { userId } = await auth();
  if (!userId) return { ok: false, message: "Unauthorized" };
  if (!groupId) return { ok: false, message: "Invalid group id" };

  // 0) Group の所有チェック
  const { data: groupRow, error: eGet } = await supabaseAdmin
    .from("api_endpoint_groups")
    .select("id, created_by")
    .eq("id", groupId)
    .maybeSingle();

  if (eGet) return { ok: false, message: eGet.message, code: (eGet as any).code };
  if (!groupRow || groupRow.created_by !== userId) {
    return { ok: false, message: "Not owner or not found" };
  }

  // 1) 本人の Endpoint だけ unlink（group_id → null）
  const { data: unlinkedRows, error: eUnlink } = await supabaseAdmin
    .from("api_endpoints")
    .update({ group_id: null })
    .eq("group_id", groupId)
    .eq("created_by", userId)
    .select("id"); // returning

  if (eUnlink) {
    return { ok: false, message: eUnlink.message, code: (eUnlink as any).code };
  }

  // 2) まだ参照が残っていないか（= 他ユーザーの Endpoint が参照中か）
  const { count: remainCnt, error: eRemain } = await supabaseAdmin
    .from("api_endpoints")
    .select("id", { count: "exact", head: true })
    .eq("group_id", groupId);

  if (eRemain) {
    return { ok: false, message: eRemain.message, code: (eRemain as any).code };
  }
  if ((remainCnt ?? 0) > 0) {
    // 他人の Endpoint が参照中 → 削除中止
    return {
      ok: false,
      message:
        "This group is still referenced by endpoints you don't own. Unassign or transfer them before deleting.",
      code: "FK_REFERENCES_REMAIN",
      remaining: remainCnt ?? 0,
    };
  }

  // 3) Group を削除（本人のものだけ）
  const { error: eDelete } = await supabaseAdmin
    .from("api_endpoint_groups")
    .delete()
    .eq("id", groupId)
    .eq("created_by", userId);

  if (eDelete) {
    return { ok: false, message: eDelete.message, code: (eDelete as any).code };
  }

  return { ok: true, unlinked: Array.isArray(unlinkedRows) ? unlinkedRows.length : 0 };
}
