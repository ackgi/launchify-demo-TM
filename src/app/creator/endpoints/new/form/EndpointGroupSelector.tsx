"use client";

import { Button } from "@/app/components/ui/Button";
import { Field, Select } from "@/app/creator/endpoints/new/form/Field";

type Props = {
  groups: any[];
  groupId?: string;
  setGroupId: (v: string) => void;

  // エラーメッセージは string | string[] どちらでもOKに
  errors?: Record<string, string | string[] | undefined>;
  pending?: boolean;

  // 新規グループ作成ボタンを出すかどうか（編集では false 推奨）
  showNewGroupButton?: boolean;
  onOpenNewGroup?: () => void;
};

export default function EndpointGroupSelector({
  groups,
  groupId = "",
  setGroupId,
  errors = {},
  pending = false,
  showNewGroupButton = false,
  onOpenNewGroup,
}: Props) {
  const groupErr = errors.groupId;
  const errText = Array.isArray(groupErr) ? groupErr.join(", ") : groupErr;

  return (
    <section className="space-y-2">
      <Field id="group-select" label="Endpoint Group *" error={errText}>
        <div className="flex gap-2">
          <Select
            id="group-select"
            title="Endpoint Group"
            value={groupId ?? ""}
            onChange={(e) => setGroupId(e.target.value)}
            disabled={pending}
            className={errText ? "border-red-300" : undefined}
          >
            <option value="">Select a group...</option>
            {(groups ?? []).map((g: any) => (
              <option key={g.id} value={g.id}>
                {g.name ?? g.group_name ?? `Group ${g.id}`}
              </option>
            ))}
          </Select>

          {showNewGroupButton && (
            <Button
              type="button"
              variant="outline"
              onClick={onOpenNewGroup}
              disabled={pending}
            >
              + New Group
            </Button>
          )}
        </div>
      </Field>
    </section>
  );
}
