// src/app/creator/plans/components/PlanPageLoader.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";
import { PlanFormData, EndpointGroupLite } from "./types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// ---- 型定義 ------------------------------------------------

type ProductLite = {
  id: string;
  name: string;
};

type PlanNameRow = {
  id: string;
  plan_name: string;
};

// -------------------------------------------------------------

export function usePlanCommonData(planId?: string) {
  const { getToken, isSignedIn } = useAuth();
  const { user } = useUser();

  const [supabase, setSupabase] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [products, setProducts] = useState<ProductLite[]>([]);
  const [groups, setGroups] = useState<EndpointGroupLite[]>([]);
  const [planInitial, setPlanInitial] = useState<
    Partial<PlanFormData> | null
  >(null);

  const [existingNames, setExistingNames] = useState<string[]>([]);

  // Supabaseクライアント生成
  useEffect(() => {
    (async () => {
      if (!isSignedIn) return;

      const token = await getToken({ template: "supabase" });
      if (!token) return;

      setSupabase(
        createClient(SUPABASE_URL, SUPABASE_ANON, {
          global: { headers: { Authorization: `Bearer ${token}` } },
        })
      );
    })();
  }, [isSignedIn, getToken]);

  // データ取得
  useEffect(() => {
    if (!supabase || !user?.id) return;

    (async () => {
      setLoading(true);

      // ---------------------------
      // Products
      // ---------------------------
      const { data: productsData } = await supabase
        .from("api_products")
        .select("id, name")
        .eq("created_by", user.id);

      setProducts(
        (productsData ?? []).map((p: any) => ({
          id: p.id,
          name: p.name ?? `Product ${String(p.id).slice(0, 6)}`,
        }))
      );

      // ---------------------------
      // Groups
      // ---------------------------
      const { data: groupsData } = await supabase
        .from("api_endpoint_groups")
        .select("*")
        .eq("created_by", user.id);

      setGroups(
        (groupsData ?? []).map((g: any) => ({
          id: g.id,
          name: g.name ?? g.group_name ?? `Group ${String(g.id).slice(0, 6)}`,
          description: g.description ?? "",
          category: g.category ?? "general",
          endpointCount: g.endpoint_count ?? 0,
        }))
      );

      // ---------------------------
      // Existing Plan Names
      // ---------------------------
      const { data: planRows } = (await supabase
        .from("api_plans")
        .select("id, plan_name")) as unknown as {
        data: PlanNameRow[] | null;
      };

      setExistingNames(
        (planRows ?? []).map((p: PlanNameRow) => p.plan_name)
      );

      // ---------------------------
      // For EDIT: load planInitial
      // ---------------------------
      if (planId) {
        const { data: p } = await supabase
          .from("api_plans")
          .select(
            "id, product_id, plan_name, status, interval, monthly_quota, unit_price, monthly_cap, minimum_charge, stripe_price_id"
          )
          .eq("id", planId)
          .maybeSingle();

        if (p) {
          setPlanInitial({
            name: p.plan_name,
            status: p.status ?? "draft",
            billingType: "subscription",
            interval: p.interval ?? "month",
            monthlyQuota: p.monthly_quota ?? 0,
            stripePriceId: p.stripe_price_id ?? "",
            unitPrice: p.unit_price ?? 0,
            monthlyCap: p.monthly_cap ?? 0,
            minimumCharge: p.minimum_charge ?? 0,
            linkedGroups: [],
            productId: p.product_id ?? "",
          });
        } else {
          setPlanInitial(null);
        }
      }

      setLoading(false);
    })();
  }, [supabase, user?.id, planId]);

  return { loading, products, groups, planInitial, existingNames };
}
