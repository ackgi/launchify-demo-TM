// src/app/creator/endpoints/[endpointId]/edit/page.tsx
"use client";

import { useEffect, useState, use } from "react";
import { useAuth } from "@clerk/nextjs";
import { createBrowserClient } from "@/lib/supabase/client";
import EndpointForm from "../../new/EndpointForm";
import { Card, CardContent, CardHeader } from "@/app/components/ui/Card";

type ParamsPromise = Promise<{ endpointId: string }>;

export default function EditEndpointPage({ params }: { params: ParamsPromise }) {
  // ✅ Next.js 15: params は Promise。React.use で unwrap
  const { endpointId } = use(params);

  const { getToken } = useAuth();
  const [data, setData] = useState<{
    endpoint: any;
    plans: any[];
    groups: any[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken({ template: "supabase" });
        const supabase = createBrowserClient(token);

        const [{ data: endpoint, error: endpointError }, { data: plans }, { data: groups }] =
          await Promise.all([
            supabase.from("api_endpoints").select("*").eq("id", endpointId).single(),
            supabase.from("api_plans").select("*"),
            supabase
              .from("api_endpoint_groups")
              .select("*")
              .order("created_at", { ascending: false }),
          ]);

        if (endpointError || !endpoint) {
          setError("Endpoint not found");
          console.error(endpointError);
          return;
        }
        setData({ endpoint, plans: plans ?? [], groups: groups ?? [] });
      } catch (e) {
        console.error(e);
        setError("Failed to load endpoint data");
      }
    })();
  }, [getToken, endpointId]); // ✅ 依存は unwrap した endpointId に

  if (error) return <div className="p-8 text-red-500 text-center">{error}</div>;
  if (!data) return <div className="p-8 text-center">Loading...</div>;

  const { endpoint, plans, groups } = data;

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
            plans={plans}
            availableGroups={groups}
            initialData={endpoint}
          />
        </CardContent>
      </Card>
    </div>
  );
}
