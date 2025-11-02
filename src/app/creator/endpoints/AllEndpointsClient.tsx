// src/app/creator/endpoints/AllEndpointsClient.tsx
"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/app/components/ui/Button";
import type { EndpointRow, GroupRow, ProductRow, TestResult } from "./types";
import { useEndpointFilters } from "./hooks/useEndpointFilters";
import EndpointsStats from "./components/EndpointsStats";
import EndpointsFilters from "./components/EndpointsFilters";
import EndpointsTable from "./components/EndpointsTable";
import TestModal from "./components/TestModal";
import { deleteEndpointAction, bulkDeleteAction } from "./actions";

type Props = { endpoints: EndpointRow[]; groups: GroupRow[]; products: ProductRow[] };

export default function AllEndpointsClient({ endpoints, groups, products }: Props) {
  const router = useRouter();
  const { state, set, filtered } = useEndpointFilters(endpoints);
  const [selected, setSelected] = useState<string[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [testOpen, setTestOpen] = useState(false);
  const [testId, setTestId] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const canTest = (e: EndpointRow) => Boolean(e.path && e.method);

  const runTest = async (id: string): Promise<TestResult> => {
    setTestingId(id);
    const t0 = Date.now();
    await new Promise((r) => setTimeout(r, 600 + Math.random() * 1200));
    const ok = Math.random() > 0.2;
    const latency = Date.now() - t0;
    setTestingId(null);
    return { success: ok, status: ok ? 200 : 500, latency, response: ok ? '{"status":"ok"}' : '{"error":"failed"}' };
  };

// ✅ Promise<void> を返すように変更
const handleDelete = async (id: string): Promise<void> => {
  if (!id) return;
  if (!confirm("Delete this endpoint? This cannot be undone.")) return;

  setDeletingId(id);
  await new Promise<void>((resolve) =>
    startTransition(async () => {
      const res = await deleteEndpointAction(id);
      setDeletingId(null);
      if (!res.ok) alert(res.message || "Failed to delete");
      else router.refresh();
      resolve(); // ← 明示的にPromise解決
    })
  );
};
// ✅ bulkDelete も同様に
const bulkDelete = async (): Promise<void> => {
  if (selected.length === 0) return;
  if (!confirm(`Delete ${selected.length} endpoints?`)) return;

  setDeletingId("__bulk__");
  await new Promise<void>((resolve) =>
    startTransition(async () => {
      const res = await bulkDeleteAction(selected);
      setDeletingId(null);
      if (!res.ok) alert(res.message || "Failed to delete");
      else {
        if (res.deleted !== selected.length)
          alert(`Deleted ${res.deleted} of ${selected.length}.`);
        setSelected([]);
        router.refresh();
      }
      resolve();
    })
  );
};

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All API Endpoints</h1>
          <p className="text-gray-600 mt-2">Manage all your API endpoints across plans and groups</p>
        </div>
        <Button onClick={() => router.push("/creator/endpoints/new")}>
          <Plus size={18} className="mr-2" />
          New Endpoint
        </Button>
      </div>

      <EndpointsStats endpoints={filtered} />

      <EndpointsFilters
        searchId="endpoint-search"
        groupFilterId="endpoint-filter-group"
        methodFilterId="endpoint-filter-method"
        statusFilterId="endpoint-filter-status"
        groups={groups}
        values={{ searchTerm: state.searchTerm, method: state.methodFilter, status: state.statusFilter, group: state.groupFilter }}
        onChange={{
          search: set.setSearchTerm,
          method: set.setMethodFilter,
          status: set.setStatusFilter,
          group: set.setGroupFilter,
        }}
      />

      <EndpointsTable
        endpoints={filtered}
        groups={groups}
        products={products}
        selected={selected}
        setSelected={setSelected}
        canTest={canTest}
        testingId={testingId}
        onOpenTest={(id) => { setTestId(id); setTestOpen(true); }}
        onBulkDelete={bulkDelete}
        deletingId={deletingId}
        onDelete={handleDelete}
      />

      <TestModal
        isOpen={testOpen}
        onClose={() => { setTestOpen(false); setTestId(null); }}
        onRun={runTest}
        endpointId={testId}
      />
    </div>
  );
}
