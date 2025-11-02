// launchify-bolt-next/src/types/index.ts

export interface User {
  id: string;
  displayName: string;
  avatar?: string;
  role: "buyer" | "creator";
}

export interface Product {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  banner?: string;
  docsUrl?: string;
  slug: string;
  executionUrl: string;
  contentType: string;
  status: "draft" | "private" | "public";
  useCases?: string[];
  sampleCode?: string;
  sampleResponse?: string;
  uptimePolicy: {
    alwaysUp: boolean;
    description?: string;
  };
  verification: {
    status: "success" | "failure" | "unknown";
    lastChecked?: string;
    uptime30d?: string;
  };
  createdBy: string;
}

export interface Endpoint {
  id: string;
  productId: string;
  groupId?: string;
  name: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  path: string;
  status: "draft" | "public";
  description?: string;
  inputSchema?: string;
  outputSchema?: string;
  lastUpdated: string;
  isPrimary?: boolean;
  sampleRequest?: string;
  sampleResponse?: string;
}

export interface EndpointGroup {
  id: string;
  productId: string;
  name: string;
  description: string;
  category: "light" | "heavy" | "admin" | "premium";
  loadLevel: "low" | "medium" | "high";
  useCases: string[];
  endpointCount: number;
  isDefault: boolean;
  downstreamCredential: {
    id: string;
    authKind: "bearer" | "header" | "query" | "basic" | "oauth2" | "hmac";
    inject: Record<string, any>;
    secretRef: string;
    version: number;
    status: "active" | "standby" | "deprecated";
  };
  verification: {
    status: "success" | "failure" | "unknown";
    lastChecked?: string;
  };
  planAccess: string[]; // Plan IDs that have access
}

export interface Plan {
  id: string;
  productId: string;
  name: string;
  description?: string;
  price?: number;
  monthlyLimit: number;
  rateLimit: number; // per minute
  status: "active" | "inactive";
  features?: string[];
}

export interface Entitlement {
  id: string;
  userId: string;
  productId: string;
  planId: string;
  status: "active" | "trialing" | "cancelled";
  createdAt: string;
}

export interface ApiKey {
  id: string;
  entitlementId: string;
  name: string;
  keyPreview: string; // last 4 characters
  expiresAt?: string;
  status: "active" | "revoked";
  lastUsed?: string;
}

export interface VerificationLog {
  id: string;
  productId: string;
  endpointId: string;
  timestamp: string;
  result: "success" | "failure";
  httpStatus: number;
  responseTime: number;
}

export interface MockData {
  users: User[];
  products: Product[];
  endpoints: Endpoint[];
  endpointGroups: EndpointGroup[];
  plans: Plan[];
  entitlements: Entitlement[];
  apiKeys: ApiKey[];
  verificationLogs: VerificationLog[];
}
