"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Key, ArrowRight, Shield } from "lucide-react";

import { Card, CardContent } from "@/app/components/ui/Card";
import Badge from "@/app/components/ui/Badge";
import { mockData, currentUser } from "@/data/mockData";
import { splitSlug } from "@/utils/slug"; // ★ 追加

export default function ApiKeysPage() {


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

  const userEntitlements = mockData.entitlements.filter(
    (e) =>
      e.userId === currentUser.user?.id &&
      (e.status === "active" || e.status === "trialing")
  );

  const getProductForEntitlement = (entitlementId: string) => {
    const entitlement = mockData.entitlements.find((e) => e.id === entitlementId);
    return mockData.products.find((p) => p.id === entitlement?.productId);
  };

  const getPlanForEntitlement = (entitlementId: string) => {
    const entitlement = mockData.entitlements.find((e) => e.id === entitlementId);
    return mockData.plans.find((p) => p.id === entitlement?.planId);
  };

  const getKeysForEntitlement = (entitlementId: string) => {
    return mockData.apiKeys.filter((k) => k.entitlementId === entitlementId);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (userEntitlements.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Key className="w-12 h-12 text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">No Active Contracts</h1>
        <p className="text-gray-600 max-w-sm mx-auto mb-8">
          You don't have any active API contracts. Browse the catalog to subscribe to APIs.
        </p>
        <button
          onClick={() => router.push("/buyer")}
          className="inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 px-4 py-2.5 text-sm bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 disabled:bg-blue-300"
        >
          Browse APIs
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Contracts</h1>
        <p className="text-lg text-gray-600">
          View your active API subscriptions and manage access
        </p>
      </div>

      {/* API Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {userEntitlements.map((entitlement) => {
          const product = getProductForEntitlement(entitlement.id);
          const plan = getPlanForEntitlement(entitlement.id);
          const keys = getKeysForEntitlement(entitlement.id);
          const masterKey = keys.find((k) => k.name === "Master Key") || keys[0];

          if (!product || !plan) return null;

          return (
            <Card
              key={entitlement.id}
              hover={true}
              onClick={() => {
                // ★ slug を owner / name に分割して 2 セグメントのルートへ遷移
                const { owner, name } = splitSlug(product.slug);
                router.push(`/account/api-keys/${owner}/${name}`);
              }}
              className="group cursor-pointer"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <span>{plan.name} Contract</span>
                      <Badge
                        variant={entitlement.status === "active" ? "success" : "warning"}
                        size="sm"
                      >
                        {entitlement.status}
                      </Badge>
                    </div>
                  </div>
                  <img
                    src={product.thumbnail}
                    alt={product.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                </div>

                <div className="space-y-3">
                  {/* Master Key Preview */}
                  {masterKey && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">
                          Contract Active
                        </span>
                      </div>
                      <div className="text-xs text-blue-700">
                        Click to manage API keys
                      </div>
                      {masterKey.lastUsed && (
                        <div className="text-xs text-blue-600 mt-1">
                          Last used: {formatDate(masterKey.lastUsed)}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Key Count */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Monthly Usage</span>
                    <span className="font-medium text-gray-900">
                      {Math.floor(Math.random() * plan.monthlyLimit * 0.3).toLocaleString()}/
                      {plan.monthlyLimit.toLocaleString()}
                    </span>
                  </div>

                  {/* Subscription Info */}
                  <div className="text-xs text-gray-500">
                    Since {formatDate(entitlement.createdAt)}
                  </div>
                </div>

                {/* Arrow indicator */}
                <div className="flex justify-end mt-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Manage Keys</span>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Help Section */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">About Your Contracts</h3>
              <p className="text-blue-800 text-sm leading-relaxed">
                Each contract represents your subscription to an API service. Click on any
                contract to manage API keys, view usage statistics, and access documentation.
                All keys within a contract share the same rate limits and permissions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
