//src\app\creator\plans\components\PlanForm\components\TemplateEditModal.tsx
// src/app/creator/plans/components/PlanForm/components/TemplateEditModal.tsx
/** @jsxImportSource react */
import { useState, useCallback, useEffect } from "react";
import { X, Palette, Image as ImageIcon, Edit3 } from "lucide-react";
import { TemplateConfig, TemplateKey, IconKey } from "../../types";
import { iconMap } from "../constants";

type Props = {
  open: boolean;
  onClose: () => void;
  templateKey: TemplateKey;
  value: TemplateConfig;
  onChange: (updated: Omit<TemplateConfig, "apply">) => void;
};

export default function TemplateEditModal({
  open,
  onClose,
  templateKey,
  value,
  onChange,
}: Props) {
  const [label, setLabel] = useState(value.label);
  const [description, setDescription] = useState(value.description);
  const [iconKey, setIconKey] = useState<IconKey>(value.iconKey);
  const [bgColor, setBgColor] = useState(value.bgColor);
  const [bgImage, setBgImage] = useState<string | null | undefined>(
    value.bgImage ?? null
  );

  useEffect(() => {
    setLabel(value.label);
    setDescription(value.description);
    setIconKey(value.iconKey);
    setBgColor(value.bgColor);
    setBgImage(value.bgImage ?? null);
  }, [value]);

  const onPickImage = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = () => setBgImage(reader.result as string);
    reader.readAsDataURL(file);
  }, []);

  if (!open) return null;

  // 一意のID群（labelと紐付け）
  const titleId = `tpl-${templateKey}-title`;
  const descId = `tpl-${templateKey}-desc`;
  const colorId = `tpl-${templateKey}-bgcolor`;
  const colorTextId = `tpl-${templateKey}-bgcolor-text`;
  const imageId = `tpl-${templateKey}-bgimage`;
  const imagePreviewId = `tpl-${templateKey}-bgimage-preview`;
  const iconGroupId = `tpl-${templateKey}-icongroup`;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Edit template: {templateKey}</h3>
          <button
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <label
              htmlFor={titleId}
              className="mb-1 block text-sm font-medium"
            >
              Title
            </label>
            <input
              id={titleId}
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              placeholder="Free / Pro / Enterprise..."
            />
          </div>

          <div>
            <label
              htmlFor={descId}
              className="mb-1 block text-sm font-medium"
            >
              Description
            </label>
            <textarea
              id={descId}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              placeholder="Short description for this template"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor={colorId}
                className="mb-1 block text-sm font-medium flex items-center gap-2"
                id={`${colorId}-label`}
              >
                <Palette className="h-4 w-4" /> Background color
              </label>
              <div className="flex items-center gap-3">
                <input
                  id={colorId}
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="h-9 w-14 cursor-pointer rounded border border-gray-300"
                  aria-label="Pick background color"
                />
                <input
                  id={colorTextId}
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2"
                  // 同じラベル文言で名前付け（テキスト側はaria-labelledbyで紐付け）
                  aria-labelledby={`${colorId}-label`}
                  placeholder="#f5f5f5"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor={imageId}
                className="mb-1 block text-sm font-medium flex items-center gap-2"
              >
                <ImageIcon className="h-4 w-4" /> Background image (optional)
              </label>
              <div className="flex items-center gap-3">
                <input
                  id={imageId}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onPickImage(f);
                  }}
                  aria-label="Choose background image file"
                  aria-describedby={bgImage ? imagePreviewId : undefined}
                />
                {bgImage && (
                  <button
                    type="button"
                    className="text-sm text-gray-600 underline"
                    onClick={() => setBgImage(null)}
                  >
                    Remove
                  </button>
                )}
              </div>
              {bgImage && (
                <div
                  id={imagePreviewId}
                  className="mt-2 h-20 w-full overflow-hidden rounded-lg border"
                  style={{
                    backgroundImage: `url(${bgImage})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                  role="img"
                  aria-label="Background image preview"
                />
              )}
            </div>
          </div>

          <div>
            <label
              id={`${iconGroupId}-label`}
              className="mb-2 block text-sm font-medium"
            >
              Icon
            </label>
            <div
              role="radiogroup"
              aria-labelledby={`${iconGroupId}-label`}
              className="flex items-center gap-3"
            >
              {(["zap", "credit-card", "shield"] as IconKey[]).map((k) => {
                const Icon = iconMap[k];
                const selected = iconKey === k;
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setIconKey(k)}
                    className={`flex h-10 w-10 items-center justify-center rounded-lg border transition ${
                      selected
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                    aria-pressed={selected}
                    aria-label={k}
                  >
                    <Icon className="h-5 w-5" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onChange({ label, description, iconKey, bgColor, bgImage });
              onClose();
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
          >
            <Edit3 className="h-4 w-4" /> Save
          </button>
        </div>
      </div>
    </div>
  );
}
