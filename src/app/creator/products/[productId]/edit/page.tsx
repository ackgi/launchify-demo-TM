"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { createBrowserClient } from "@/lib/supabase/client";
import ProductForm, { ProductFormData, ProductRow, ProductStatus } from "../../_components/ProductForm";
import { Loader2 } from "lucide-react";

export default function EditProductPage() {
  const router = useRouter();
  const { productId = "" } = (useParams<{ productId: string }>() ?? {});
  const { getToken } = useAuth();

  const [loading, setLoading] = useState(true);
  const [row, setRow] = useState<ProductRow | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 取得
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = await getToken({ template: "supabase" });
        const supabase = createBrowserClient(token);
        const { data, error } = await supabase
          .from("api_products")
          .select(
            "id,name,description,slug,category,tags,auth_type,status,visibility,thumbnail_url,homepage_url,service_endpoint_url,rate_limit_per_min,default_plan_id,created_by,created_at,updated_at"
          )
          .eq("id", productId)
          .single();
        if (error) throw error;
        if (!cancelled) setRow(data as ProductRow);
      } catch (e) {
        if (!cancelled) router.push("/creator"); // 取れなければ戻す
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [productId, getToken, router]);

  const onSubmit = async ({ data, action }: { data: ProductFormData; action: "save" | "publish" | "create-plan" | "draft" }) => {
    setIsSubmitting(true);
    try {
      const token = await getToken({ template: "supabase" });
      const supabase = createBrowserClient(token);

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

      const { error } = await supabase.from("api_products").update(payload).eq("id", productId);
      if (error) throw error;

      if (action === "create-plan") {
        router.push(`/creator/plans/new?productId=${productId}`);
      } else {
        router.push("/creator");
      }
    } catch (e: any) {
      alert(e?.message ?? "Failed to save product");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-600">
        <Loader2 className="animate-spin mr-2" />
        Loading product...
      </div>
    );
  }

  if (!row) return null;

  return (
    <ProductForm
      mode="edit"
      initial={row}
      isSubmitting={isSubmitting}
      onSubmit={onSubmit}
      onCancel={() => router.push("/creator")}
      title="Edit API Product"
      subtitle="Update your API product settings and information"
      ctaLabelPrimary="Save"
      showCreatePlan
    />
  );
}
