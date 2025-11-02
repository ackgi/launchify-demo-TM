// src/app/creator/endpoints/new/types.ts
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";
export type EpStatus = "draft" | "preview" | "public" | "deprecated" | "disabled";
export type Visibility = "catalog" | "unlisted" | "invited" | "internal";

/** フォームの単一の真実：Plan と Group に紐づく */
export interface EndpointFormData {
  planId: string;            // ✅ Plan を必須キーに
  groupId: string;
  endpoint_name: string;
  path: string;
  method: HttpMethod;
  status: EpStatus;
  isPrimary: boolean;
  description: string;
  inputSchema: string;
  outputSchema: string;
  visibility: Visibility;
}

/** テスト結果共通型 */
export type TestResult =
  | null
  | { success: boolean; status: number; latency: number; response: string };
