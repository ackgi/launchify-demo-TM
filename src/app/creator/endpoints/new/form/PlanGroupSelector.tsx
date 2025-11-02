"use client";
import { Plus, Code, Globe } from "lucide-react";
import Badge from "@/app/components/ui/Badge";
import { Button } from "@/app/components/ui/Button";
import { Field, Select } from "@/app/creator/endpoints/new/form/Field";

type Props = {
  plans: any[];
  planId: string;
  setPlanId: (v: string) => void;

  groups: any[];
  groupId: string;
  setGroupId: (v: string) => void;

  errors: Record<string, string[]>;
  pending: boolean;

  selectedPlan?: any;
  selectedGroup?: any;

  onOpenNewGroup: () => void;
};

export default function PlanGroupSelector({
  plans, planId, setPlanId,
  groups, groupId, setGroupId,
  errors, pending,
  selectedPlan, selectedGroup,
  onOpenNewGroup,
}: Props) {
  return (
    <section className="space-y-6">
      <Field id="plan-select" label="Plan *" error={errors.planId}>
        <Select
          id="plan-select"
          title="Plan"
          value={planId}
          onChange={(e) => { setPlanId(e.target.value); setGroupId(""); }}
          disabled={pending}
          className={errors.planId ? "border-red-300" : undefined}
        >
          <option value="">Select a plan...</option>
          {plans.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name ?? p.plan_name ?? "(no name)"}
            </option>
          ))}
        </Select>
      </Field>

      {selectedPlan && (
        <div className="bg-gray-50 rounded-lg p-4">
          <label className="block text-sm font-medium mb-2">Base URL</label>
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-gray-400" />
            <code className="text-sm font-mono">
              {selectedPlan.executionUrl ?? selectedPlan.service_endpoint_url ?? "https://api.example.com"}
            </code>
          </div>
        </div>
      )}

      {!!planId && (
        <div>
          <label htmlFor="group-select" className="block text-sm font-medium mb-2">Endpoint Group</label>
          <div className="flex gap-2">
            <Select
              id="group-select"
              title="Endpoint Group"
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              disabled={pending}
              className={errors.groupId ? "border-red-300" : undefined}
            >
              <option value="">Select a group...</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}{g.category ? ` (${g.category})` : ""}
                </option>
              ))}
            </Select>
            <Button variant="outline" onClick={onOpenNewGroup} disabled={pending || !planId}>
              <Plus size={16} /> New Group
            </Button>
          </div>
          {errors.groupId && <p className="mt-1 text-sm text-red-600">{errors.groupId.join(", ")}</p>}
        </div>
      )}

      {selectedGroup && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Code className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900">{selectedGroup.name}</h3>
              {selectedGroup.description && (
                <p className="text-sm text-blue-700 mb-2">{selectedGroup.description}</p>
              )}
              <div className="flex items-center gap-2">
                {selectedGroup.category && (
                  <Badge variant="info" size="sm" className="capitalize">
                    {selectedGroup.category}
                  </Badge>
                )}
                {typeof selectedGroup.endpointCount === "number" && (
                  <Badge variant="neutral" size="sm">
                    {selectedGroup.endpointCount} endpoints
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
