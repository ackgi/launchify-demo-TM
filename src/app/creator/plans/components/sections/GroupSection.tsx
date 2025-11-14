"use client";

import { AlertTriangle } from "lucide-react";
import Badge from "@/app/components/ui/Badge";
import { EndpointGroupLite, PlanFormData } from "../types";
import { isRequired } from "../PlanTemplateConfig";

/** 🔵 Coming Soon フラグ（後で false にするだけで復活） */
const COMING_SOON_MODE = true;

type Props = {
  formData: PlanFormData;
  setFormData: React.Dispatch<React.SetStateAction<PlanFormData>>;
  availableGroups: EndpointGroupLite[];
  errors: Record<string, string>;
  dis: boolean;
  req: (field: Parameters<typeof isRequired>[0]) => boolean;
};

export function GroupSection({
  formData,
  setFormData,
  availableGroups,
  errors,
  dis,
  req,
}: Props) {
  return (
    <section className="space-y-4">
      <h3 className="font-semibold text-gray-900">
        Endpoint Groups{" "}
        {req("linkedGroups") && <span className="text-red-600">*</span>}
      </h3>

      {/* 🔵 Coming Soon 表示（コードは消さず、UI だけ差し替え） */}
      {COMING_SOON_MODE && (
        <div className="rounded-lg border border-gray-300 bg-gray-50 p-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-gray-200">
            <AlertTriangle className="h-8 w-8 text-gray-500" />
          </div>

          <h4 className="text-lg font-semibold text-gray-900 mb-1">
            Endpoint Groups — Coming Soon
          </h4>

          <p className="text-gray-600 max-w-md mx-auto">
            This feature is currently under development and will be available soon.
          </p>
        </div>
      )}

      {/* 🔵 本来の UI（hidden だがコードは残す） */}
      <div className={COMING_SOON_MODE ? "hidden" : "space-y-3"}>
        {availableGroups.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
              <AlertTriangle className="h-8 w-8 text-gray-400" aria-hidden />
            </div>
            <h4 className="mb-2 text-lg font-semibold text-gray-900">
              No Endpoint Groups
            </h4>
            <p className="mx-auto mb-6 max-w-sm text-gray-600">
              You need to create endpoint groups before you can link them to plans.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {availableGroups.map((group) => {
              const checked = formData.linkedGroups.includes(group.id);
              const inputId = `linkGroup-${group.id}`;

              return (
                <label
                  key={group.id}
                  htmlFor={inputId}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-4 hover:bg-gray-50 ${
                    dis ? "cursor-not-allowed opacity-60" : ""
                  }`}
                >
                  <input
                    id={inputId}
                    type="checkbox"
                    disabled={dis}
                    checked={checked}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData((p) => ({
                          ...p,
                          linkedGroups: [...p.linkedGroups, group.id],
                        }));
                      } else {
                        setFormData((p) => ({
                          ...p,
                          linkedGroups: p.linkedGroups.filter(
                            (id) => id !== group.id
                          ),
                        }));
                      }
                    }}
                    className="mt-1 rounded border-gray-300"
                    aria-describedby={`${inputId}-desc`}
                  />

                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <h4 className="font-medium text-gray-900">
                        {group.name}
                      </h4>

                      {group.category && (
                        <Badge
                          variant={
                            group.category === "light"
                              ? "success"
                              : group.category === "heavy"
                              ? "warning"
                              : "info"
                          }
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

                    {group.description && (
                      <p
                        id={`${inputId}-desc`}
                        className="mb-2 text-sm text-gray-600"
                      >
                        {group.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      {typeof group.endpointCount === "number" && (
                        <span>{group.endpointCount} endpoints</span>
                      )}
                      {group.loadLevel && (
                        <span>{group.loadLevel} load</span>
                      )}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        )}

        {errors.linkedGroups && (
          <p className="text-sm text-red-600">{errors.linkedGroups}</p>
        )}
      </div>
    </section>
  );
}
