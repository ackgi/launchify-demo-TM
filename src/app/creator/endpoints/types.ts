export type EndpointRow = {
  id: string;
  product_id: string | null;
  group_id: string | null;
  endpoint_name?: string | null;
  name?: string | null;
  path: string | null;
  method: string | null;
  status: string | null;
  is_primary: boolean | null;
  description: string | null;
  input_schema: unknown | null;
  output_schema: unknown | null;
  visibility: string | null;
  updated_at?: string | null;
};

export type GroupRow = {
  id: string;
  product_id: string;
  name: string;
  description?: string | null;
  category?: string | null;
};

export type ProductRow = { id: string; name: string; executionUrl?: string | null };

export type TestResult = { success: boolean; status: number; latency: number; response: string };
