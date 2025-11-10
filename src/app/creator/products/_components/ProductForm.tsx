//src/app/creator/products/_components/ProductForm.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Save } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import Badge from "@/app/components/ui/Badge";

// ▼ preview を廃止し、pending_public を含めた正式ステータスへ
export type ProductStatus =
  | "draft"
  | "pending_public"
  | "private"
  | "restricted"
  | "public"
  | "live"
  | "paused"
  | "deprecated"
  | "disabled";

export type ProductVisibility = "catalog" | "unlisted" | "invited" | "internal";

export interface ProductRow {
  id: string;
  name: string;
  description: string | null;
  slug: string | null;
  category: string | null;
  tags: string[] | null;
  auth_type: string | null;
  status: ProductStatus;
  visibility: ProductVisibility;
  thumbnail_url: string | null;
  homepage_url: string | null;
  service_endpoint_url: string | null;
  rate_limit_per_min: number | null;
  default_plan_id: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ProductFormData {
  name: string;
  description: string;
  slug: string;
  category: string;
  thumbnailUrl: string;
  homepageUrl: string;
  serviceEndpointUrl: string;
  rateLimitPerMin: string; // 入力は文字列、送信時に number|null へ
  status: ProductStatus;
  visibility: ProductVisibility;
}

// 不要な "create-plan" を削除
type Action = "save" | "publish" | "draft";

export type ProductFormProps = {
  mode: "new" | "edit";
  initial?: Partial<ProductRow>;
  isSubmitting?: boolean;
  onSubmit: (payload: {
    data: ProductFormData;
    action: Action;
  }) => Promise<void>;
  onCancel: () => void;
  title?: string;
  subtitle?: string;
  ctaLabelPrimary?: string; // 例: Save / Create Product
};

export default function ProductForm({
  mode,
  initial,
  isSubmitting = false,
  onSubmit,
  onCancel,
  title = mode === "new" ? "New API Product" : "Edit API Product",
  subtitle = mode === "new"
    ? "Create a new API product for the marketplace"
    : "Update your API product settings and information",
  ctaLabelPrimary = mode === "new" ? "Create Product" : "Save",
}: ProductFormProps) {
  const stockImages = useMemo(
    () => [
      "https://images.pexels.com/photos/1118873/pexels-photo-1118873.jpeg?auto=compress&cs=tinysrgb&w=400",
      "https://images.pexels.com/photos/159888/pexels-photo-159888.jpeg?auto=compress&cs=tinysrgb&w=400",
      "https://images.pexels.com/photos/373543/pexels-photo-373543.jpeg?auto=compress&cs=tinysrgb&w=400",
    ],
    []
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);

  const [formData, setFormData] = useState<ProductFormData>({
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    slug: initial?.slug ?? "",
    category: initial?.category ?? "",
    thumbnailUrl: initial?.thumbnail_url ?? "",
    homepageUrl: initial?.homepage_url ?? "",
    serviceEndpointUrl: initial?.service_endpoint_url ?? "",
    rateLimitPerMin:
      initial?.rate_limit_per_min != null ? String(initial?.rate_limit_per_min) : "",
    status: (initial?.status as ProductStatus) ?? "draft",
    visibility: (initial?.visibility as ProductVisibility) ?? "catalog",
  });

  // 変更検知
  useEffect(() => {
    const changed =
      formData.name !== (initial?.name ?? "") ||
      formData.description !== (initial?.description ?? "") ||
      formData.slug !== (initial?.slug ?? "") ||
      formData.category !== (initial?.category ?? "") ||
      formData.thumbnailUrl !== (initial?.thumbnail_url ?? "") ||
      formData.homepageUrl !== (initial?.homepage_url ?? "") ||
      formData.serviceEndpointUrl !== (initial?.service_endpoint_url ?? "") ||
      formData.status !== ((initial?.status as ProductStatus) ?? "draft") ||
      formData.visibility !== ((initial?.visibility as ProductVisibility) ?? "catalog") ||
      formData.rateLimitPerMin !==
        (initial?.rate_limit_per_min != null ? String(initial?.rate_limit_per_min) : "");
    setHasChanges(changed);
  }, [formData, initial]);

  const isRequired = (key: keyof ProductFormData) => {
    if (key === "name" || key === "thumbnailUrl" || key === "serviceEndpointUrl") return true;
    if (key === "slug") return formData.status === "public";
    return false;
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.name.trim()) e.name = "Product name is required";
    if (!formData.thumbnailUrl.trim()) e.thumbnailUrl = "Thumbnail URL is required";
    if (!formData.serviceEndpointUrl.trim()) e.serviceEndpointUrl = "Service endpoint URL is required";
    if (formData.serviceEndpointUrl && !formData.serviceEndpointUrl.startsWith("https://")) {
      e.serviceEndpointUrl = "Service endpoint URL must start with https://";
    }
    if (formData.status === "public" && !formData.slug.trim())
      e.slug = "Slug is required for public products";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handle = async (action: Action) => {
    if (!validate()) return;
    await onSubmit({ data: formData, action });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-600 mt-1">{subtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-1">
                Name {isRequired("name") && "*"}
              </label>
              <input
                id="productName"
                name="name"
                placeholder="e.g., Weather Forecast API"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                className={`w-full border rounded-lg px-3 py-2 ${
                  errors.name ? "border-red-300" : "border-gray-300"
                }`}
                aria-invalid={!!errors.name || undefined}
                aria-describedby={errors.name ? "error-name" : undefined}
              />
              {errors.name && (
                <p id="error-name" className="text-sm text-red-600">
                  {errors.name}
                </p>
              )}

              <label htmlFor="productDescription" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="productDescription"
                name="description"
                placeholder="Describe your API product..."
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                className={`w-full border rounded-lg px-3 py-2 ${
                  errors.description ? "border-red-300" : "border-gray-300"
                }`}
              />

              <label htmlFor="serviceEndpointUrl" className="block text-sm font-medium text-gray-700 mb-1">
                Service Endpoint URL {isRequired("serviceEndpointUrl") && "*"}
              </label>
              <input
                id="serviceEndpointUrl"
                name="serviceEndpointUrl"
                placeholder="https://api.launchify.dev/v1/endpoint"
                type="url"
                value={formData.serviceEndpointUrl}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, serviceEndpointUrl: e.target.value }))
                }
                className={`w-full border rounded-lg px-3 py-2 ${
                  errors.serviceEndpointUrl ? "border-red-300" : "border-gray-300"
                }`}
                aria-invalid={!!errors.serviceEndpointUrl || undefined}
                aria-describedby={errors.serviceEndpointUrl ? "error-service-url" : undefined}
              />
              {errors.serviceEndpointUrl && (
                <p id="error-service-url" className="text-sm text-red-600">
                  {errors.serviceEndpointUrl}
                </p>
              )}

              <label htmlFor="homepageUrl" className="block text-sm font-medium text-gray-700 mb-1">
                Homepage URL
              </label>
              <input
                id="homepageUrl"
                name="homepageUrl"
                placeholder="https://example.com/docs"
                type="url"
                value={formData.homepageUrl}
                onChange={(e) => setFormData((p) => ({ ...p, homepageUrl: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 border-gray-300"
              />
            </CardContent>
          </Card>

          {/* Thumbnail */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900">Thumbnail Image</h2>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3 mb-3">
                {stockImages.map((url) => (
                  <button
                    key={url}
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, thumbnailUrl: url }))}
                    className={`aspect-video rounded-lg overflow-hidden border-2 ${
                      formData.thumbnailUrl === url ? "border-blue-500" : "border-gray-300"
                    }`}
                    aria-label="Choose thumbnail"
                  >
                    <img src={url} alt="Thumbnail option" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>

              <label htmlFor="thumbnailUrl" className="block text-sm font-medium text-gray-700 mb-1">
                Thumbnail URL {isRequired("thumbnailUrl") && "*"}
              </label>
              <input
                id="thumbnailUrl"
                name="thumbnailUrl"
                placeholder="https://example.com/thumbnail.png"
                type="url"
                value={formData.thumbnailUrl}
                onChange={(e) => setFormData((p) => ({ ...p, thumbnailUrl: e.target.value }))}
                className={`w-full border rounded-lg px-3 py-2 ${
                  errors.thumbnailUrl ? "border-red-300" : "border-gray-300"
                }`}
                aria-invalid={!!errors.thumbnailUrl || undefined}
                aria-describedby={errors.thumbnailUrl ? "error-thumb" : undefined}
              />
              {errors.thumbnailUrl && (
                <p id="error-thumb" className="text-sm text-red-600">
                  {errors.thumbnailUrl}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Publication Settings */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900">Publication Settings</h2>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, status: e.target.value as ProductStatus }))
                  }
                  className="w-full border rounded-lg px-3 py-2 border-gray-300"
                >
                  <option value="draft">draft</option>
                  <option value="pending_public">pending_public</option>
                  <option value="public">public</option>
                  <option value="deprecated">deprecated</option>
                  <option value="disabled">disabled</option>
                </select>
              </div>

              <div>
                <label htmlFor="visibility" className="block text-sm font-medium text-gray-700 mb-1">
                  Visibility
                </label>
                <select
                  id="visibility"
                  name="visibility"
                  value={formData.visibility}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, visibility: e.target.value as ProductVisibility }))
                  }
                  className="w-full border rounded-lg px-3 py-2 border-gray-300"
                >
                  <option value="catalog">catalog</option>
                  <option value="unlisted">unlisted</option>
                  <option value="invited">invited</option>
                  <option value="internal">internal</option>
                </select>
              </div>

              {(formData.status === "public" || formData.visibility !== "internal") && (
                <div>
                  <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                    Product Slug {isRequired("slug") && "*"}
                  </label>
                  <input
                    id="slug"
                    name="slug"
                    placeholder="creator/product-name"
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData((p) => ({ ...p, slug: e.target.value }))}
                    className={`w-full border rounded-lg px-3 py-2 ${
                      errors.slug ? "border-red-300" : "border-gray-300"
                    }`}
                    aria-invalid={!!errors.slug || undefined}
                    aria-describedby={errors.slug ? "error-slug" : undefined}
                  />
                  {errors.slug && (
                    <p id="error-slug" className="text-sm text-red-600">
                      {errors.slug}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    URL: /buyer/products/{formData.slug || "creator/product-name"}
                  </p>
                </div>
              )}

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <input
                  id="category"
                  name="category"
                  placeholder="NLP / Vision / Utility ..."
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 border-gray-300"
                />
              </div>

              <div>
                <label htmlFor="rateLimit" className="block text-sm font-medium text-gray-700 mb-1">
                  Rate Limit (per min)
                </label>
                <input
                  id="rateLimit"
                  name="rateLimit"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="e.g., 60"
                  type="text"
                  value={formData.rateLimitPerMin}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      rateLimitPerMin: e.target.value.replace(/[^0-9]/g, ""),
                    }))
                  }
                  className="w-full border rounded-lg px-3 py-2 border-gray-300"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Preview</h3>
            </CardHeader>
            <CardContent>
              {formData.thumbnailUrl && (
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-4">
                  <img
                    src={formData.thumbnailUrl}
                    alt="Preview thumbnail"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <h4 className="font-semibold">{formData.name || "Product Name"}</h4>
              <p className="text-sm text-gray-600">
                {formData.description || "Description..."}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <Badge variant={formData.status === "public" ? "success" : "neutral"}>
                  {formData.status}
                </Badge>
                <Badge variant="info">{formData.visibility}</Badge>
                {hasChanges && <Badge variant="warning">modified</Badge>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end pt-6 border-t">
        <div className="flex items-center gap-3">
          {/* 左：Cancel、右：Save の2つだけ */}
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={() => handle(mode === "new" ? "publish" : "save")}
            disabled={isSubmitting || (mode === "edit" && !hasChanges)}
          >
            {isSubmitting ? (mode === "new" ? "Creating..." : "Saving...") : ctaLabelPrimary}
          </Button>
        </div>
      </div>

    </div>
  );
}
