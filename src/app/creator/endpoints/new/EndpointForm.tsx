// src/app/creator/endpoints/new/EndpointForm.tsx
"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Star } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { Field, Select, TextInput, Textarea } from "@/app/creator/endpoints/new/form/Field";

import type { HttpMethod, EpStatus } from "./types";
import EndpointTemplates from "./form/EndpointTemplates";
import AdvancedConfig from "./form/AdvancedConfig";
import TestPanel from "./form/TestPanel";
import PlanGroupSelector from "./form/PlanGroupSelector";
import NewGroupModal from "./form/NewGroupModal";
import { useEndpointForm } from "./form/useEndpointForm";

type Props = {
  presetGroupId: string;
  plans: any[];
  availableGroups: any[];
  initialData?: any;
};

export default function EndpointForm({ presetGroupId, plans, availableGroups, initialData }: Props) {
  const router = useRouter();
  const {
    pending, showAdvanced, setShowAdvanced,
    showNewGroupModal, setShowNewGroupModal, newGroupName, setNewGroupName,
    errors, testResult, formData, set,
    selectedPlan, selectedGroup, planGroups, getFullUrl,
    createGroup, testEndpoint, save,
  } = useEndpointForm(presetGroupId, plans, availableGroups, initialData);

  const onTemplate = (tpl: any) => {
    set("endpoint_name", tpl.name);
    set("method", tpl.method);
    set("path", tpl.path);
    set("description", tpl.description);
    set("inputSchema", tpl.inputSchema ?? "");
    set("outputSchema", tpl.outputSchema ?? "");
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => router.push("/creator/endpoints")}
          className="flex items-center gap-2"
          disabled={pending}
        >
          <ArrowLeft size={16} /> Back to Endpoints
        </Button>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900">Create</h2>
          <p className="text-gray-600">Fill the form to create an endpoint</p>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Plan / Group */}
          <PlanGroupSelector
            plans={plans}
            planId={formData.planId ?? ""}
            setPlanId={(v) => set("planId", v)}
            groups={planGroups}
            groupId={formData.groupId}
            setGroupId={(v) => set("groupId", v)}
            errors={errors}
            pending={pending}
            selectedPlan={selectedPlan}
            selectedGroup={selectedGroup}
            onOpenNewGroup={() => setShowNewGroupModal(true)}
          />

          {/* Templates */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900">Quick Templates</h3>
            <p className="text-sm text-gray-600 mb-3">Start with a common endpoint pattern</p>
            <EndpointTemplates disabled={pending} onSelect={onTemplate} />
          </section>

          {/* Definition */}
          <section className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Define Endpoint</h2>
            <p className="text-gray-600">Configure your endpoint details and behavior</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field id="endpoint-name" label="Endpoint Name *" error={errors.endpoint_name}>
                <TextInput
                  id="endpoint-name"
                  value={formData.endpoint_name}
                  onChange={(e) => set("endpoint_name", e.target.value)}
                  placeholder="e.g., Current Weather"
                  disabled={pending}
                  className={errors.endpoint_name ? "border-red-300" : undefined}
                />
              </Field>

              <Field id="method-select" label="HTTP Method *">
                <Select
                  id="method-select"
                  title="HTTP Method"
                  value={formData.method}
                  onChange={(e) => set("method", e.target.value as HttpMethod)}
                  disabled={pending}
                >
                  {/* DBの http_method_enum に合わせる（HEAD/OPTIONSは除外が安全） */}
                  {["GET", "POST", "PUT", "PATCH", "DELETE"].map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </Select>
              </Field>
            </div>

            <Field id="path-input" label="Full URL or Relative Path *" error={errors.path}>
              <TextInput
                id="path-input"
                type="url"
                value={formData.path}
                onChange={(e) => set("path", e.target.value)}
                placeholder="https://myapi.vercel.app/api/weather/current  or  /predict"
                disabled={pending}
                className={errors.path ? "border-red-300" : undefined}
              />
              <p className="mt-1 text-sm text-gray-600">
                Enter a full URL (starts with http...) or a relative path like <code>/predict</code>.
              </p>
            </Field>

            <Field id="description" label="Description">
              <Textarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Describe what this endpoint does..."
                disabled={pending}
              />
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field id="status-select" label="Status">
                <Select
                  id="status-select"
                  title="Status"
                  value={formData.status}
                  onChange={(e) => set("status", e.target.value as EpStatus)}
                  disabled={pending}
                  className="text-base"
                >
                  {[
                    "draft",
                    "private",
                    "restricted",
                    "pending_public",
                    "paused",
                    // 必要に応じて enum に存在する値のみ追加（public/deprecated/disabled 等）
                  ].map((s) => (
                    <option key={s} value={s}>
                      {s.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase())}
                    </option>
                  ))}
                </Select>
              </Field>

              <div className="flex items-center">
                <label
                  htmlFor="primary-toggle"
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    id="primary-toggle"
                    type="checkbox"
                    className="sr-only"
                    checked={formData.isPrimary}
                    onChange={(e) => set("isPrimary", e.target.checked)}
                    aria-label="Set as Primary Endpoint"
                    disabled={pending}
                  />
                  <Star
                    size={20}
                    className={formData.isPrimary ? "text-yellow-500 fill-current" : "text-gray-400"}
                  />
                  <span className="text-sm font-medium">Set as Primary Endpoint</span>
                </label>
              </div>
            </div>

            <AdvancedConfig
              open={showAdvanced}
              setOpen={setShowAdvanced}
              inputSchema={formData.inputSchema}
              setInputSchema={(v) => set("inputSchema", v)}
              outputSchema={formData.outputSchema}
              setOutputSchema={(v) => set("outputSchema", v)}
              visibility={formData.visibility}
              setVisibility={(v) => set("visibility", v)}
              errors={errors}
              disabled={pending}
            />

            <TestPanel
              fullUrl={getFullUrl()}  // フック側で http 始まりはそのまま返す実装に
              onTest={testEndpoint}
              pending={pending}
              result={testResult}
            />

            {errors.form && (
              <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-sm text-red-800">
                {errors.form.join(", ")}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button variant="outline" onClick={() => save("save-and-add")} disabled={pending}>
                Create & Add Another
              </Button>
              <Button variant="outline" onClick={() => save("save-and-open")} disabled={pending}>
                {formData.groupId ? "Create & Open Group" : "Create & Back to List"}
              </Button>
              <Button onClick={() => save("save")} disabled={pending}>Create Endpoint</Button>
            </div>
          </section>
        </CardContent>
      </Card>

      <NewGroupModal
        open={showNewGroupModal}
        onClose={() => setShowNewGroupModal(false)}
        pending={pending}
        newGroupName={newGroupName}
        setNewGroupName={setNewGroupName}
        selectedPlanName={selectedPlan?.name ?? selectedPlan?.plan_name}
        errorText={errors.groupId}
        onCreate={createGroup}
        canCreate={!!newGroupName.trim() && !!formData.planId}
      />
    </div>
  );
}
