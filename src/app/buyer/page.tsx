// src/app/buyer/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Filter } from "lucide-react";
import { Card, CardContent } from "@/app/components/ui/Card";
import Badge from "@/app/components/ui/Badge";
import { VerificationBadge } from "@/app/components/common/VerificationBadge";
import { mockData, currentUser } from "@/data/mockData";
import { Product } from "@/types";

export default function Page() {
  // ▼ 一時的に Coming Soon 固定ページを返す
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
      <h1 className="text-4xl font-bold mb-4">🚀 Coming Soon</h1>
      <p className="text-gray-600 max-w-md">
        The Buyer Portal is currently under development.<br />
        Please check back later.
      </p>
    </div>
  );

  // --- 以下は元のコードを残す（将来再利用のため） ---
  // eslint-disable-next-line no-unreachable
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [contentTypeFilter, setContentTypeFilter] = useState("");

  const publicProducts = mockData.products.filter((p) => p.status === "public");
  const entitlements = currentUser.user
    ? mockData.entitlements.filter(
        (e) =>
          e.userId === currentUser.user?.id &&
          (e.status === "active" || e.status === "trialing")
      )
    : [];

  const isPurchased = (product: Product) =>
    entitlements.some((e) => e.productId === product.id);

  const getStatus = (product: Product) => {
    if (!currentUser.user) return null;
    const ent = entitlements.find((e) => e.productId === product.id);
    if (ent?.status === "trialing") return "Trial";
    if (ent?.status === "active") return "Active";
    return null;
  };

  const filtered = publicProducts.filter((p) => {
    const s = searchTerm.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(s) || p.description.toLowerCase().includes(s);
    const matchesType = !contentTypeFilter || p.contentType === contentTypeFilter;
    return matchesSearch && matchesType;
  });

  const contentTypes = [...new Set(publicProducts.map((p) => p.contentType))];

  return (
    <div className="w-full max-w-7xl mx-auto px-6 lg:px-10 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">API Catalog</h1>
        <p className="text-lg text-gray-600">
          Discover and integrate powerful APIs for your applications
        </p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search APIs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="text-gray-400 w-5 h-5" />
          <select
            aria-label="Filter by content type"
            value={contentTypeFilter}
            onChange={(e) => setContentTypeFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Types</option>
            {contentTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-600">No APIs found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((product) => {
            const purchased = isPurchased(product);
            const status = getStatus(product);
            return (
              <Card
                key={product.id}
                hover
                onClick={() => router.push(`/buyer/products/${product.slug}`)}
                className="group"
              >
                <div className="aspect-video bg-gray-100 rounded-t-lg overflow-hidden">
                  <img
                    src={product.thumbnail}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </div>

                <CardContent className="space-y-4">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </h3>
                    {currentUser.user && purchased && (
                      <Badge variant="success" size="sm">
                        {status}
                      </Badge>
                    )}
                  </div>

                  <p className="text-gray-600 text-sm line-clamp-2">
                    {product.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <VerificationBadge
                      status={product.verification.status}
                      lastChecked={product.verification.lastChecked}
                      showTime
                    />
                    <Badge variant="neutral" size="sm">
                      {product.contentType}
                    </Badge>
                  </div>

                  {product.uptimePolicy.alwaysUp && (
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-xs text-green-600 font-medium">
                        {product.uptimePolicy.description}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
