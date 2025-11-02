"use client";
import { useState } from "react";
import { Button } from "@/app/components/ui/Button";
import { Modal, ModalContent, ModalFooter } from "@/app/components/ui/Modal";
import { Activity, Play } from "lucide-react";
import type { TestResult } from "../types";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onRun: (id: string) => Promise<TestResult>;
  endpointId: string | null;
};

export default function TestModal({ isOpen, onClose, onRun, endpointId }: Props) {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const [headers, setHeaders] = useState('{"Content-Type":"application/json"}');
  const [body, setBody] = useState("{}");

  const headersId = "test-headers";
  const bodyId = "test-body";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Test Endpoint" size="lg">
      <ModalContent>
        <div className="space-y-4">
          <div>
            <label htmlFor={headersId} className="block text-sm font-medium mb-2">Headers (JSON)</label>
            <textarea id={headersId} rows={3} value={headers} onChange={(e) => setHeaders(e.target.value)} className="w-full px-3 py-2 border rounded-lg font-mono text-sm" />
          </div>
          <div>
            <label htmlFor={bodyId} className="block text-sm font-medium mb-2">Body (JSON)</label>
            <textarea id={bodyId} rows={6} value={body} onChange={(e) => setBody(e.target.value)} className="w-full px-3 py-2 border rounded-lg font-mono text-sm" />
          </div>
          {result && (
            <div className="border-t pt-4">
              <div className={`p-3 rounded border ${result.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                <div className="flex items-center justify-between">
                  <span className="font-medium">{result.success ? "Success" : "Failed"}</span>
                  <span className="font-mono">{result.status} • {result.latency}ms</span>
                </div>
              </div>
              <div className="mt-3 bg-gray-900 rounded p-3 overflow-x-auto">
                <pre className="text-green-400 text-sm font-mono">{result.response}</pre>
              </div>
            </div>
          )}
        </div>
      </ModalContent>
      <ModalFooter>
        <Button variant="outline" onClick={() => { setResult(null); onClose(); }}>Close</Button>
        <Button
          onClick={async () => {
            if (!endpointId) return;
            setTesting(true);
            const r = await onRun(endpointId);
            setResult(r);
            setTesting(false);
          }}
          disabled={testing || !endpointId}
        >
          {testing ? <><Activity size={16} className="mr-2 animate-spin" />Testing...</> : <><Play size={16} className="mr-2" />Run Test</>}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
