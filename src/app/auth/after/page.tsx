// src/app/auth/after/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

export default function AfterAuth() {
  const { isSignedIn, user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isSignedIn) return;

    const syncProfile = async () => {
      try {
        await fetch("/api/sync-profile", { method: "POST" });
      } catch (e) {
        console.error("sync-profile failed", e);
      }
    };

    syncProfile();

    const role = (user?.publicMetadata as any)?.role as
      | "buyer"
      | "creator"
      | undefined;

    if (role === "creator") router.replace("/creator");
    else if (role === "buyer") router.replace("/buyer");
    else router.replace("/auth/select-role");
  }, [isSignedIn, user, router]);

  return null;
}
