// src/app/creator/endpoints/new/actions.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { createServerClient } from "@/lib/supabase/server";
import { endpointSchema } from "@/lib/validators/endpoint";
import type { EndpointFormData, TestResult } from "./types";

export async function createEndpointAction(raw: EndpointFormData) {
  const { userId, getToken } = await auth();
  if (!userId) return { ok: false, message: "Unauthorized" };
  const jwt = await getToken({ template: "supabase" });
  if (!jwt) return { ok: false, message: "Failed to get Supabase token" };

  const parsed = endpointSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const data = parsed.data;

  const sb = createServerClient(jwt);

  let inputJson: any = null;
  let outputJson: any = null;
  if (data.inputSchema) {
    try { inputJson = JSON.parse(data.inputSchema); }
    catch { return { ok: false, fieldErrors: { inputSchema: ["Invalid JSON"] } }; }
  }
  if (data.outputSchema) {
    try { outputJson = JSON.parse(data.outputSchema); }
    catch { return { ok: false, fieldErrors: { outputSchema: ["Invalid JSON"] } }; }
  }

  if (data.status !== "draft" && data.endpoint_name && data.groupId) {
    const { data: dup, error: dupErr } = await sb
      .from("api_endpoints")
      .select("id,endpoint_name,group_id")
      .eq("group_id", data.groupId)
      .ilike("endpoint_name", data.endpoint_name)
      .limit(1);
    if (dupErr) return { ok: false, message: dupErr.message };
    if (dup && dup.length > 0) {
      return { ok: false, fieldErrors: { endpoint_name: ["Endpoint name must be unique within the selected group"] } };
    }
  }

  const { data: inserted, error } = await sb
    .from("api_endpoints")
    .insert({
      plan_id: data.planId || null,
      group_id: data.groupId || null,
      endpoint_name: data.endpoint_name,
      path: data.path || null,
      method: data.method,
      status: data.status,
      description: data.description || null,
      input_schema: inputJson,
      output_schema: outputJson,
      visibility: data.visibility,
      is_primary: data.isPrimary ?? false,
      created_by: userId,
    })
    .select("id")
    .single();

  if (error) return { ok: false, message: error.message };
  return { ok: true, id: inserted!.id as string };
}

export async function updateEndpointAction(id: string, raw: EndpointFormData) {
  const { userId, getToken } = await auth();
  if (!userId) return { ok: false, message: "Unauthorized" };
  const jwt = await getToken({ template: "supabase" });
  if (!jwt) return { ok: false, message: "Failed to get Supabase token" };

  const parsed = endpointSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const data = parsed.data;

  const sb = createServerClient(jwt);

  let inputJson: any = null;
  let outputJson: any = null;
  if (data.inputSchema) {
    try { inputJson = JSON.parse(data.inputSchema); }
    catch { return { ok: false, fieldErrors: { inputSchema: ["Invalid JSON"] } }; }
  }
  if (data.outputSchema) {
    try { outputJson = JSON.parse(data.outputSchema); }
    catch { return { ok: false, fieldErrors: { outputSchema: ["Invalid JSON"] } }; }
  }

  const { data: current, error: curErr } = await sb
    .from("api_endpoints")
    .select("id, group_id")
    .eq("id", id)
    .single();
  if (curErr || !current) return { ok: false, message: curErr?.message ?? "Endpoint not found" };

  const nextGroupId = data.groupId || current.group_id || null;

  if (data.status !== "draft" && data.endpoint_name && nextGroupId) {
    const { data: dup, error: dupErr } = await sb
      .from("api_endpoints")
      .select("id,endpoint_name,group_id")
      .eq("group_id", nextGroupId)
      .ilike("endpoint_name", data.endpoint_name)
      .neq("id", id)
      .limit(1);
    if (dupErr) return { ok: false, message: dupErr.message };
    if (dup && dup.length > 0) {
      return { ok: false, fieldErrors: { endpoint_name: ["Endpoint name must be unique within the selected group"] } };
    }
  }

  const { error } = await sb
    .from("api_endpoints")
    .update({
      plan_id: data.planId || null,
      group_id: nextGroupId,
      endpoint_name: data.endpoint_name,
      path: data.path || null,
      method: data.method,
      status: data.status,
      description: data.description || null,
      input_schema: inputJson,
      output_schema: outputJson,
      visibility: data.visibility,
      is_primary: data.isPrimary ?? false,
    })
    .eq("id", id);

  if (error) return { ok: false, message: error.message };
  return { ok: true, id };
}

export async function createGroupAction(planId: string, name: string) {
  const { userId, getToken } = await auth();
  if (!userId) return { ok: false, message: "Unauthorized" };
  const jwt = await getToken({ template: "supabase" });
  if (!jwt) return { ok: false, message: "Failed to get Supabase token" };

  const sb = createServerClient(jwt);
  const { data, error } = await sb
    .from("api_endpoint_groups")
    .insert({
      plan_id: planId || null,
      name: name.trim(),
      created_by: userId,
    })
    .select("id")
    .single();

  if (error) return { ok: false, message: error.message };
  return { ok: true, id: data!.id as string };
}

export async function testEndpointAction(
  baseUrl: string,
  path: string,
  method: string
): Promise<TestResult> {
  if (!baseUrl || !path) return null;
  const url = path.startsWith("http") ? path : `${baseUrl}${path}`;
  const t0 = Date.now();
  try {
    const res = await fetch(url, { method, cache: "no-store" });
    const latency = Date.now() - t0;
    const text = await res.text();
    return { success: res.ok, status: res.status, latency, response: text };
  } catch {
    const latency = Date.now() - t0;
    return { success: false, status: 500, latency, response: "Request failed" };
  }
}
