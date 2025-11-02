"use client";
import { Button } from "@/app/components/ui/Button";
import Badge from "@/app/components/ui/Badge";
import { Card, CardContent, CardHeader } from "@/app/components/ui/Card";
import { Activity, CreditCard as Edit, Play, Star, StarOff, Code, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { groupName, productName } from "../hooks/useEndpointFilters";
import type { EndpointRow, GroupRow, ProductRow, TestResult } from "../types";

type Props = {
  endpoints: EndpointRow[];
  groups: GroupRow[];
  products: ProductRow[];
  selected: string[];
  setSelected: (ids: string[]) => void;
  canTest: (e: EndpointRow) => boolean;
  testingId: string | null;
  onOpenTest: (id: string) => void;
  onBulkDelete: () => Promise<void>;
  deletingId: string | null;
  onDelete: (id: string) => Promise<void>;
};

export default function EndpointsTable({
  endpoints, groups, products, selected, setSelected,
  canTest, testingId, onOpenTest, onBulkDelete, deletingId, onDelete
}: Props) {
  const router = useRouter();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Endpoints ({endpoints.length})</h2>
          {selected.length > 0 && (
            <Button variant="danger" size="sm" onClick={onBulkDelete} disabled={!!deletingId}>
              <Trash2 size={16} className="mr-1" />
              Delete {selected.length}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {endpoints.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Code className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Endpoints Found</h3>
            <p className="text-gray-600 mb-6 max-w-sm mx-auto">
              No endpoints match your current filters. Try adjusting your search criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 w-8">
                    <input
                      type="checkbox"
                      aria-label="Select all endpoints"
                      checked={endpoints.length > 0 && selected.length === endpoints.length}
                      onChange={(e) => setSelected(e.target.checked ? endpoints.map(ep => ep.id) : [])}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">Path</th>
                  <th className="text-left py-3 px-4">Method</th>
                  <th className="text-left py-3 px-4">Group</th>
                  <th className="text-left py-3 px-4">Product</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Primary</th>
                  <th className="text-right py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {endpoints.map((e) => {
                  const name = e.endpoint_name ?? e.name ?? "(no name)";
                  return (
                    <tr key={e.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <input
                          type="checkbox"
                          aria-label={`Select endpoint ${name}`}
                          checked={selected.includes(e.id)}
                          onChange={(ev) =>
                            setSelected(
                              ev.target.checked
                                ? [...selected, e.id]
                                : selected.filter((id) => id !== e.id)
                            )
                          }
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <h3 className="font-medium text-gray-900">{name}</h3>
                          {e.description && <p className="text-sm text-gray-500 truncate max-w-xs">{e.description}</p>}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {e.path ? <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">{e.path}</code> : <span className="text-sm text-gray-400">—</span>}
                      </td>
                      <td className="py-4 px-4">
                        {e.method ? (
                          <Badge variant={
                            e.method === "GET" ? "success" :
                            e.method === "POST" ? "info" :
                            e.method === "PUT" ? "warning" :
                            e.method === "DELETE" ? "error" : "neutral"
                          } size="sm">{e.method}</Badge>
                        ) : <span className="text-sm text-gray-400">—</span>}
                      </td>
                      <td className="py-4 px-4 text-sm">{groupName(e.group_id, groups)}</td>
                      <td className="py-4 px-4 text-sm text-gray-600">{productName(e, groups, products)}</td>
                      <td className="py-4 px-4">
                        <Badge variant={e.status === "public" ? "success" : "neutral"}>{e.status || "draft"}</Badge>
                      </td>
                      <td className="py-4 px-4">
                        {e.is_primary ? <Star size={16} className="text-yellow-500 fill-current" /> : <StarOff size={16} className="text-gray-400" />}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2 justify-end">
                          <Button variant="ghost" size="sm" onClick={() => onOpenTest(e.id)} disabled={!canTest(e) || testingId === e.id} title={canTest(e) ? "Test Endpoint" : "Test unavailable for draft"}>
                            {testingId === e.id ? <Activity size={16} className="animate-spin" /> : <Play size={16} />}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => router.push(`/creator/endpoints/${encodeURIComponent(e.id)}/edit`)} title="Edit Endpoint">
                            <Edit size={16} />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => onDelete(e.id)} disabled={deletingId === e.id} title="Delete">
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
