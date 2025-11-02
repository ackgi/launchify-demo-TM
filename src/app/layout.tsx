// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import AppShell from "@/app/components/AppShell"; // ← ここを必ずこのパスに

export const metadata: Metadata = {
  title: "Launchify",
  description: "The secure marketplace for API services.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="ja">
        <body className="min-h-screen bg-gray-50">
          <AppShell>{children}</AppShell>
        </body>
      </html>
    </ClerkProvider>
  );
}
