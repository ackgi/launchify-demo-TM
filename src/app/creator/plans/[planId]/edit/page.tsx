// src/app/creator/plans/[planId]/edit/page.tsx
"use client";

import { useRouter, useParams } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js"; // ← 必須
import { ArrowLeft } from "lucide-react";

import { Button } from "@/app/components/ui/Button";
import { PlanForm } from "@/app/creator/plans/components/PlanForm";
import { PlanFormData } from "@/app/creator/plans/components/types";
import { usePlanCommonData } from "@/app/creator/plans/components/PlanPageLoader";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export default function EditPlanPage() {
  const router = useRouter();
  const { planId } = useParams<{ planId: string }>();

  const { getToken, isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();

  // ★ 共通ローダーで全部データ取得
  const {
    loading,
    products,
    groups,
    existingNames,
    planInitial,
  } = usePlanCommonData(planId);

  // -------------------------
  // 保存処理
  // -------------------------
  const handleSubmit = async (data: PlanFormData) => {
    if (!isSignedIn) return router.push("/auth");

    const token = await getToken({ template: "supabase" });
    if (!token) {
      alert("Auth token missing");
      return;
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    await supabase
      .from("api_plans")
      .update({
        plan_name: data.name,
        status: data.status,
        interval: data.interval,
        monthly_quota: data.monthlyQuota,
        unit_price: data.unitPrice,
        monthly_cap: data.monthlyCap,
        minimum_charge: data.minimumCharge,
        stripe_price_id: data.stripePriceId,
        product_id: data.productId || null,
      })
      .eq("id", planId);

    alert("Updated!");
    router.push("/creator/plans");
  };

  // -------------------------
  // UI
  // -------------------------

  if (!isLoaded || !isSignedIn) {
    return <div className="py-24 text-center">Checking auth...</div>;
  }

  if (loading) {
    return (
      <div className="py-16 text-center text-gray-600">
        Loading plan...
      </div>
    );
  }

  if (!planInitial) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold">Plan not found</h1>
        <Button onClick={() => router.push("/creator/plans")}>Back</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => router.push("/creator/plans")}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} /> Back to Plans
        </Button>
        <h1 className="text-3xl font-bold">Edit Plan</h1>
      </div>

      <PlanForm
        mode="edit"
        currentPlanId={planId}
        initialData={planInitial}
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
