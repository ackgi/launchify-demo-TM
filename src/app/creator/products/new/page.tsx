"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { createBrowserClient } from "@/lib/supabase/client";
import ProductForm, { ProductFormData, ProductStatus } from "../_components/ProductForm";

export default function NewProductPage() {
  const router = useRouter();
  const { getToken } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  const onSubmit = async ({ data, action }: { data: ProductFormData; action: "save" | "publish" | "create-plan" | "draft" }) => {
    setIsSubmitting(true);
    setDbError(null);
    try {
      const token = await getToken({ template: "supabase" });
      const supabase = createBrowserClient(token);

      // 「publish」を押したら draft→preview へ昇格させる例（任意）
      const nextStatus: ProductStatus =
        action === "publish" ? (data.status === "draft" ? "preview" : data.status) : data.status;

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
      };

      const { data: inserted, error } = await supabase.from("api_products").insert(payload).select("id").single();
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
