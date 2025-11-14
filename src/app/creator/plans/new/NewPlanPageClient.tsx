// src/app/creator/plans/new/NewPlanPageClient.tsx
"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useAuth, useUser } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";

import { Button } from "@/app/components/ui/Button";
import { PlanForm } from "@/app/creator/plans/components/PlanForm";
import { PlanFormData } from "@/app/creator/plans/components/types";
import { usePlanCommonData } from "@/app/creator/plans/components/PlanPageLoader";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export default function NewPlanPageClient() {
  const router = useRouter();
  const { getToken, isSignedIn, userId } = useAuth();
  const { isLoaded } = useUser();

  // ⭐ 共通ローダー：planId は undefined
  const { loading, products, groups, existingNames } = usePlanCommonData();

  const handleSubmit = async (data: PlanFormData) => {
    if (!isSignedIn || !userId) return router.push("/auth");

    const token = await getToken({ template: "supabase" });
    if (!token) return;

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

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

      // 🔵 Product 選択
      product_id: data.productId || null,
    };

    const { data: inserted } = await supabase
      .from("api_plans")
      .insert(payload)
      .select("id")
      .single();

    const newId = inserted?.id;

    if (data.linkedGroups.length > 0) {
      const rows = data.linkedGroups.map((gid) => ({
        plan_id: newId,
        group_id: gid,
      }));

      await supabase.from("plan_endpoint_groups").insert(rows);
    }

    router.push(`/creator/plans/${newId}/edit`);
  };

  if (!isLoaded || loading) {
    return <div className="py-16 text-center text-gray-600">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push(`/creator/plans`)}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Back to Plans
        </Button>

        <div>
          <h1 className="text-3xl font-bold text-gray-900">New Plan</h1>
          <p className="mt-1 text-lg text-gray-600">
            Create a new pricing plan
          </p>
        </div>
      </div>

      <PlanForm
        mode="new"
        availableGroups={groups}
        availableProducts={products}
        existingPlanNames={existingNames}
        onSubmit={handleSubmit}
        onCancel={() => router.push("/creator/plans")}
        isSaving={false}
      />
    </div>
  );
}
