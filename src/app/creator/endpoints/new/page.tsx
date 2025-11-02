// src/app/creator/endpoints/new/page.tsx
import EndpointForm from "./EndpointForm";
import { createServerClient } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

// ✅ defaultは同期・any受け取りで型制約を回避
export default function NewEndpointPage(props: any) {
  return <NewEndpointPageInner {...props} />;
}

// 実処理は async の中に分離
async function NewEndpointPageInner({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const { userId, getToken } = await auth();
  if (!userId) return <div className="p-6">Unauthorized</div>;

  const jwt = await getToken({ template: "supabase" });
  if (!jwt) return <div className="p-6 text-red-600">Failed to get Supabase token</div>;

  const sb = createServerClient(jwt);

  const idRaw = searchParams?.groupId;
  const presetGroupId =
    typeof idRaw === "string" ? idRaw : Array.isArray(idRaw) ? idRaw[0] ?? "" : "";

  const [{ data: plansRaw, error: plansErr }, { data: groupsRaw, error: groupsErr }] =
    await Promise.all([
      sb.from("api_plans").select("*").order("created_at", { ascending: false }),
      sb.from("api_endpoint_groups").select("*"),
    ]);

  if (plansErr) console.error("[NewEndpointPage] plans:", plansErr.message);
  if (groupsErr) console.error("[NewEndpointPage] groups:", groupsErr.message);

  const plans = Array.isArray(plansRaw) ? plansRaw : [];
  const availableGroups = Array.isArray(groupsRaw) ? groupsRaw : [];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">New API Endpoint</h1>
          <p className="text-lg text-gray-600 mt-1">Create a new endpoint for your API plan</p>
        </div>
      </div>
      <EndpointForm
        presetGroupId={presetGroupId}
        plans={plans}
        availableGroups={availableGroups}
      />
    </div>
  );
}
