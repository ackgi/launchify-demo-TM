// src/app/creator/plans/[planId]/edit/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/app/components/ui/Button";
import { PlanForm } from "@/app/creator/plans/components/PlanForm";
import { PlanFormData, EndpointGroupLite } from "@/app/creator/plans/components/types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export default function EditPlanPage() {
  const { planId } = useParams<{ planId: string }>();
  const router = useRouter();
  const { isSignedIn, getToken } = useAuth();
  const { isLoaded } = useUser();
  const [supabase, setSupabase] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [initial, setInitial] = useState<Partial<PlanFormData> | null>(null);
  const [availableGroups, setAvailableGroups] = useState<EndpointGroupLite[]>([]);
  const [existingNames, setExistingNames] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      if (!isSignedIn) return router.replace("/auth");
      const token = await getToken({ template: "supabase" });
      if (token) {
        setSupabase(
          createClient(SUPABASE_URL, SUPABASE_ANON, {
            global: { headers: { Authorization: `Bearer ${token}` } },
          })
        );
      }
    })();
  }, [isSignedIn, getToken, router]);

  useEffect(() => {
    if (!supabase) return;
    (async () => {
      setLoading(true);
      const { data: p } = await supabase
        .from("api_plans")
        .select("id, product_id, plan_name, status, interval, monthly_quota, unit_price, monthly_cap, minimum_charge, stripe_price_id")
        .eq("id", planId)
        .maybeSingle();

      if (!p) {
        setInitial(null);
        setAvailableGroups([]);
        return;
      }

      const { data: groups } = await supabase
        .from("api_endpoint_groups")
        .select("*")
        .eq("product_id", p.product_id);

      const { data: pegs } = await supabase
        .from("plan_endpoint_groups")
        .select("group_id")
        .eq("plan_id", planId);

      const linkedIds = (pegs ?? []).map((r: any) => r.group_id as string);
      const { data: plans } = await supabase.from("api_plans").select("id, plan_name");
      const names = (plans ?? [])
        .filter((x: any) => x.id !== planId)
        .map((x: any) => String(x.plan_name));

      setExistingNames(names);
      setAvailableGroups(
        (groups ?? []).map((g: any) => ({
          id: g.id,
          name: g.name ?? g.group_name ?? `Group ${g.id.slice(0, 6)}`,
          description: g.description ?? "",
          category: g.category ?? "general",
          endpointCount: g.endpoint_count ?? 0,
        }))
      );

      setInitial({
        name: p.plan_name,
        status: p.status ?? "draft",
        billingType: "subscription",
        interval: p.interval ?? "month",
        monthlyQuota: p.monthly_quota ?? 0,
        stripePriceId: p.stripe_price_id ?? "",
        unitPrice: p.unit_price ?? 0,
        monthlyCap: p.monthly_cap ?? 0,
        minimumCharge: p.minimum_charge ?? 0,
        linkedGroups: linkedIds,
      });
      setLoading(false);
    })();
  }, [supabase, planId]);

  const onSubmit = async (data: PlanFormData) => {
    if (!supabase) return;
    setIsSaving(true);
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
      })
      .eq("id", planId);
    alert("Updated!");
    router.push("/creator/plans");
  };

  if (!isLoaded || !isSignedIn) return <div className="py-24 text-center">Checking auth...</div>;
  if (loading) return <div className="py-16 text-center text-gray-600">Loading plan...</div>;
  if (!initial)
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold">Plan not found</h1>
        <Button onClick={() => router.push("/creator/plans")}>Back</Button>
      </div>
    );

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.push("/creator/plans")} className="flex items-center gap-2">
          <ArrowLeft size={16} /> Back to Plans
        </Button>
        <h1 className="text-3xl font-bold">Edit Plan</h1>
      </div>

      <PlanForm
        mode="edit"
        currentPlanId={planId}
        initialData={initial}
        availableGroups={availableGroups}
        existingPlanNames={existingNames}
        onSubmit={onSubmit}
        onCancel={() => router.push("/creator/plans")}
        isSaving={isSaving}
      />
    </div>
  );
}
