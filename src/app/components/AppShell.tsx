//src\app\components\AppShell.tsx
"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Home, Plus, LogOut, User } from "lucide-react";
import { SignedIn, SignedOut, useUser, useClerk } from "@clerk/nextjs";
import { Button } from "@/app/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/DropdownMenu";
import { Avatar, AvatarImage, AvatarFallback } from "@/app/components/ui/Avatar";

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const { user } = useUser();
  const { signOut } = useClerk();

  // 📍 ページ種別の識別
  const isCreatorPage = pathname.startsWith("/creator");
  const isLandingPage = pathname === "/";

  // Clerk の unsafeMetadata をロール保存に使用
  const role = ((user?.unsafeMetadata?.role as "buyer" | "creator" | undefined) ?? "buyer");
  const isBuyer = role === "buyer";

  const handleRoleSwitch = async () => {
    if (!user) return;
    const next = isBuyer ? "creator" : "buyer";
    await user.update({
      unsafeMetadata: { ...(user.unsafeMetadata ?? {}), role: next },
    });
    router.push(next === "creator" ? "/creator" : "/buyer");
  };

  // 🎨 カスタムユーザーメニュー
  const CustomUserMenu = () => {
    if (!user) return null;

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar className="cursor-pointer ring-2 ring-blue-500">
            <AvatarImage src={user.imageUrl || ""} alt="avatar" />
            <AvatarFallback>{user.firstName?.[0] || "U"}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-white border rounded-xl shadow-lg p-2">
          <div className="px-3 py-2 border-b">
            <p className="text-sm font-medium text-gray-900">{user.fullName || "Anonymous User"}</p>
            <p className="text-xs text-gray-500 truncate">{user.primaryEmailAddress?.emailAddress}</p>
          </div>

          <DropdownMenuItem className="flex items-center gap-2 text-gray-700 hover:bg-gray-50">
            <User size={16} />
            Manage account
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => signOut(() => router.push("/auth"))}
            className="flex items-center gap-2 text-red-600 hover:bg-red-50"
          >
            <LogOut size={16} />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  // 🔗 Creatorメニュー（順序固定：Products → Plans → Groups → Endpoints）
  const creatorNav = [
    { label: "Products", href: "/creator/products" },
    { label: "Plans", href: "/creator/plans" },
    { label: "Groups", href: "/creator/groups" },
    { label: "Endpoints", href: "/creator/endpoints" },
  ] as const;

  // 共通のアクティブ判定：完全一致 or サブパス一致で true
  const isActive = (baseHref: string) =>
    pathname === baseHref || pathname.startsWith(`${baseHref}/`);

  // 共通のリンククラス
  const linkCls = (active: boolean) =>
    [
      "text-sm font-medium transition-colors rounded-md px-3 py-2",
      active ? "text-blue-600 underline underline-offset-4" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
    ].join(" ");

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-screen-xl mx-auto px-3 lg:px-10">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
            {/* ロゴ */}
            <Link href="/" className="flex items-center">
              <Image
                src="/Launchify_icon2.png"
                alt="Launchify logo"
                width={140}  // ←画像の幅を調整。必要に応じて80〜160くらいで調整可
                height={40}
                className="object-contain"
                priority
              />
            </Link>

              {/* ナビゲーション */}
              <SignedIn>
                <nav className="hidden md:flex items-center gap-1">
                  {isBuyer ? (
                    <>
                      <Link
                        href="/buyer"
                        className={linkCls(pathname.startsWith("/buyer"))}
                      >
                        API Marketplace
                      </Link>
                      <Link
                        href="/account/api-keys"
                        className={linkCls(pathname.startsWith("/account"))}
                      >
                        My Contracts
                      </Link>
                    </>
                  ) : (
                    <>
                      {/* Buyer（カタログ）・Creator（ダッシュボード）入口 */}
                      <Link
                        href="/buyer"
                        className={linkCls(pathname.startsWith("/buyer"))}
                      >
                        My Catalog
                      </Link>
                      <Link
                        href="/creator"
                        className={linkCls(pathname === "/creator")}
                      >
                        Dashboard
                      </Link>

                      {/* 🔽 ここが今回の主修正（順序・リンク） */}
                      {creatorNav.map((item) => (
                        <Link key={item.href} href={item.href} className={linkCls(isActive(item.href))}>
                          {item.label}
                        </Link>
                      ))}

                      {/* CTA: New Product */}
                      <Link
                        href="/creator/endpoints/new"
                        className="ml-2 flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 px-3 py-2"
                      >
                        <Plus size={16} />
                        New Endpoint
                      </Link>
                    </>
                  )}
                </nav>
              </SignedIn>

              {/* 未ログイン時 */}
              <SignedOut>
                <nav className="hidden md:flex gap-6">
                  <Link
                    href="/buyer"
                    className={linkCls(pathname.startsWith("/buyer"))}
                  >
                    Browse APIs
                  </Link>
                </nav>
              </SignedOut>
            </div>

            {/* 右側：ユーザーセクション */}
            <div className="flex items-center gap-4">
              <SignedIn>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700 hidden sm:inline">
                    {user?.fullName || user?.username || user?.primaryEmailAddress?.emailAddress}
                  </span>
                  <Button variant="outline" size="sm" onClick={handleRoleSwitch}>
                    Switch to {isBuyer ? "Creator" : "Buyer"}
                  </Button>
                  <CustomUserMenu />
                </div>
              </SignedIn>

              <SignedOut>
                <Button onClick={() => router.push("/auth")}>Get Started</Button>
              </SignedOut>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main
        className={`flex-1 ${
          isCreatorPage
            ? "w-full px-6 lg:px-10 py-8"
            : isLandingPage
            ? "w-full p-0 m-0"
            : "max-w-screen-xl mx-auto px-6 lg:px-10 py-8"
        }`}
      >
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-10 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left justify-items-center md:justify-items-start">
            <div>
            <div className="flex flex-col items-center md:items-start gap-2 mb-4">
              {/* ロゴ部分を画像に差し替え */}
              <Link href="/" className="flex items-center">
                <Image
                  src="/Launchify_icon2.png"
                  alt="Launchify logo"
                  width={140} // 必要に応じて 100〜160px で調整可
                  height={40}
                  className="object-contain"
                  priority
                />
              </Link>
            </div>

            <p className="text-gray-600 max-w-xs mx-auto md:mx-0">
              The secure marketplace for API services. Build, sell, and discover powerful APIs.
            </p>

            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
                Resources
              </h3>
                <ul className="space-y-2">
                  <li><Link href="/docs" prefetch={false} className="text-gray-600 hover:text-gray-900">Documentation</Link></li>
                  <li><Link href="/support" prefetch={false} className="text-gray-600 hover:text-gray-900">Support</Link></li>
                  <li><Link href="/status" prefetch={false} className="text-gray-600 hover:text-gray-900">Status</Link></li>
                </ul>

            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
                Account
              </h3>
                <ul className="space-y-2">
                  <li><Link href="/creator" className="text-gray-600 hover:text-gray-900">Creator Dashboard</Link></li>
                  <li><Link href="/buyer" className="text-gray-600 hover:text-gray-900">Browse APIs</Link></li>
                  <li><Link href="/pricing" prefetch={false} className="text-gray-600 hover:text-gray-900">Pricing</Link></li>
                </ul>

            </div>
          </div>

          <div className="border-t border-gray-200 pt-8 mt-8 text-center text-gray-600">
            <p>&copy; 2025 Launchify. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
