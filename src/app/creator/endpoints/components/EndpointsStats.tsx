"use client";
import { Code, Star, Activity, CreditCard as Edit } from "lucide-react";
import { Card, CardContent } from "@/app/components/ui/Card";
import type { EndpointRow } from "../types";

export default function EndpointsStats({ endpoints }: { endpoints: EndpointRow[] }) {
  const stats = [
    { icon: Code, color: "blue", label: "Total Endpoints", value: endpoints.length },
    { icon: Star, color: "green", label: "Primary Endpoints", value: endpoints.filter(e => !!e.is_primary).length },
    { icon: Activity, color: "purple", label: "Public Endpoints", value: endpoints.filter(e => e.status === "public").length },
    { icon: Edit, color: "yellow", label: "Draft Endpoints", value: endpoints.filter(e => e.status === "draft").length },
  ] as const;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {stats.map(({ icon: Icon, color, label, value }) => (
        <Card key={label}><CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 bg-${color}-100 rounded-lg flex items-center justify-center`}>
              <Icon className={`w-5 h-5 text-${color}-600`} />
            </div>
            <div>
              <p className="text-sm text-gray-600">{label}</p>
              <p className="text-2xl font-bold">{value}</p>
            </div>
          </div>
        </CardContent></Card>
      ))}
    </div>
  );
}
