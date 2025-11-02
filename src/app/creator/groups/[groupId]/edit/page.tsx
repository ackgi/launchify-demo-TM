// src/app/creator/groups/[groupId]/edit/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { ArrowLeft, Trash2 } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase/client";

import GroupForm, { type GroupInput } from "../../_components/GroupForm";
import { Button } from "@/app/components/ui/Button";
import { Modal, ModalContent, ModalFooter } from "@/app/components/ui/Modal";

/** Supabaseから取得する行の型（必要項目のみ） */
type DbGroup = {
  group_name: string | null;
  description: string | null;
  plan_id: string | null;
  status: GroupInput["status"] | null;
  is_default: boolean | null;
  credential_source: string | null;
  auth_type: string | null;        // ← auth_kind ではなく auth_type 前提
  injection_config: unknown | null;
  secret_ref: string | null;
};

export default function EditGroupPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const router = useRouter();

  // ✅ Clerk から JWT を取り、トークン付き Supabase クライアントを生成
  const { getToken, isLoaded } = useAuth();
  const { user } = useUser();
  const [supabase, setSupabase] = useState<any>(null);

  const [initial, setInitial] = useState<Partial<GroupInput> | null>(null);
  const [loading, setLoading] = useState(true);

  // 削除モーダル
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  /** 🧠 安全なエラーロガー */
  function logIfMeaningfulError(label: string, error: unknown, data?: unknown) {
    if (!error && data == null) {
      console.info(`ℹ️ ${label}: no rows found (data=null, error=null)`);
      return;
    }
    if (typeof error === "object" && error && Object.keys(error as object).length === 0) {
      console.info(`ℹ️ ${label}: empty error object (maybe .maybeSingle() no row)`);
      return;
    }
    if (error) console.error(`❌ ${label}:`, error);
  }

  // 1) JWT を取得してから Supabase クライアントを作る（ここ超重要）
  useEffect(() => {
    if (!isLoaded) return;
    (async () => {
      const token = await getToken({ template: "supabase" }).catch(() => null);
      const client = createBrowserClient(token ?? undefined);
      setSupabase(client);

      // 任意の診断ログ
      console.log("👤 clerk.user.id:", user?.id);
      console.log("🪪 jwt head:", token ? token.slice(0, 50) + "..." : null);
    })();
  }, [isLoaded, getToken, user?.id]);

  // 2) グループ1件取得（RLSが効くので JWT 必須）
  useEffect(() => {
    if (!supabase || !groupId) return;
    let mounted = true;

    (async () => {
      try {
        setLoading(true);

        const { data, error, status } = await supabase
          .from("api_endpoint_groups")
          .select(
            "group_name, description, plan_id, status, is_default, credential_source, auth_type, injection_config, secret_ref"
          )
          .eq("id", String(groupId))
          .maybeSingle(); // ← 見つからなければ data=null / error=null になり得る

        if (!mounted) return;

        if (error || !data) {
          // 404系は「存在しない or RLS で見えない」の可能性
          if (!error && !data) {
            console.info(`ℹ️ fetch group (maybeSingle): no row for id=${groupId} (status=${status})`);
          } else {
            logIfMeaningfulError("fetch group (single)", error, data);
          }
          setInitial(null);
          setLoading(false);
          return;
        }

        // ✅ 正常取得
        const row = data as DbGroup;
        const injectionAsString =
          typeof row.injection_config === "string"
            ? row.injection_config
            : row.injection_config
            ? JSON.stringify(row.injection_config, null, 2)
            : "";

        setInitial({
          group_name: row.group_name ?? "",
          description: row.description ?? "",
          plan_id: row.plan_id ?? null,
          status: (row.status ?? "draft") as GroupInput["status"],
          is_default: row.is_default ?? false,
          credential_source: (row.credential_source ?? "none") as any,
          auth_type: (row.auth_type ?? "none") as any,
          injection_config: injectionAsString,
          secret_ref: row.secret_ref ?? "",
        });
      } catch (err) {
        console.error("🔥 fetch group (exception):", err);
        setInitial(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [supabase, groupId]);

  // 3) 削除
  const handleDelete = async () => {
    if (!supabase) return;
    setDeleting(true);
    const { error } = await supabase
      .from("api_endpoint_groups")
      .delete()
      .eq("id", String(groupId));
    setDeleting(false);

    if (error) {
      console.error("❌ delete group:", error);
      alert("Failed to delete group");
      return;
    }
    router.push("/creator/groups");
  };

  if (loading) {
    return <div className="text-center py-16 text-gray-500">Loading group…</div>;
  }

  if (!initial) {
    // 見えない理由は 1) IDが存在しない 2) RLS で不可視（他人のデータ）のどちらか
    return <div className="text-center py-16 text-red-600">Group not found.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={() => router.push("/creator/groups")}
            className="flex items-center gap-2"
            title="Back to Groups"
          >
            <ArrowLeft size={16} />
            Back to Groups
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Edit Endpoint Group</h1>
        </div>

        <Button
          variant="danger"
          onClick={() => setShowDeleteModal(true)}
          title="Delete this group"
        >
          <Trash2 size={16} className="mr-2" />
          Delete Group
        </Button>
      </div>

      {/* 共通フォーム */}
      <GroupForm groupId={String(groupId)} initialData={initial} />

      {/* Delete Confirmation */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Group"
      >
        <ModalContent>
          <div className="text-center">
            <p className="text-gray-700">
              This action cannot be undone. Do you really want to delete this group?
            </p>
          </div>
        </ModalContent>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
