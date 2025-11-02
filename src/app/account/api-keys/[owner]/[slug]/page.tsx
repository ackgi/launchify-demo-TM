// src/app/account/api-keys/[owner]/[slug]/page.tsx
"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Key,
  Copy,
  Trash2,
  Plus,
  Eye,
  EyeOff,
  Shield,
  ArrowLeft,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Activity,
  Zap,
  CreditCard,
} from "lucide-react";

import { Card, CardContent, CardHeader } from "@/app/components/ui/Card";
import Badge from "@/app/components/ui/Badge";
import { Button } from "@/app/components/ui/Button";
import { Modal, ModalContent, ModalFooter } from "@/app/components/ui/Modal";
import { mockData, currentUser } from "@/data/mockData";

export default function ProductApiKeysPage() {
  const router = useRouter();
  const params = useParams<{ owner: string; slug: string }>();
  const owner = params?.owner ?? "";
  const slug = params?.slug ?? "";

  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [newKeyData, setNewKeyData] = useState<{ key: string; name: string } | null>(null);
  const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({});
  const [showCancelModal, setShowCancelModal] = useState(false);

  const fullSlug = owner && slug ? `${owner}/${slug}` : "";

  // === Mock Data Lookup ===
  const product = mockData.products.find((p) => p.slug === fullSlug);
  const userEntitlement = mockData.entitlements.find(
    (e) =>
      e.userId === currentUser.user?.id &&
      e.productId === product?.id &&
      (e.status === "active" || e.status === "trialing")
  );
  const plan = userEntitlement
    ? mockData.plans.find((p) => p.id === userEntitlement.planId)
    : null;

  const keys = userEntitlement
    ? mockData.apiKeys.filter((k) => k.entitlementId === userEntitlement.id)
    : [];

  const masterKey = keys.find((k) => k.name === "Master Key") || keys[0];
  const additionalKeys = keys.filter((k) => k.name !== "Master Key");
  const canCreateNewKey = additionalKeys.length < 1; // only 1 extra key allowed

  // === Handlers ===
  const handleCreateKey = () => {
    const newKey = `sk_live_${Math.random().toString(36).substring(2, 15)}_${Math.random()
      .toString(36)
      .substring(2, 15)}`;
    setNewKeyData({
      key: newKey,
      name: `Development Key ${additionalKeys.length + 1}`,
    });
    setShowNewKeyModal(true);
  };

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeys((prev) => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const formatDateTime = (dateStr: string) =>
    new Date(dateStr).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const getNextBillingDate = () => {
    const startDate = new Date(userEntitlement!.createdAt);
    const nextMonth = new Date(startDate);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    return nextMonth.toISOString();
  };

  // === Empty State ===
  if (!product || !userEntitlement || !plan) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Contract Not Found</h1>
        <p className="text-gray-600 mb-8">
          The contract you're looking for doesn't exist or you don't have access to it.
        </p>
        <Button onClick={() => router.push("/account/api-keys")}>
          Back to My Contracts
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => router.push("/account/api-keys")}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Back to My Contracts
        </Button>
      </div>

      {/* Contract Header */}
      <Card>
        <CardContent className="p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-3">
                <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                <Badge
                  variant={
                    userEntitlement.status === "active"
                      ? "success"
                      : userEntitlement.status === "trialing"
                      ? "warning"
                      : "error"
                  }
                >
                  {userEntitlement.status}
                </Badge>
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <CreditCard size={16} />
                  <span>{plan.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>Since {formatDate(userEntitlement.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity size={16} />
                  <span>Next billing: {formatDate(getNextBillingDate())}</span>
                </div>
              </div>

              <p className="text-gray-600 max-w-3xl leading-relaxed">
                {plan.description && `${plan.description} - `}
                {product.description}
              </p>
            </div>

            <img
              src={product.thumbnail}
              alt={product.name}
              className="w-20 h-20 rounded-xl object-cover"
            />
          </div>
        </CardContent>
      </Card>

      {/* API Keys Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">API Keys</h2>
            <p className="text-sm text-gray-600">
              {keys.length}/2 keys in use • Master key + up to 1 additional key
            </p>
          </div>
          <Button onClick={handleCreateKey} disabled={!canCreateNewKey} size="sm">
            <Plus size={16} className="mr-2" />
            New Key
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Master Key */}
          {masterKey && (
            <div className="p-6 border-2 border-green-200 bg-green-50 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-900">{masterKey.name}</h3>
                    <p className="text-sm text-green-700">Primary contract access key</p>
                  </div>
                </div>
                <Badge variant="success" size="sm">
                  {masterKey.status}
                </Badge>
              </div>

              <div className="bg-white rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">API Key</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleKeyVisibility(masterKey.id)}
                    >
                      {showKeys[masterKey.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleCopyKey(
                          showKeys[masterKey.id]
                            ? `sk_live_master_${masterKey.keyPreview}_full_key_here`
                            : `sk_live_...${masterKey.keyPreview}`
                        )
                      }
                    >
                      <Copy size={16} />
                    </Button>
                  </div>
                </div>
                <code className="block px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono break-all">
                  {showKeys[masterKey.id]
                    ? `sk_live_master_${masterKey.keyPreview}_full_key_here`
                    : `sk_live_...${masterKey.keyPreview}`}
                </code>
              </div>

              <div className="flex items-center gap-6 text-sm text-green-700">
                {masterKey.lastUsed && (
                  <span>Last used: {formatDateTime(masterKey.lastUsed)}</span>
                )}
                {masterKey.expiresAt && (
                  <span>Expires: {formatDate(masterKey.expiresAt)}</span>
                )}
              </div>
            </div>
          )}

          {/* Additional Keys */}
          {additionalKeys.map((key) => (
            <div key={key.id} className="p-6 border border-gray-200 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Key className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{key.name}</h3>
                    <p className="text-sm text-gray-600">Additional development key</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={key.status === "active" ? "success" : "error"} size="sm">
                    {key.status}
                  </Badge>
                  <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">API Key</span>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => toggleKeyVisibility(key.id)}>
                      {showKeys[key.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleCopyKey(
                          showKeys[key.id]
                            ? `sk_live_dev_${key.keyPreview}_full_key_here`
                            : `sk_live_...${key.keyPreview}`
                        )
                      }
                    >
                      <Copy size={16} />
                    </Button>
                  </div>
                </div>
                <code className="block px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm font-mono break-all">
                  {showKeys[key.id]
                    ? `sk_live_dev_${key.keyPreview}_full_key_here`
                    : `sk_live_...${key.keyPreview}`}
                </code>
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-600">
                {key.lastUsed && <span>Last used: {formatDateTime(key.lastUsed)}</span>}
                {key.expiresAt && <span>Expires: {formatDate(key.expiresAt)}</span>}
              </div>
            </div>
          ))}

          {/* Create Key Placeholder */}
          {canCreateNewKey && (
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Key className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Create Additional Key</h3>
              <p className="text-sm text-gray-600 mb-4 max-w-sm mx-auto">
                Generate a development or staging key with the same contract permissions
              </p>
              <Button variant="outline" onClick={handleCreateKey}>
                <Plus size={16} className="mr-2" />
                Create Additional Key
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <Modal
        isOpen={showNewKeyModal}
        onClose={() => {
          setShowNewKeyModal(false);
          setNewKeyData(null);
        }}
        title="Additional API Key Generated"
      >
        <ModalContent>
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Key className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Additional Key Created</h3>
            <p className="text-sm text-gray-600">
              This key shares the same contract limits as your master key.
            </p>
          </div>

          {newKeyData && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700">Key Name</label>
                <input
                  type="text"
                  value={newKeyData.name}
                  onChange={(e) => setNewKeyData({ ...newKeyData, name: e.target.value })}
                  className="
                    w-full
                    text-sm
                    px-3
                    py-2
                    border
                    border-gray-300
                    rounded-md
                    bg-white
                    text-gray-900
                    focus:outline-none
                    focus:ring-2
                    focus:ring-blue-500
                    focus:border-blue-500
                    transition
                    placeholder:text-gray-400
                  "
                  placeholder="Enter key name"
                />

              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  API Key (save this now - it won't be shown again)
                </label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded text-sm font-mono break-all">
                    {newKeyData.key}
                  </code>
                  <Button variant="outline" size="sm" onClick={() => handleCopyKey(newKeyData.key)}>
                    <Copy size={16} />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </ModalContent>

        <ModalFooter>
          <Button
            onClick={() => {
              setShowNewKeyModal(false);
              setNewKeyData(null);
            }}
          >
            I've Saved the Key
          </Button>
        </ModalFooter>
      </Modal>

      {/* Cancel Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Subscription"
      >
        <ModalContent>
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Cancel {product.name} Subscription?
            </h3>
            <p className="text-sm text-gray-600">
              This action cannot be undone. All API keys will be deactivated immediately.
            </p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-medium text-red-800 mb-2">
              What happens when you cancel:
            </h4>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• All API keys will be immediately deactivated</li>
              <li>• You'll lose access to all endpoints</li>
              <li>• No refund for the current billing period</li>
              <li>• You can resubscribe anytime to restore access</li>
            </ul>
          </div>
        </ModalContent>

        <ModalFooter>
          <Button variant="outline" onClick={() => setShowCancelModal(false)}>
            Keep Subscription
          </Button>
          <Button variant="danger" onClick={() => setShowCancelModal(false)}>
            Cancel Subscription
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
