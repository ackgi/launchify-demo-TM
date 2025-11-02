/** @jsxImportSource react */
import { Card, CardContent, CardHeader } from "@/app/components/ui/Card";
import { CheckCircle } from "lucide-react";
import { PlanFormData, TemplateKey, TemplateConfig } from "../../types";

type Props = {
  data: PlanFormData;
  templates: Record<TemplateKey, TemplateConfig>;
};

export default function SummaryCard({ data, templates }: Props) {
  if (data.linkedGroups.length === 0) return null;
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
          <div>
            <span className="font-medium text-green-700">Plan:</span>
            <p className="text-green-900">
              {data.name}
              {data.templateKey ? ` (${templates[data.templateKey].label})` : ""}
            </p>
          </div>
          <div>
            <span className="font-medium text-green-700">Billing:</span>
            <p className="capitalize text-green-900">{data.billingType}</p>
          </div>
          <div>
            <span className="font-medium text-green-700">Groups:</span>
            <p className="text-green-900">{data.linkedGroups.length} linked</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
