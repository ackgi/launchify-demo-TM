//src\app\api\groups\route.ts
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getSupabaseAdmin() {
  const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!URL || !SERVICE_ROLE) throw new Error("Supabase admin env missing");
  return createClient(URL, SERVICE_ROLE, { auth: { persistSession: false } });
}

// 診断用 GET（生存確認）
export async function GET() {
  return Response.json({ ok: true, route: "/api/groups" }, { status: 200 });
}

export async function POST(req: Request) {
  try {
    const sess = await auth();
    const userId = (sess as any)?.userId;
    if (!userId) {
      return Response.json({ error: "Unauthorized: missing userId" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    if (!body) return Response.json({ error: "Invalid body" }, { status: 400 });

    const {
      plan_id,
      group_name,
      description,
      status,
      is_default,
      credential_source,
      auth_type,
      injection_config,
      secret_ref,
    } = body;

    if (!group_name || typeof group_name !== "string") {
      return Response.json({ error: "Invalid group_name" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("api_endpoint_groups")
      .insert({
        plan_id,
        group_name,
        description,
        status,
        is_default,
        credential_source,
        auth_type,
        injection_config,
        secret_ref,
        created_by: userId,
      })
      .select("id")
      .single();

    if (error) {
      return Response.json(
        {
          error: error.message ?? "Database insert failed",
          details: (error as any)?.details ?? null,
          hint: (error as any)?.hint ?? null,
          code: (error as any)?.code ?? null,
        },
        { status: 500 }
      );
    }

    return Response.json({ id: data.id }, { status: 200 });
  } catch (err: any) {
    return Response.json(
      { error: err?.message ?? "Unexpected server error", stack: err?.stack ?? null },
      { status: 500 }
    );
  }
}
