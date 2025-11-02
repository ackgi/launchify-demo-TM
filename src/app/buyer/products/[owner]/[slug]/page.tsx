"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ExternalLink,
  Code,
  Shield,
  ArrowRight,
  ArrowLeft,
  Globe,
  Users,
  Clock,
  CheckCircle,
  Copy,
  Eye,
  EyeOff,
  Activity,
  DollarSign,
  TrendingUp,
} from "lucide-react";

import { Card, CardContent, CardHeader } from "@/app/components/ui/Card";
import Badge from "@/app/components/ui/Badge";
import { Button } from "@/app/components/ui/Button";
import { VerificationBadge } from "@/app/components/common/VerificationBadge";
import { mockData, currentUser } from "@/data/mockData";

interface ProductDetailPageProps {
  params: Promise<{ owner: string; slug: string }>;
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  // ✅ React 19対応：Promise unwrap
  const { owner, slug } = React.use(params);

  const router = useRouter();
  const [showMasterKey, setShowMasterKey] = useState(false);
  const fullSlug = owner && slug ? `${owner}/${slug}` : "";

  const product = mockData.products.find((p) => p.slug === fullSlug);

  // === 404対応 ===
  if (!product) {
    return (
      <div className="text-center py-16">
        <Button
          variant="ghost"
          onClick={() => router.push("/buyer")}
          className="flex items-center gap-2 mb-4"
        >
          <ArrowLeft size={16} />
          Back to Catalog
        </Button>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">API Not Found</h1>
        <p className="text-gray-600 mb-8">
          The API you're looking for doesn't exist or has been removed.
        </p>
        <Button onClick={() => router.push("/buyer")}>Back to Catalog</Button>
      </div>
    );
  }

  // === 関連データ ===
  const creator = mockData.users.find((u) => u.id === product.createdBy);
  const endpointGroups = mockData.endpointGroups.filter(
    (g) => g.productId === product.id
  );
  const plans = mockData.plans.filter(
    (p) => p.productId === product.id && p.status === "active"
  );
  const userEntitlement = mockData.entitlements.find(
    (e) =>
      e.productId === product.id &&
      e.userId === currentUser.user?.id &&
      (e.status === "active" || e.status === "trialing")
  );
  const userApiKeys = userEntitlement
    ? mockData.apiKeys.filter((k) => k.entitlementId === userEntitlement.id)
    : [];
  const masterKey =
    userApiKeys.find((k) => k.name === "Master Key") || userApiKeys[0];
  const userPlan = userEntitlement
    ? mockData.plans.find((p) => p.id === userEntitlement.planId)
    : null;

  // === ハンドラ ===
  const handlePurchase = (planId: string) => {
    console.log("Purchasing plan:", planId);
    router.push("/success");
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
  };

  const formatPrice = (price: number) =>
    price === 0 ? "Free" : `$${price}/month`;

  const loadColors = {
    low: "text-green-600",
    medium: "text-yellow-600",
    high: "text-red-600",
  };

  // === レンダリング ===
  return (
    <div className="space-y-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.push("/buyer")}
        className="flex items-center gap-2"
      >
        <ArrowLeft size={16} />
        Back to Catalog
      </Button>

      {/* Hero Section */}
      <div className="relative">
        <div className="aspect-[3/1] bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl overflow-hidden">
          <img
            src={product.banner || product.thumbnail}
            alt={product.name}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
        </div>

        <div className="absolute bottom-8 left-8 right-8">
          <div className="flex items-end justify-between">
            <div className="text-white">
              <div className="flex items-center gap-3 mb-2">
                <Badge
                  variant={product.status === "public" ? "success" : "warning"}
                >
                  {product.status}
                </Badge>
                <VerificationBadge
                  status={product.verification.status}
                  lastChecked={product.verification.lastChecked}
                />
              </div>
              <h1 className="text-4xl font-bold mb-2">{product.name}</h1>
              <div className="flex items-center gap-4 text-blue-100">
                <div className="flex items-center gap-2">
                  <img
                    src={creator?.avatar}
                    alt={creator?.displayName}
                    className="w-6 h-6 rounded-full"
                  />
                  <span>by {creator?.displayName}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Globe size={16} />
                  <span>@{owner}</span>
                </div>
              </div>
            </div>

            <div className="text-right text-white">
              <div className="text-2xl font-bold">
                {product.verification.uptime30d}
              </div>
              <div className="text-blue-100">30-day uptime</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* About */}
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-semibold text-gray-900">
                About this API
              </h2>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-gray-700 leading-relaxed text-lg">
                {product.description}
              </p>

