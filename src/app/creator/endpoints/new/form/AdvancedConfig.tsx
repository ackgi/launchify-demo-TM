// src/app/creator/endpoints/new/_form/AdvancedConfig.tsx
"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import type { Visibility } from "../types";

export default function AdvancedConfig({
  open,
  setOpen,
  inputSchema, setInputSchema,
  outputSchema, setOutputSchema,
  visibility, setVisibility,
  errors,
  disabled
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  inputSchema: string;
  setInputSchema: (v: string) => void;
  outputSchema: string;
  setOutputSchema: (v: string) => void;
  visibility: Visibility;
  setVisibility: (v: Visibility) => void;
  errors: Record<string, string[]>;
  disabled?: boolean;
}) {
  const visibilitySelectId = "visibility-select";
  return (
    <div className="border-t pt-6">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 mb-4"
        aria-controls="advanced-config"
        data-state={open ? "open" : "closed"}
      >
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        Advanced Configuration
      </button>

      {open && (
        <div id="advanced-config" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Input Schema (JSON)
              </label>
              <textarea
                rows={4}
                value={inputSchema}
                onChange={(e) => setInputSchema(e.target.value)}
                placeholder='{"input": "string", "parameters": {}}'
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm ${
                  errors.inputSchema ? "border-red-300" : "border-gray-300"
                }`}
                disabled={disabled}
              />
              {errors.inputSchema && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.inputSchema.join(", ")}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Output Schema (JSON)
              </label>
              <textarea
                rows={4}
                value={outputSchema}
                onChange={(e) => setOutputSchema(e.target.value)}
                placeholder='{"result": "string", "metadata": {}}'
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm ${
                  errors.outputSchema ? "border-red-300" : "border-gray-300"
                }`}
                disabled={disabled}
              />
              {errors.outputSchema && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.outputSchema.join(", ")}
                </p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor={visibilitySelectId} className="block text-sm font-medium text-gray-700 mb-2">
              Visibility
            </label>
            <select
              id={visibilitySelectId}
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as Visibility)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={disabled}
            >
              <option value="catalog">Catalog (Public listing)</option>
              <option value="unlisted">Unlisted (Direct link only)</option>
              <option value="invited">Invited (Invitation required)</option>
              <option value="internal">Internal (Team only)</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
