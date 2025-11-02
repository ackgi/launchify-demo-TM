/** @jsxImportSource react */
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

import { Card, CardContent, CardHeader } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { mockData } from "@/data/mockData";

import { PlanForm } from "@/app/creator/plans/components/PlanForm";
import { PlanFormData, EndpointGroupLite } from "@/app/creator/plans/components/types";

function createSupabaseWithClerkJWT(token: string): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, anon, { global: { headers: { Authorization: `Bearer ${token}` } } });
}

export default function NewPlanPageClient() {
  const router = useRouter();
  const { getToken, isSignedIn, userId } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  // 新規ページは mockData からグループ候補を表示
  const availableGroups: EndpointGroupLite[] = useMemo(
    () =>
      mockData.endpointGroups.map((g) => ({
        id: g.id,
        name: g.name,
        description: g.description,
        category: g.category,
        endpointCount: g.endpointCount,
        loadLevel: g.loadLevel,
        isDefault: g.isDefault,
      })),
    []
  );

  const existingNames = useMemo(() => mockData.plans.map((p) => p.name), []);

  const onSubmit = async (data: PlanFormData) => {
    if (!isSignedIn || !userId) {
      router.push("/auth");
      return;
    }
    setIsSaving(true);
    try {
      const token = await getToken({ template: "supabase" });
      if (!token) throw new Error("Failed to issue Clerk JWT (template: supabase)");
      const supabase = createSupabaseWithClerkJWT(token);

      const payload = {
        plan_name: data.name.trim(),
        billing_type: data.billingType,
        status: data.status,
        stripe_price_id: data.stripePriceId || null,
        interval: data.interval,
        monthly_quota: data.monthlyQuota || null,
        trial_days: data.trialDays || 0,
        cancel_at_period_end: data.cancelAtPeriodEnd ?? true,
        initial_credits: data.initialCredits || null,
        quota_unit: data.quotaUnit || null,
        carry_over: data.carryOver ?? false,
        unit_price: data.unitPrice || null,
        monthly_cap: data.monthlyCap || null,
        minimum_charge: data.minimumCharge || null,
        created_by: userId,
      };

      const { data: inserted, error: insertErr } = await supabase
        .from("api_plans")
        .insert(payload)
        .select("id")
        .single();
      if (insertErr) throw insertErr;

      const newId = inserted.id as string;

      if (data.linkedGroups.length > 0) {
        const rows = data.linkedGroups.map((groupId) => ({ plan_id: newId, group_id: groupId }));
        const { error: linkErr } = await supabase.from("plan_groups").insert(rows);
        if (linkErr) throw linkErr;
      }

      router.push(`/creator/plans/${newId}/edit`);
    } catch (e: any) {
      console.error("Failed to create plan:", e);
      alert(`Failed to create plan: ${e?.message ?? "unknown error"}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button type="button" variant="ghost" onClick={() => router.push(`/creator/plans`)} className="flex items-center gap-2">
          <ArrowLeft size={16} aria-hidden="true" />
          Back to Plans
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">New Plan</h1>
          <p className="mt-1 text-lg text-gray-600">Create a new pricing plan</p>
        </div>
      </div>

      {/* 共通フォーム */}
      <PlanForm
        mode="new"
        availableGroups={availableGroups}
        existingPlanNames={existingNames}
        onSubmit={onSubmit}
        onCancel={() => router.push("/creator/plans")}
        isSaving={isSaving}
      />
    </div>
  );
}
