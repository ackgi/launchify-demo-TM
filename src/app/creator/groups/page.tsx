// src/app/creator/groups/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { createBrowserClient } from "@/lib/supabase/client";
import { Plus, Edit, Eye, Trash2 } from "lucide-react";

import { Button } from "@/app/components/ui/Button";
import { Card, CardContent } from "@/app/components/ui/Card";
import { VerificationBadge } from "@/app/components/common/VerificationBadge";

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

export default function GroupsIndexPage() {
  const router = useRouter();
  const { getToken, isLoaded } = useAuth();
  const { user } = useUser();

  const [supabase, setSupabase] = useState<any>(null);
  const [rows, setRows] = useState<GroupRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Clerk JWT を添付した Supabase クライアント
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

  // 行削除（楽観的 UI + 失敗時ロールバック）
  const handleDelete = async (g: GroupRow) => {
    const ok = confirm(`Delete group "${g.group_name ?? "(untitled)"}"?`);
    if (!ok || !supabase) return;

    const snapshot = rows; // ロールバック用
    setDeletingId(g.id);
    // 楽観的にUIから消す
    setRows((prev) => prev.filter((x) => x.id !== g.id));

    try {
      const { error, status } = await supabase
        .from("api_endpoint_groups")
        .delete()
        .eq("id", g.id);

      if (error) {
        console.error(`❌ delete group (status ${status}):`, error);
        alert(`Failed to delete group: ${error.message ?? "unknown error"}`);
        // ロールバック
        setRows(snapshot);
      } else {
        // 成功: 何もしない（既にUIから消えている）
      }
    } catch (e) {
      console.error("🔥 delete group (exception):", e);
      alert("Unexpected error while deleting group.");
      setRows(snapshot);
    } finally {
      setDeletingId(null);
    }
  };

  // ---------- UI ----------
  if (loading) {
    return <div className="text-center py-16 text-gray-500">Loading groups…</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your API Endpoint Groups</h1>
          <p className="text-gray-600">Manage your endpoint groups and their settings</p>
        </div>
        <Button onClick={() => router.push("/creator/groups/new")} size="sm">
          <Plus size={16} className="mr-2" /> New Group
        </Button>
      </div>

      {/* Empty state */}
      {rows.length === 0 ? (
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
                  {rows.map((g) => (
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

                      <td className="py-4 px-6">
                        <VerificationBadge
                          status={(g.status as any) || "success"}
                          lastChecked={new Date(g.created_at).toISOString()}
                        />
                      </td>

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
