//src\app\creator\plans\components\sections\ProductSelector.tsx
"use client";

type ProductLite = {
  id: string;
  name: string;
};

type Props = {
  products: ProductLite[];
  value: string | undefined;
  onChange: (v: string) => void;
  disabled?: boolean;
  error?: string;
};

export function ProductSelector({
  products,
  value,
  onChange,
  disabled,
  error,
}: Props) {
  return (
    <section className="space-y-2">
      <label
        htmlFor="productId"
        className="block text-sm font-medium text-gray-700"
      >
        Product <span className="text-red-600">*</span>
      </label>

      <select
        id="productId"
        value={value ?? ""}
        disabled={disabled}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
          onChange(e.target.value)
        }
        className={`w-full rounded-lg border px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
          error ? "border-red-300" : "border-gray-300"
        }`}
      >
        <option value="">Select a product...</option>
        {products.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </section>
  );
}
