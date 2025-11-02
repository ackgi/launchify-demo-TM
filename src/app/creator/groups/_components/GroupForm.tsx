// src/app/creator/groups/_components/GroupForm.tsx
"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { createBrowserClient } from "@/lib/supabase/client";
import { Card, CardHeader, CardContent } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import GroupStatusBadge from "./GroupStatusBadge";

// ---------- Types ----------
export type GroupStatus =
  | "draft"
  | "private"
  | "pending_public"
  | "public"
  | "deprecated"
  | "disabled";

type CredentialSource = "none" | "vault" | "env" | "inline";
type AuthType = "none" | "api_key" | "bearer" | "basic" | "custom";

export type GroupInput = {
  plan_id: string | null;
  group_name: string;
  description: string | null;
  status: GroupStatus;
  is_default: boolean;
  credential_source: CredentialSource;
  auth_type: AuthType;              // ← 統一
  injection_config: string;         // JSON string (UI入力用)
  secret_ref: string | null;
};

type PlanShort = { id: string; plan_name: string | null };
type Props = { groupId?: string; initialData?: Partial<GroupInput> };

// ---------- Component ----------
export default function GroupForm({ groupId, initialData }: Props) {
  const { isLoaded, getToken } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  // ---------- States ----------
  const [supabase, setSupabase] = useState<any>(null);
  const [plans, setPlans] = useState<PlanShort[]>([]);
  const [plansError, setPlansError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState<GroupInput>({
    plan_id: initialData?.plan_id ?? null,
    group_name: initialData?.group_name ?? "",
    description: initialData?.description ?? "",
    status: (initialData?.status as GroupStatus) ?? "draft",
    is_default: initialData?.is_default ?? false,
    credential_source:
      (initialData?.credential_source as CredentialSource) ?? "none",
    auth_type: (initialData?.auth_type as AuthType) ?? "none",    // ← 統一
    injection_config: initialData?.injection_config ?? "",
    secret_ref: initialData?.secret_ref ?? "",
  });

  // ---------- Effects ----------
  useEffect(() => {
    if (!isLoaded) return;
    let cancelled = false;

    (async () => {
      const token = await getToken({ template: "supabase" }).catch(() => null);
      const client = createBrowserClient(token ?? undefined);
      if (!cancelled) setSupabase(client);
      try {
        const { data, error } = await client.auth.getSession();
        console.log("[auth.getSession]", { hasSession: !!data?.session, error });
      } catch (e) {
        console.warn("[auth.getSession] unexpected:", e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, getToken]);

  // Plans 読み込み
  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;

    (async () => {
      setPlansError(null);
      try {
        const { data, error, status } = await supabase
          .from("api_plans")
          .select("id, plan_name")
          .order("created_at", { ascending: false });

        if (cancelled) return;

        if (error) {
          if (status === 401 || status === 403) {
            console.warn("load plans got", status, "→ continue with empty list");
            setPlans([]);
            return;
          }
          const friendly =
            (error as any)?.message ??
            (error as any)?.hint ??
            (error as any)?.details ??
            (error as any)?.code ??
            "Unknown error";
          console.error("❌ load plans error (status " + status + "):", {
            message: (error as any)?.message,
            details: (error as any)?.details,
            hint: (error as any)?.hint,
            code: (error as any)?.code,
            raw: error,
          });
          setPlansError(`Failed to load plans (status ${status ?? "?"}): ${friendly}`);
          setPlans([]);
          return;
        }

        setPlans((data ?? []) as PlanShort[]);
      } catch (e: any) {
        if (!cancelled) {
          console.error("🔥 Unexpected error while loading plans:", e);
          setPlansError(`Unexpected error while loading plans: ${e?.message ?? String(e)}`);
          setPlans([]);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [supabase]);

  // ---------- IDs ----------
  const idPlan = useId();
  const idName = useId();
  const idDesc = useId();
  const idStatus = useId();
  const idDefault = useId();
  const idCred = useId();
  const idKind = useId();
  const idInj = useId();
  const idSecret = useId();

  // ---------- Options ----------
  const statusOptions: { value: GroupStatus; label: string }[] = useMemo(
    () => [
      { value: "draft", label: "Draft" },
      { value: "private", label: "Private" },
      { value: "pending_public", label: "Pending Public" },
      { value: "public", label: "Public" },
      { value: "deprecated", label: "Deprecated" },
      { value: "disabled", label: "Disabled" },
    ],
    []
  );

  const credentialOptions: { value: CredentialSource; label: string }[] = useMemo(
    () => [
      { value: "none", label: "None" },
      { value: "vault", label: "Vault (KMS/Secrets Manager)" },
      { value: "env", label: "Environment Variable" },
      { value: "inline", label: "Inline (Not Recommended)" },
    ],
    []
  );

  const authTypeOptions: { value: AuthType; label: string }[] = useMemo(
    () => [
      { value: "none", label: "None" },
      { value: "api_key", label: "API Key in Header/Query" },
      { value: "bearer", label: "Bearer Token" },
      { value: "basic", label: "Basic Auth" },
      { value: "custom", label: "Custom (Add in injection_config)" },
    ],
    []
  );

  // ---------- Validation ----------
  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.group_name.trim()) e.group_name = "Group name is required";
    if (form.group_name.length > 40) e.group_name = "Group name must be 40 characters or less";
    if (form.status !== "draft" && !form.plan_id) e.plan_id = "Plan is required unless status is draft";
    if (form.injection_config) {
      try { JSON.parse(form.injection_config); } catch { e.injection_config = "Injection Configuration must be valid JSON"; }
    }
    if (form.credential_source !== "none" && !form.secret_ref?.trim())
      e.secret_ref = "Secret reference is required when credential source is not 'none'";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ---------- Save ----------
  const onSave = async () => {
    if (!validate()) return;
    if (!user?.id && !groupId) {
      alert("You must be signed in to create a group.");
      return;
    }
    setSaving(true);
    console.group("💾 Group Save Process");

    const payload = {
      plan_id: form.plan_id,
      group_name: form.group_name,
      description: form.description,
      status: form.status,
      is_default: form.is_default,
      credential_source: form.credential_source,
      auth_type: form.auth_type, // ← 統一
      injection_config: form.injection_config ? JSON.parse(form.injection_config) : null,
      secret_ref: form.secret_ref || null,
    };

    try {
      if (groupId) {
        const { error } = await supabase
          .from("api_endpoint_groups")
          .update({ ...payload, updated_at: new Date().toISOString() })
          .eq("id", groupId);
        if (error) {
          console.error("update group error:", error);
          alert("Failed to save group");
          return;
        }
        console.log("✅ Update success");
        router.push("/creator/groups");
      } else {
        // サーバーAPI経由（/api/groups は auth_type を受け付ける実装に修正済み）
        const res = await fetch("/api/groups", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const status = res.status;
          const text = await res.text().catch(() => "");
          let parsed: any = {};
          try { parsed = JSON.parse(text); } catch {}
          console.error("POST /api/groups failed:", { status, parsed, text });
          alert(`Failed to create group: ${parsed?.error ?? res.statusText}`);
          return;
        }

        const j = await res.json().catch(() => ({}));
        if (j?.id) {
          console.log("✅ Insert success, id:", j.id);
          router.push(`/creator/groups/${j.id}/edit`);
        } else {
          console.warn("Insert success but id unresolved; back to list.");
          router.push(`/creator/groups`);
        }
      }
    } catch (err: any) {
      console.error("🔥 Unexpected onSave error:", err);
      alert("Unexpected error during save. Check console.");
    } finally {
      console.groupEnd();
      setSaving(false);
    }
  };

  // ---------- UI ----------
  const sessionReady = !!supabase;

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold text-gray-900">
          {groupId ? "Edit Endpoint Group" : "Create Endpoint Group"}
        </h2>
        <p className="text-sm text-gray-600">
          {groupId ? "Update the group settings." : "Define a new group for your API endpoints."}
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {!sessionReady ? (
          <p className="text-gray-600 text-center py-8">Loading authentication session…</p>
        ) : (
          <>
            {plansError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {plansError}
              </div>
            )}

            {/* Linked Plan */}
            <div>
              <label htmlFor={idPlan} className="block text-sm font-medium text-gray-700 mb-2">
                Linked Plan
              </label>
              <select
                id={idPlan}
                value={form.plan_id ?? ""}
                onChange={(e) => setForm({ ...form, plan_id: e.target.value || null })}
                aria-invalid={errors.plan_id ? true : undefined}
                className={`w-full px-3 py-2 border rounded-lg ${errors.plan_id ? "border-red-300" : "border-gray-300"}`}
              >
                <option value="">—</option>
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.plan_name ?? "(untitled)"}
                  </option>
                ))}
              </select>
              {errors.plan_id && <p className="mt-1 text-sm text-red-600">{errors.plan_id}</p>}
            </div>

            {/* Group Name */}
            <div>
              <label htmlFor={idName} className="block text-sm font-medium text-gray-700 mb-2">
                Group Name *
              </label>
              <input
                id={idName}
                value={form.group_name}
                onChange={(e) => setForm({ ...form, group_name: e.target.value })}
                maxLength={40}
                aria-invalid={errors.group_name ? true : undefined}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.group_name ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="e.g. Core API Access"
              />
              {errors.group_name && <p className="mt-1 text-sm text-red-600">{errors.group_name}</p>}
            </div>

            {/* Description */}
            <div>
              <label htmlFor={idDesc} className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id={idDesc}
                value={form.description ?? ""}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg border-gray-300"
                placeholder="Notes about this endpoint group (optional)"
              />
            </div>

            {/* Status */}
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor={idStatus} className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <GroupStatusBadge status={form.status} />
              </div>
              <select
                id={idStatus}
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as GroupStatus })}
                className="w-full px-3 py-2 border rounded-lg border-gray-300"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Only <code>draft</code> allows missing plan. Others require a linked plan.
              </p>
            </div>

            {/* Is Default */}
            <div className="flex items-center gap-3">
              <input
                id={idDefault}
                type="checkbox"
                checked={form.is_default}
                onChange={(e) => setForm({ ...form, is_default: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300"
              />
              <label htmlFor={idDefault} className="text-sm text-gray-700">
                Mark as default group for this creator/product
              </label>
            </div>

            {/* Credential Source */}
            <div>
              <label htmlFor={idCred} className="block text-sm font-medium text-gray-700 mb-2">
                Credential Source
              </label>
              <select
                id={idCred}
                value={form.credential_source}
                onChange={(e) => setForm({ ...form, credential_source: e.target.value as CredentialSource })}
                className="w-full px-3 py-2 border rounded-lg border-gray-300"
              >
                {credentialOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">Choose where secrets (e.g., API keys) are sourced from.</p>
            </div>

            {/* Auth Type */}
            <div>
              <label htmlFor={idKind} className="block text-sm font-medium text-gray-700 mb-2">
                Auth Type
              </label>
              <select
                id={idKind}
                value={form.auth_type}
                onChange={(e) => setForm({ ...form, auth_type: e.target.value as AuthType })}
                className="w-full px-3 py-2 border rounded-lg border-gray-300"
              >
                {authTypeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Configure header/query injection via <code>injection_config</code> if needed.
              </p>
            </div>

            {/* Injection Config (JSON) */}
            <div>
              <label htmlFor={idInj} className="block text-sm font-medium text-gray-700 mb-2">
                Injection Configuration (JSON)
              </label>
              <textarea
                id={idInj}
                value={form.injection_config}
                onChange={(e) => setForm({ ...form, injection_config: e.target.value })}
                rows={6}
                className={`w-full px-3 py-2 border rounded-lg ${
                  errors.injection_config ? "border-red-300" : "border-gray-300"
                }`}
                placeholder={`{
  "headers": { "Authorization": "Bearer {{secret:OPENAI_TOKEN}}" },
  "query": { "api_key": "{{secret:API_KEY}}" }
}`}
              />
              {errors.injection_config && (
                <p className="mt-1 text-sm text-red-600">{errors.injection_config}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Use <code>{`{{secret:KEY}}`}</code> placeholder to reference secrets.
              </p>
            </div>

            {/* Secret Ref */}
            <div>
              <label htmlFor={idSecret} className="block text-sm font-medium text-gray-700 mb-2">
                Secret Reference
              </label>
              <input
                id={idSecret}
                value={form.secret_ref ?? ""}
                onChange={(e) => setForm({ ...form, secret_ref: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg ${errors.secret_ref ? "border-red-300" : "border-gray-300"}`}
                placeholder={
                  form.credential_source === "env"
                    ? "e.g. OPENAI_TOKEN"
                    : form.credential_source === "vault"
                    ? "e.g. projects/xxx/secrets/OPENAI_TOKEN"
                    : "Optional unless credential source requires it"
                }
              />
              {errors.secret_ref && <p className="mt-1 text-sm text-red-600">{errors.secret_ref}</p>}
              <p className="mt-1 text-xs text-gray-500">
                Required when credential source is not <code>none</code>.
              </p>
            </div>
          </>
        )}
      </CardContent>

      <div className="flex items-center justify-end gap-3 pt-6 border-t px-6 pb-6">
        <Button variant="outline" onClick={() => router.push("/creator/groups")}>
          Cancel
        </Button>
        <Button onClick={onSave} disabled={saving || !sessionReady}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
    </Card>
  );
}
