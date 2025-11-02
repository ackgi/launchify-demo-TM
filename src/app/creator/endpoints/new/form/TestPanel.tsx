// src/app/creator/endpoints/new/_form/TestPanel.tsx
"use client";

import { Play, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/app/components/ui/Button";
import type { TestResult } from "../types";

export default function TestPanel({
  fullUrl,
  onTest,
  pending,
  result,
}: {
  fullUrl: string | "";
  onTest: () => void;
  pending: boolean;
  result: TestResult;
}) {
  if (!fullUrl) return null;

  return (
    <div className="border-t pt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Test Request</h3>
        <Button variant="outline" onClick={onTest} disabled={pending} className="flex items-center gap-2">
          {pending ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
          {pending ? "Testing..." : "Test Endpoint"}
        </Button>
      </div>

      {result && (
        <div className={`p-4 rounded-lg border ${result.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
          <div className="flex items-center gap-2 mb-2">
            {result.success ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            <span className={`font-medium ${result.success ? "text-green-900" : "text-red-900"}`}>
              {result.success ? "Test Successful" : "Test Failed"}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Status:</span>
              <span className={`ml-2 font-mono ${result.status === 200 ? "text-green-600" : "text-red-600"}`}>{result.status}</span>
            </div>
            <div>
              <span className="text-gray-600">Latency:</span>
              <span className="ml-2 font-mono text-gray-900">{result.latency}ms</span>
            </div>
          </div>
          {result.response && (
            <div className="mt-3">
              <span className="text-gray-600 text-sm">Response:</span>
              <pre className="mt-1 p-2 bg-gray-100 rounded text-xs font-mono overflow-x-auto">{result.response}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
