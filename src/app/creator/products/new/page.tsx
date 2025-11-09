// src/app/creator/products/new/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js"; // 直接クライアントを作る
import ProductForm, { ProductFormData, ProductStatus } from "../_components/ProductForm";

function createSupabaseWithClerkJWT(token: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, anon, {
    global: { headers: { Authorization: `Bearer ${token}` } }, // JWT を必ず渡す
  });
}

export default function NewProductPage() {
  const router = useRouter();
  const { getToken, userId } = useAuth(); // userId を使う
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  const onSubmit = async ({
    data,
    action,
  }: {
    data: ProductFormData;
    action: "save" | "publish" | "create-plan" | "draft";
  }) => {
    setIsSubmitting(true);
    setDbError(null);
    try {
      const token = await getToken({ template: "supabase" });
      if (!token) throw new Error("Failed to issue Clerk JWT (template: supabase)");
      const supabase = createSupabaseWithClerkJWT(token);

      // 修正点：DBが pending_public を禁止しているため、上書きせずそのまま保存
      const nextStatus: ProductStatus = data.status;

      const payload = {
        name: data.name,
        description: data.description || null,
        slug: data.slug || null,
        category: data.category || null,
        thumbnail_url: data.thumbnailUrl || null,
        homepage_url: data.homepageUrl || null,
        service_endpoint_url: data.serviceEndpointUrl || null,
        rate_limit_per_min: data.rateLimitPerMin ? parseInt(data.rateLimitPerMin) : null,
        status: nextStatus,
        visibility: data.visibility,
        created_by: userId ?? null, // RLS通過に必須（auth.jwt()->>'sub' と一致）
      };

      const { data: inserted, error } = await supabase
        .from("api_products")
        .insert(payload)
        .select("id")
        .single();
      if (error) throw error;

      const newId = inserted?.id as string;
      if (action === "create-plan") {
        router.push(`/creator/plans/new?productId=${newId}`);
      } else {
        router.push("/creator");
      }
    } catch (e: any) {
      setDbError(e?.message ?? "Failed to create product");
      alert(e?.message ?? "Failed to create product");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProductForm
      mode="new"
      isSubmitting={isSubmitting}
      onSubmit={onSubmit}
      onCancel={() => router.push("/creator")}
      title="New API Product"
      subtitle="Create a new API product for the marketplace"
      ctaLabelPrimary="Create Product"
      showCreatePlan
    />
  );
}
