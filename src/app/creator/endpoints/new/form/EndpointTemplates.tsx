// src/app/creator/endpoints/new/_form/EndpointTemplates.tsx
"use client";

import Badge from "@/app/components/ui/Badge";

type Template = {
  name: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";
  path: string;
  description: string;
  inputSchema: string;
  outputSchema: string;
};

export default function EndpointTemplates({
  disabled,
  onSelect,
}: {
  disabled?: boolean;
  onSelect: (tpl: Template) => void;
}) {
  const templates: Template[] = [
    {
      name: "Health Check",
      method: "GET",
      path: "/health",
      description: "Basic health check endpoint",
      inputSchema: "",
      outputSchema: '{"status": "ok", "timestamp": "2025-01-11T10:00:00Z"}',
    },
    {
      name: "Predict",
      method: "POST",
      path: "/predict",
      description: "Machine learning prediction endpoint",
      inputSchema: '{"input": "string", "parameters": {}}',
      outputSchema: '{"prediction": "string", "confidence": 0.95}',
    },
    {
      name: "Generate",
      method: "POST",
      path: "/generate",
      description: "Content generation endpoint",
      inputSchema: '{"prompt": "string", "options": {}}',
      outputSchema: '{"generated": "string", "metadata": {}}',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {templates.map((template, i) => (
        <button
          key={i}
          disabled={disabled}
          onClick={() => onSelect(template)}
          className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors"
        >
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="neutral" size="sm">{template.method}</Badge>
            <span className="font-medium text-gray-900">{template.name}</span>
          </div>
          <code className="text-sm text-gray-600 block mb-2">{template.path}</code>
          <p className="text-xs text-gray-500">{template.description}</p>
        </button>
      ))}
    </div>
  );
}