              {product.useCases && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Popular Use Cases
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {product.useCases.map((useCase, index) => (
                      <Badge key={index} variant="info" className="text-sm">
                        {useCase}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Code className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {product.contentType}
                    </div>
                    <div className="text-sm text-gray-600">
                      Response Format
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Activity className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {endpointGroups.length} API Groups
                    </div>
                    <div className="text-sm text-gray-600">
                      Endpoint Collections
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      Growing Adoption
                    </div>
                    <div className="text-sm text-gray-600">Trending APIs</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Endpoint Groups */}
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-semibold text-gray-900">
                API Endpoint Groups
              </h2>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6">
                {endpointGroups.map((group) => {
                  const hasAccess = userPlan
                    ? group.planAccess.includes(userPlan.id)
                    : false;
                  return (
                    <div
                      key={group.id}
                      className={`border rounded-xl p-6 transition-all ${
                        hasAccess
                          ? "border-green-200 bg-green-50"
                          : "border-gray-200"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {group.name}
                            </h3>
                            <Badge
                              variant={
                                group.category === "light"
                                  ? "success"
                                  : group.category === "heavy"
                                  ? "warning"
                                  : "info"
                              }
                              className="capitalize"
                            >
                              {group.category}
                            </Badge>
                            {hasAccess && (
                              <Badge variant="success" size="sm">
                                <CheckCircle size={12} className="mr-1" />
                                Included
                              </Badge>
                            )}
                          </div>
                          <p className="text-gray-600 mb-3">
                            {group.description}
                          </p>

                          <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                            <span className="flex items-center gap-1">
                              <Code size={14} />
                              {group.endpointCount} endpoints
                            </span>
                            <span className="flex items-center gap-1">
                              <Activity
                                size={14}
                                className={loadColors[group.loadLevel]}
                              />
                              {group.loadLevel} load
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {group.useCases.slice(0, 3).map((useCase, index) => (
                              <Badge
                                key={index}
                                variant="neutral"
                                size="sm"
                                className="text-xs"
                              >
                                {useCase}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <VerificationBadge
                            status={group.verification.status}
                            lastChecked={group.verification.lastChecked}
                          />
                          {!hasAccess && (
                            <Badge variant="neutral" size="sm">
                              Upgrade Required
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Sample Code */}
          {product.sampleCode && (
            <Card>
              <CardHeader>
                <h2 className="text-2xl font-semibold text-gray-900">
                  Quick Start
                </h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Example Request
                  </h3>
                  <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-green-400 text-sm font-mono whitespace-pre">
                      {product.sampleCode}
                    </pre>
                  </div>
                </div>

                {product.sampleResponse && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Example Response
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
                      <pre className="text-gray-800 text-sm font-mono whitespace-pre">
                        {product.sampleResponse}
                      </pre>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Active Subscription */}
          {userEntitlement && userPlan && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-green-900">
                    Active Subscription
                  </h3>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="font-semibold text-green-900">
                    {userPlan.name} Plan
                  </div>
                  <div className="text-sm text-green-700">
                    {formatPrice(userPlan.price || 0)}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-green-700">Monthly Limit</span>
                    <span className="font-medium text-green-900">
                      {userPlan.monthlyLimit.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-green-700">Rate Limit</span>
                    <span className="font-medium text-green-900">
                      {userPlan.rateLimit}/min
                    </span>
                  </div>
                </div>

                {masterKey && (
                  <div className="border-t border-green-200 pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-green-900">
                        Master Key
                      </span>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowMasterKey(!showMasterKey)}
                          className="text-green-700 hover:text-green-800"
                        >
                          {showMasterKey ? (
                            <EyeOff size={14} />
                          ) : (
                            <Eye size={14} />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleCopyKey(
                              showMasterKey
                                ? `sk_live_${masterKey.keyPreview}_full`
                                : `...${masterKey.keyPreview}`
                            )
                          }
                          className="text-green-700 hover:text-green-800"
                        >
                          <Copy size={14} />
                        </Button>
                      </div>
                    </div>
                    <code className="block text-xs font-mono bg-white border border-green-200 rounded px-2 py-1 text-green-800">
                      {showMasterKey
                        ? `sk_live_${masterKey.keyPreview}_full_key_here`
                        : `...${masterKey.keyPreview}`}
                    </code>
                  </div>
                )}

                <Button
                  className="w-full"
                  onClick={() =>
                    router.push(`/account/api-keys/${owner}/${slug}`)
                  }
                >
                  Manage API Keys
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Pricing Plans */}
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold text-gray-900">
                Pricing Plans
              </h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`border rounded-lg p-4 ${
                      userPlan?.id === plan.id
                        ? "border-green-300 bg-green-50"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">
                        {plan.name}
                      </h4>
                      <div className="text-right flex items-center gap-1">
                        <DollarSign size={16} className="text-green-600" />
                        <span className="font-bold text-lg text-gray-900">
                          {formatPrice(plan.price || 0)}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-3">
                      {plan.description}
                    </p>

                    {plan.features && (
                      <ul className="space-y-1 mb-4">
                        {plan.features.slice(0, 3).map((feature, index) => (
                          <li
                            key={index}
                            className="text-xs text-gray-600 flex items-center gap-2"
                          >
                            <CheckCircle
                              size={12}
                              className="text-green-500 flex-shrink-0"
                            />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    )}

                    {userPlan?.id === plan.id ? (
                      <Badge variant="success" className="w-full justify-center">
                        Current Plan
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => handlePurchase(plan.id)}
                      >
                        {currentUser.user ? "Subscribe" : "Sign In to Subscribe"}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Service Status */}
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold text-gray-900">
                Service Status
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <div>
                  <div className="font-medium text-gray-900">
                    All Systems Operational
                  </div>
                  <div className="text-sm text-gray-600 flex items-center gap-1">
                    <Clock size={12} />
                    Last checked:{" "}
                    {new Date(
                      product.verification.lastChecked!
                    ).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {product.verification.uptime30d}
                  </div>
                  <div className="text-xs text-gray-600">30-day uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    &lt;100ms
                  </div>
                  <div className="text-xs text-gray-600">Avg response</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="space-y-3">
              {product.docsUrl && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open(product.docsUrl, "_blank")}
                >
                  <ExternalLink size={16} className="mr-2" />
                  View Documentation
                </Button>
              )}

              <Button variant="outline" className="w-full">
                <Users size={16} className="mr-2" />
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
