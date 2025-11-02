// src/app/success/page.tsx
"use client";

import { CheckCircle, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation"; // ✅ react-router-dom の代わり
import { Button } from "@/app/components/ui/Button";
import { Card, CardContent } from "@/app/components/ui/Card";

export default function SuccessPage() {
  const router = useRouter();

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Card className="w-full max-w-md text-center">
        <CardContent className="py-12">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Purchase Complete!
          </h1>

          <p className="text-gray-600 mb-8">
            Your API subscription has been activated successfully. You can now
            generate API keys and start making requests.
          </p>

          <div className="space-y-3">
            <Button
              className="w-full"
              onClick={() => router.push("/account/api-keys")}
            >
              Generate API Keys
              <ArrowRight size={16} className="ml-2" />
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push("/buyer")}
            >
              Browse More APIs
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
