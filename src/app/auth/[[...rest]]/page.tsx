//src\app\auth\[[...rest]]\page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser, useSignIn, useSignUp, useClerk } from "@clerk/nextjs";
import { User, Mail, Lock } from "lucide-react";
import { Button } from "@/app/components/ui/Button";
import { Card, CardHeader, CardContent } from "@/app/components/ui/Card";

export default function AuthPage() {
  const router = useRouter();
  const params = useSearchParams();

  const { isSignedIn } = useUser();
  const { signIn, isLoaded: signInLoaded } = useSignIn();
  const { signUp, isLoaded: signUpLoaded } = useSignUp();
  const { setActive } = useClerk();

  // --- モード（同一画面で切替） ---
  const mode: "sign-in" | "sign-up" = useMemo(() => {
    const q = (params.get("mode") || "").toLowerCase();
    return q === "sign-up" ? "sign-up" : "sign-in";
  }, [params]);

  const go = (m: "sign-in" | "sign-up") => router.push(`/auth?mode=${m}`);

  // --- フォーム状態（デザインは既存のまま） ---
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [code, setCode] = useState("");
  const [verifyStep, setVerifyStep] = useState<"idle" | "verify">("idle");

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // 既にサインイン済みなら遷移
  useEffect(() => {
    if (isSignedIn) router.replace("/auth/after");
  }, [isSignedIn, router]);

  // ----------------------
  // Sign in
  // ----------------------
  const handleEmailSignIn = async () => {
    try {
      if (!signInLoaded) return;
      setBusy(true);
      setErr(null);
      const res = await signIn.create({ identifier: email, password });
      if (res.status === "complete") {
        await setActive({ session: res.createdSessionId });
        router.replace("/auth/after");
      }
    } catch (e: any) {
      setErr(e?.errors?.[0]?.message || e?.message || "Sign-in error");
    } finally {
      setBusy(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!signInLoaded) return;
    await signIn.authenticateWithRedirect({
      strategy: "oauth_google",
      redirectUrl: "/auth/sso-callback",
      redirectUrlComplete: "/auth/after",
    });
  };

  // ----------------------
  // Sign up
  // ----------------------
  const handleEmailSignUp = async () => {
    try {
      if (!signUpLoaded) return;
      setBusy(true);
      setErr(null);

      if (password !== confirm) {
        setErr("Passwords do not match.");
        return;
      }

      // ① アカウント作成
      await signUp.create({ emailAddress: email, password });

      // ② 確認コード送信
      await signUp.prepareEmailAddressVerification();

      // ③ 同じカード内でコード入力ステップへ
      setVerifyStep("verify");
    } catch (e: any) {
      setErr(e?.errors?.[0]?.message || e?.message || "Sign-up error");
    } finally {
      setBusy(false);
    }
  };

  const handleVerifySignUp = async () => {
    try {
      if (!signUpLoaded) return;
      setBusy(true);
      setErr(null);

      const res = await signUp.attemptEmailAddressVerification({ code });
      if (res.status === "complete") {
        await setActive({ session: res.createdSessionId });
        router.replace("/auth/after");
      }
    } catch (e: any) {
      setErr(e?.errors?.[0]?.message || e?.message || "Verification error");
    } finally {
      setBusy(false);
    }
  };

  const handleGoogleSignUp = async () => {
    if (!signUpLoaded) return;
    await signUp.authenticateWithRedirect({
      strategy: "oauth_google",
      redirectUrl: "/auth/sso-callback",
      redirectUrlComplete: "/auth/after",
    });
  };

  // --- 既存デザインと同じスタイル ---
  const inputCls =
    "w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent";

  return (
    <div className="min-h-[70vh] min-w-[60vh] flex items-center justify-center bg-white px-4">
    <div className="w-full max-w-xl">
      <Card className="mx-auto w-[480px] max-w-[92vw] shadow-xl">
        {/* Header（既存デザインを変更しない） */}
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          {mode === "sign-in" ? (
            <>
              <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
              <p className="text-gray-600">Sign in to your account</p>
            </>
          ) : verifyStep === "idle" ? (
            <>
              <h1 className="text-2xl font-bold text-gray-900">Create account</h1>
              <p className="text-gray-600">Sign up to get started</p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-900">Check your email</h1>
              <p className="text-gray-600">Enter the verification code</p>
            </>
          )}
        </CardHeader>

        {/* Content（見た目は踏襲） */}
        <CardContent className="space-y-6">
          {mode === "sign-in" ? (
            <>
              {/* Inputs */}
              <div className="space-y-4">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className={inputCls}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className={inputCls}
                    />
                  </div>
                </div>
              </div>

              {/* Error */}
              {err && (
                <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">
                  {err}
                </p>
              )}

              {/* Buttons */}
              <div className="space-y-3">
                <Button
                  className="w-full py-3 text-base font-medium"
                  variant="primary"
                  disabled={busy}
                  onClick={handleEmailSignIn}
                >
                  {busy ? "Signing in..." : "Sign in"}
                </Button>

                <div className="text-center text-xs text-gray-500">or</div>

                <Button
                  variant="outline"
                  className="w-full py-3 text-base font-medium"
                  onClick={handleGoogleSignIn}
                >
                  Continue with Google
                </Button>
              </div>

              {/* Sign-up link（画面内切替） */}
              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => go("sign-up")}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Need an account? Sign up
                </button>
              </div>
            </>
          ) : verifyStep === "idle" ? (
            <>
              {/* Sign up フォーム（見た目はSign inと同じ） */}
              <div className="space-y-4">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className={inputCls}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className={inputCls}
                    />
                  </div>
                </div>

                {/* Confirm Password（追加入力のみ） */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="Re-enter your password"
                      className={inputCls}
                    />
                  </div>
                </div>
              </div>

              {/* Error */}
              {err && (
                <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">
                  {err}
                </p>
              )}

              {/* Buttons */}
              <div className="space-y-3">
                <Button
                  className="w-full py-3 text-base font-medium"
                  variant="primary"
                  disabled={busy}
                  onClick={handleEmailSignUp}
                >
                  {busy ? "Creating account..." : "Create account"}
                </Button>

                <div className="text-center text-xs text-gray-500">or</div>

                <Button
                  variant="outline"
                  className="w-full py-3 text-base font-medium"
                  onClick={handleGoogleSignUp}
                >
                  Continue with Google
                </Button>
              </div>

              {/* Back to sign-in */}
              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => go("sign-in")}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Already have an account? Sign in
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Verify code（同じカードUI内） */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Verification code
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="Enter the code emailed to you"
                      className="w-full pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {err && (
                <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">
                  {err}
                </p>
              )}

              <div className="space-y-3">
                <Button
                  className="w-full py-3 text-base font-medium"
                  variant="primary"
                  disabled={busy}
                  onClick={handleVerifySignUp}
                >
                  {busy ? "Verifying..." : "Verify"}
                </Button>

                <div className="text-center text-xs text-gray-500">
                  Didn&apos;t get a code? Check your spam folder.
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
