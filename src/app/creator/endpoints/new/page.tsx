import EndpointForm from "./EndpointForm";
import { createServerClient } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";

type PageProps = {
  searchParams?: { [key: string]: string | string[] | undefined };
};

export const dynamic = "force-dynamic";

export default async function NewEndpointPage({ searchParams }: PageProps) {
  // ✅ await を付ける（ここがエラー原因）
  const { userId, getToken } = await auth();
  if (!userId) return <div className="p-6">Unauthorized</div>;

  const jwt = await getToken({ template: "supabase" });
  if (!jwt) return <div className="p-6 text-red-600">Failed to get Supabase token</div>;

  // JWT を注入して RLS 有効な Supabase クライアントを作成
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

  const plans: any[] = Array.isArray(plansRaw) ? plansRaw : [];
  const availableGroups: any[] = Array.isArray(groupsRaw) ? groupsRaw : [];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">New API Endpoint</h1>
          <p className="text-lg text-gray-600 mt-1">Create a new endpoint for your API plan</p>
        </div>
      </div>

      <EndpointForm presetGroupId={presetGroupId} plans={plans} availableGroups={availableGroups} />
    </div>
  );
}
