import { Layers, Edit, Trash2, Clock } from "lucide-react";
import Badge from "@/app/components/ui/Badge";
import GroupStatusBadge, { STATUS_BADGE_VARIANT } from "./GroupStatusBadge";
import type { GroupRow } from "./types";

type Props = {
  loading: boolean;
  errorMsg: string | null;
  groups: GroupRow[];
  planNameById: Map<string, string>;
  onClickEdit: (id: string) => void;
  onClickDelete: (id: string, name: string) => void;
};

export default function GroupListTable({
  loading,
  errorMsg,
  groups,
  planNameById,
  onClickEdit,
  onClickDelete,
}: Props) {
  if (loading) return <div className="py-16 text-center text-gray-600">Loading groups…</div>;
  if (errorMsg)
    return (
      <div className="py-16 text-center text-red-600" role="alert">
        {errorMsg}
      </div>
    );

  if (groups.length === 0)
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Layers className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Endpoint Groups Yet</h3>
        <p className="text-gray-600 mb-6 max-w-sm mx-auto">
          Create endpoint groups to organize your API functionality and control access.
        </p>
      </div>
    );

  return (
    <div className="overflow-x-auto">
      <table className="w-full" aria-label="API endpoint groups">
        <thead>
          <tr className="border-b border-gray-200">
            <th scope="col" className="text-left py-3 px-4 font-medium text-gray-900">
              Group Name
            </th>
            <th scope="col" className="text-left py-3 px-4 font-medium text-gray-900">
              Product
            </th>
            <th scope="col" className="text-left py-3 px-4 font-medium text-gray-900">
              Linked Plan
            </th>
            <th scope="col" className="text-left py-3 px-4 font-medium text-gray-900">
              Status
            </th>
            <th scope="col" className="text-right py-3 px-4 font-medium text-gray-900">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {groups.map((g) => {
            const planName = g.plan_id ? planNameById.get(g.plan_id) ?? "—" : "—";
            const status = g.status;

            return (
              <tr key={g.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-4 px-4">
                  <div className="max-w-sm">
                    <h3 className="font-medium text-gray-900">{g.group_name}</h3>
                    {g.description ? (
                      <p className="text-sm text-gray-500 truncate">{g.description}</p>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </div>
                </td>

                {/* Product（現状は不明のためダッシュ） */}
                <td className="py-4 px-4 text-gray-700">
                  <span className="text-gray-500">—</span>
                </td>

                <td className="py-4 px-4 text-gray-700">
                  {planName ? <span className="text-gray-800">{planName}</span> : <span className="text-gray-500">—</span>}
                </td>

                <td className="py-4 px-4">
                  {status ? (
                    <Badge variant={STATUS_BADGE_VARIANT[status]}>
                      {status}
                    </Badge>
                  ) : (
                    <span className="inline-flex items-center gap-2 text-sm text-gray-600 bg-gray-100 rounded-full px-3 py-1">
                      <Clock size={14} />
                      Unknown
                    </span>
                  )}
                </td>

                <td className="py-4 px-4">
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      className="px-2 py-1 rounded hover:bg-gray-100"
                      onClick={() => onClickEdit(g.id)}
                      aria-label={`Edit group ${g.group_name}`}
                      title="Edit Group"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="px-2 py-1 rounded text-red-600 hover:bg-red-50"
                      onClick={() => onClickDelete(g.id, g.group_name)}
                      aria-label={`Delete group ${g.group_name}`}
                      title="Delete Group"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
