"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { createBrowserClient } from "@/lib/supabase/client";
import { Plus, Edit, Trash2 } from "lucide-react";

import { Button } from "@/app/components/ui/Button";
import { Card, CardContent } from "@/app/components/ui/Card";
import Badge from "@/app/components/ui/Badge";
import { deleteGroupAction } from "./actions";

type GroupRow = {
  id: string;
  group_name: string | null;
  description: string | null;
  plan_id: string | null;
  status: string | null;
  is_default: boolean | null;
  credential_source: string | null;
  auth_type: string | null;
  injection_config: unknown | null;
  secret_ref: string | null;
  created_at: string;
  created_by: string | null;
};

function isGroupRowArray(v: unknown): v is GroupRow[] {
  return Array.isArray(v) && v.every((o) => o && typeof o === "object" && "id" in (o as any));
}

/** Statusピルを描画（VerificationBadge非依存） */
function renderGroupStatusPill(s: string | null | undefined) {
  const v = (s ?? "unknown").toLowerCase();

  let variant: "success" | "warning" | "neutral" | "error" | "info" = "neutral";
  switch (v) {
    case "public":
    case "live":
      variant = "success";
      break;
    case "pending_public":
    case "private":
    case "restricted":
    case "paused":
      variant = "warning";
      break;
    case "deprecated":
    case "disabled":
      variant = "error";
      break;
    case "draft":
    default:
      variant = "neutral";
      break;
  }

  return (
    <Badge variant={variant} size="sm" className="capitalize">
      {v}
    </Badge>
  );
}

export default function GroupsIndexPage() {
  const router = useRouter();
  const { getToken, isLoaded } = useAuth();
  const { user } = useUser();

  const [supabase, setSupabase] = useState<any>(null);
  const [rows, setRows] = useState<GroupRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [q, setQ] = useState("");

  // Clerk JWT を添付した Supabase クライアント作成（取得用のみ）
  useEffect(() => {
    if (!isLoaded) return;
    (async () => {
      const token = await getToken({ template: "supabase" }).catch(() => null);
      setSupabase(createBrowserClient(token ?? undefined));
    })();
  }, [isLoaded, getToken]);

  // 一覧取得
  useEffect(() => {
    if (!supabase || !user?.id) return;
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("api_endpoint_groups")
          .select(
            [
              "id",
              "group_name",
              "description",
              "plan_id",
              "status",
              "is_default",
              "credential_source",
              "auth_type",
              "injection_config",
              "secret_ref",
              "created_at",
              "created_by",
            ].join(",")
          )
          .order("created_at", { ascending: false });

        if (!mounted) return;
        if (error) {
          console.error("❌ fetch groups:", error);
          setRows([]);
          return;
        }
        setRows(isGroupRowArray(data) ? data : []);
      } catch (err) {
        if (mounted) setRows([]);
        console.error("🔥 fetch groups (exception):", err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [supabase, user?.id]);

  // 行削除（サーバーアクション経由／非カスケード：子は残す＝unlink）
  const handleDelete = async (g: GroupRow) => {
    const ok = confirm(
      `Delete group "${g.group_name ?? "(untitled)"}"?\n` +
        `Endpoints linked to this group will be kept and become "unassigned".`
    );
    if (!ok) return;

    const snapshot = rows;
    setDeletingId(g.id);
    setRows((prev) => prev.filter((x) => x.id !== g.id));

    try {
      const res = await deleteGroupAction(g.id);

      if (!res.ok) {
        console.error("❌ delete group (server):", res);
        alert(
          `Failed to delete group: ${
            res.message ??
            (res.code === "FK_REFERENCES_REMAIN"
              ? "The group is still referenced by endpoints."
              : "unknown error")
          }`
        );
        setRows(snapshot);
        return;
      }

      // 任意: unlink 件数をトースト等で表示したければここで
      if (res.unlinked && res.unlinked > 0) {
        console.info(`Unlinked ${res.unlinked} endpoints from this group.`);
      }
    } catch (e: any) {
      console.error("🔥 delete group (exception):", e);
      alert("Unexpected error while deleting group.");
      setRows(snapshot);
    } finally {
      setDeletingId(null);
    }
  };

  // 🔍 フィルター処理
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((r) => {
      const hay = `${r.group_name ?? ""} ${r.status ?? ""} ${r.auth_type ?? ""}`.toLowerCase();
      return hay.includes(needle);
    });
  }, [rows, q]);

  if (loading) {
    return <div className="text-center py-16 text-gray-500">Loading groups…</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your API Endpoint Groups</h1>
        </div>
        <Button onClick={() => router.push("/creator/groups/new")} size="sm">
          <Plus size={16} className="mr-2" /> New Group
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <label htmlFor="groupSearch" className="sr-only">
          Search groups
        </label>
        <input
          id="groupSearch"
          name="search"
          type="search"
          placeholder="Search groups…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full max-w-md border border-gray-300 rounded-lg px-3 py-2"
        />
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <Card className="rounded-2xl">
          <CardContent className="py-20 text-center text-gray-600">
            <div className="text-lg font-medium mb-2">No Endpoint Groups Yet</div>
            <div>Create endpoint groups to organize your API functionality.</div>
          </CardContent>
        </Card>
      ) : (
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-600 border-b border-gray-200">
                    <th className="py-4 px-6">Group</th>
                    <th className="py-4 px-6">Plan</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6">Auth</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((g) => (
                    <tr
                      key={g.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="font-medium text-gray-900">
                          {g.group_name ?? "(untitled)"}
                        </div>
                        {g.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xl">
                            {g.description}
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-6">{g.plan_id ?? "—"}</td>

                      {/* 自前のピル表示 */}
                      <td className="py-4 px-6">{renderGroupStatusPill(g.status)}</td>

                      <td className="py-4 px-6">{g.auth_type ?? "none"}</td>

                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Edit"
                            onClick={() => router.push(`/creator/groups/${g.id}/edit`)}
                          >
                            <Edit size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            title="Delete"
                            onClick={() => handleDelete(g)}
                            disabled={deletingId === g.id}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
