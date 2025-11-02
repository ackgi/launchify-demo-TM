/** @jsxImportSource react */
import { AlertTriangle } from "lucide-react";
import Badge from "@/app/components/ui/Badge";
import { EndpointGroupLite, PlanFormData } from "../../types";

type Props = {
  groups: EndpointGroupLite[];
  data: PlanFormData;
  setData: (u: Partial<PlanFormData>) => void;
  disabled: boolean;
  error?: string;
};

export default function GroupsSection({ groups, data, setData, disabled, error }: Props) {
  if (groups.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
          <AlertTriangle className="h-8 w-8 text-gray-400" aria-hidden />
        </div>
        <h4 className="mb-2 text-lg font-semibold text-gray-900">No Endpoint Groups</h4>
        <p className="mx-auto mb-6 max-w-sm text-gray-600">
          You need to create endpoint groups before you can link them to plans.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {groups.map((group) => {
        const checked = data.linkedGroups.includes(group.id);
        const toggle = (next: boolean) => {
          if (next) setData({ linkedGroups: [...data.linkedGroups, group.id] });
          else setData({ linkedGroups: data.linkedGroups.filter((id) => id !== group.id) });
        };
        const inputId = `linkGroup-${group.id}`;
        return (
          <label key={group.id} htmlFor={inputId}
            className={`flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-4 hover:bg-gray-50 ${
              disabled ? "cursor-not-allowed opacity-60" : ""
            }`}
          >
            <input
              id={inputId}
              type="checkbox"
              disabled={disabled}
              checked={checked}
              onChange={(e) => toggle(e.target.checked)}
              className="mt-1 rounded border-gray-300"
            />
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-2">
                <h4 className="font-medium text-gray-900">{group.name}</h4>
                {group.category && (
                  <Badge
                    variant={group.category === "light" ? "success" : group.category === "heavy" ? "warning" : "info"}
                  >
                    {group.category}
                  </Badge>
                )}
                {group.isDefault && (
                  <Badge variant="neutral" size="sm">
                    Default
                  </Badge>
                )}
              </div>
              {group.description && <p className="mb-2 text-sm text-gray-600">{group.description}</p>}
              <div className="flex items-center gap-4 text-xs text-gray-500">
                {typeof group.endpointCount === "number" && <span>{group.endpointCount} endpoints</span>}
                {group.loadLevel && <span>{group.loadLevel} load</span>}
              </div>
            </div>
          </label>
        );
      })}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
