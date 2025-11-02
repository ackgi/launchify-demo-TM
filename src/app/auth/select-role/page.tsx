// src/app/auth/select-role/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/app/components/ui/Button";
import { Card, CardHeader, CardContent } from "@/app/components/ui/Card";

export default function SelectRolePage() {
  const { user } = useUser();
  const router = useRouter();

  const saveRole = async (role: "buyer" | "creator") => {
    if (!user) return;

    await user.update({
      unsafeMetadata: {
        ...(user.unsafeMetadata as Record<string, unknown>),
        role,
      },
    } as any);

    // 任意：Supabaseのprofiles.roleにも反映したい場合
    try {
      await fetch("/api/sync-profile", { method: "POST" }); // sync側でroleも更新する実装に拡張可
    } catch {}

    router.replace(role === "creator" ? "/creator" : "/buyer");
  };

  return (
    <div className="min-h-[60vh] min-w-[30vh] flex items-center justify-center bg-white">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Choose your role</h1>
          <p className="text-gray-600">Select how you want to use the app</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button className="w-full" variant="primary" onClick={() => saveRole("buyer")}>
            As a Buyer
          </Button>
          <Button className="w-full" variant="outline" onClick={() => saveRole("creator")}>
            As a Creator
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
