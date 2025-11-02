/** @jsxImportSource react */
import { Edit3 } from "lucide-react";
import { TemplateConfig, TemplateKey } from "../../types";
import { iconMap } from "../constants";

type Props = {
  templates: Record<TemplateKey, TemplateConfig>;
  selectedKey: TemplateKey | null;
  onPick: (key: TemplateKey, apply: (p: any) => any) => void;
  onEdit: (key: TemplateKey) => void;
};

export default function TemplatePicker({ templates, selectedKey, onPick, onEdit }: Props) {
  return (
    <div role="radiogroup" aria-label="Category Template" className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {(Object.keys(templates) as TemplateKey[]).map((key) => {
        const cfg = templates[key];
        const Icon = iconMap[cfg.iconKey];
        const selected = selectedKey === key;
        return (
          <div
            key={key}
            className={`relative overflow-hidden rounded-xl border-2 transition-all ${
              selected ? "border-blue-500" : "border-gray-200 hover:border-gray-300"
            }`}
            style={{ backgroundColor: cfg.bgColor }}
          >
            {cfg.bgImage && (
              <div aria-hidden className="pointer-events-none absolute inset-0 opacity-15"
                   style={{ backgroundImage: `url(${cfg.bgImage})`, backgroundSize: "cover", backgroundPosition: "center" }} />
            )}

            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onEdit(key); }}
              className="absolute right-3 top-3 z-10 inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white/80 px-2 py-1 text-xs text-gray-700 backdrop-blur hover:bg-white"
            >
              <Edit3 className="h-3.5 w-3.5" /> Edit
            </button>

            <label
              htmlFor={`tpl-${key}`}
              className="relative block cursor-pointer p-6"
              onClick={() => onPick(key, cfg.apply)}
            >
              <input id={`tpl-${key}`} type="radio" name="template" className="sr-only" readOnly checked={selected} />
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-white/60">
                <Icon className="h-6 w-6 text-gray-700" />
              </div>
              <div className="font-semibold text-gray-900">{cfg.label}</div>
              <div className="text-sm text-gray-700">{cfg.description}</div>
            </label>
          </div>
        );
      })}
    </div>
  );
}
