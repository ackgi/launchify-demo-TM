// src/app/creator/endpoints/[endpointId]/edit/page.tsx
import { supabaseAdmin } from "@/lib/supabase/admin";
import EndpointForm from "../../new/EndpointForm";
import { Card, CardContent, CardHeader } from "@/app/components/ui/Card";

// ✅ default は同期＆any受け取り（型制約を回避）
export default function EditEndpointPage(props: any) {
  return <EditEndpointPageInner {...props} />;
}

// 実処理は async の内側に分離して型を正しく付ける（Server Component）
async function EditEndpointPageInner({
  params,
}: {
  params: { endpointId: string };
}) {
  const endpointId = params.endpointId;

  const [
    { data: endpoint, error: endpointError },
    { data: plans },
    { data: groups },
  ] = await Promise.all([
    supabaseAdmin
      .from("api_endpoints")
      .select("*")
      .eq("id", endpointId)
      .single(),
    supabaseAdmin.from("api_plans").select("*"),
    supabaseAdmin.from("api_endpoint_groups").select("*"),
  ]);

  if (endpointError || !endpoint) {
    console.error(endpointError);
    return (
      <div className="p-8 text-red-500 text-center">Endpoint not found</div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Edit Endpoint</h2>
        </CardHeader>
        <CardContent>
          <EndpointForm
            mode="edit"
            presetGroupId={endpoint.group_id ?? ""}
            plans={plans ?? []}
            availableGroups={groups ?? []}
            initialData={endpoint}
            // onCancel は渡さない（Client の EndpointForm 側で router.push を実施）
          />
        </CardContent>
      </Card>
    </div>
  );
}
