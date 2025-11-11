// src/app/creator/endpoints/new/form/EndpointGroupSelector.tsx
"use client";

import { Field, Select } from "@/app/creator/endpoints/new/form/Field";

type Group = { id: string; group_name?: string; name?: string };

type Props = {
  groups: Group[];
  groupId?: string;
  setGroupId: (v: string) => void;
  errors?: Record<string, string | string[] | undefined>;
  pending?: boolean;

  /** 右側の +New Group ボタンは使わない（編集寄せ） */
  showNewGroupButton?: false;
  onOpenNewGroup?: never;
};

export default function EndpointGroupSelector({
  groups,
  groupId = "",
  setGroupId,
  errors = {},
  pending = false,
}: Props) {
  const groupErr = errors.groupId;
  const errText = Array.isArray(groupErr) ? groupErr.join(", ") : groupErr;

  return (
    <section className="space-y-2">
      <Field id="group-select" label="Endpoint Group *" error={errText}>
        <div className="flex items-center gap-2">
          <Select
            id="group-select"
            title="Endpoint Group"
            value={groupId ?? ""}
            onChange={(e) => setGroupId(e.target.value)}
            disabled={pending}
            className={[
              // 編集画面に寄せて“コンパクト化”
              "h-9 text-sm w-full rounded-md border px-3",
              errText ? "border-red-300" : "border-input",
            ].join(" ")}
          >
            {/* プレースホルダは選択不可 & 非表示にして見た目スッキリ */}
            <option value="" disabled hidden>
              Select a group...
            </option>

            {(groups ?? []).map((g) => (
              <option key={g.id} value={g.id}>
                {g.group_name ?? g.name ?? `Group ${g.id}`}
              </option>
            ))}
          </Select>
          {/* 編集寄せのため「+ New Group」ボタンは出さない */}
        </div>
      </Field>
    </section>
  );
}
