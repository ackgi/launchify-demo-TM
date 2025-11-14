//src\app\creator\plans\components\sections\ProductSelectorSection.tsx
"use client";

import { ProductSelector } from "../sections/ProductSelector";

// Props 型を定義
export type ProductSelectorSectionProps = {
  products: { id: string; name: string }[];
  value: string | undefined;
  setField: (key: string, val: any) => void;
  isSaving: boolean;
  error?: string;
};

export function ProductSelectorSection({
  products,
  value,
  setField,
  isSaving,
  error,
}: ProductSelectorSectionProps) {
  return (
    <ProductSelector
      products={products}
      value={value}
      onChange={(id) => setField("productId", id)}
      disabled={isSaving}
      error={error}
    />
  );
}
