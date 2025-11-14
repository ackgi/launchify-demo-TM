// src/app/creator/plans/components/sections/SummarySection.tsx
"use client";

import { CheckCircle } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/app/components/ui/Card";

import { PlanFormData, TemplateKey, TemplateConfig } from "../types";

type Props = {
  formData: PlanFormData;

  // templateKey → label のために必要
  templates: Record<TemplateKey, TemplateConfig>;
};

export function SummarySection({ formData, templates }: Props) {
  if (formData.linkedGroups.length === 0) return null;

  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <h4 className="font-semibold text-green-900">Plan Summary</h4>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
          {/* Plan name */}
          <div>
            <span className="font-medium text-green-700">Plan:</span>
            <p className="text-green-900">
              {formData.name}
              {formData.templateKey
                ? ` (${templates[formData.templateKey].label})`
                : ""}
            </p>
          </div>

          {/* Billing type */}
          <div>
            <span className="font-medium text-green-700">Billing:</span>
            <p className="capitalize text-green-900">{formData.billingType}</p>
          </div>

          {/* Group count */}
          <div>
            <span className="font-medium text-green-700">Groups:</span>
            <p className="text-green-900">
              {formData.linkedGroups.length} linked
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
