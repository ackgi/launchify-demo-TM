// src/app/page.tsx
"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Shield,
  Zap,
  Globe,
  Users,
  TrendingUp,
  Code,
} from "lucide-react";
import { Button } from "./components/ui/Button";
import { Card, CardContent } from "./components/ui/Card";

export default function LandingPage() {
  const router = useRouter();

  // ✅ router未定義・Hydration中に備えた安全ナビゲート
  const safeNavigate = useCallback(
    (path: string) => {
      if (typeof window === "undefined") return; // SSR中は無視
      if (!path || typeof path !== "string") return;
      try {
        router?.push?.(path);
      } catch (err) {
        console.warn("Navigation failed:", err);
      }
    },
    [router]
  );

  // ✅ Fallback対策：router.ready前のクリック無効化
  useEffect(() => {
    if (!router) {
      console.info("Router not initialized yet (safeNavigate active)");
    }
  }, [router]);

  return (
    <div className="w-full min-h-screen bg-white text-gray-900 overflow-x-hidden">
      {/* 🎯 全体幅を中央寄せで固定 */}
      <main className="w-full max-w-screen-xl mx-auto px-6 lg:px-12 space-y-32">
        {/* ===================== Hero Section ===================== */}
        <section className="text-center py-20" aria-labelledby="hero-heading">
          <div>
            <div
              className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-medium mb-8"
              aria-label="tagline"
            >
              <Zap size={16} aria-hidden="true" />
              The Future of API Commerce
            </div>

            <h1
              id="hero-heading"
              className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6 leading-tight"
            >
              Build, Sell &amp; Discover
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block">
                Powerful APIs
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              The secure marketplace where developers monetize their APIs and
              businesses discover the services they need to scale faster.
            </p>

            <div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              aria-label="primary actions"
            >
              <Button
                size="lg"
                onClick={() => safeNavigate("/auth")}
                className="group"
                aria-label="Get Started Today"
              >
                Get Started Today
                <ArrowRight
                  size={18}
                  className="ml-2 group-hover:translate-x-1 transition-transform"
                  aria-hidden="true"
                />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => safeNavigate("/buyer")}
                aria-label="Browse APIs"
              >
                Browse APIs
              </Button>
            </div>

            <ul
              className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500"
              role="list"
              aria-label="highlights"
            >
              {[
                { icon: Shield, text: "Enterprise Security", color: "text-green-500" },
                { icon: Globe, text: "Global Scale", color: "text-blue-500" },
                { icon: TrendingUp, text: "99.9% Uptime", color: "text-purple-500" },
              ].map(({ icon: Icon, text, color }, i) => (
                <li key={i} className="flex items-center gap-2" role="listitem">
                  <Icon size={16} className={color} aria-hidden="true" />
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ===================== Features Section ===================== */}
        <section aria-labelledby="features-heading">
          <div className="text-center mb-16">
            <h2 id="features-heading" className="text-3xl font-bold text-gray-900 mb-4">
              Everything you need to succeed
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Whether you're selling APIs or building with them, Launchify provides
              the tools and infrastructure to power your business.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Creator Platform",
                desc: "Publish your APIs with comprehensive documentation, flexible pricing plans, and detailed analytics. Monetize your work effortlessly.",
                gradient: "from-blue-500 to-blue-600",
                icon: Code,
              },
              {
                title: "Buyer Experience",
                desc: "Discover and integrate high-quality APIs with transparent pricing, reliable uptime monitoring, and secure API key management.",
                gradient: "from-green-500 to-green-600",
                icon: Users,
              },
              {
                title: "Secure & Scalable",
                desc: "Enterprise-grade security, automatic scaling, real-time monitoring, and comprehensive audit trails for peace of mind.",
                gradient: "from-purple-500 to-purple-600",
                icon: Shield,
              },
            ].map(({ title, desc, gradient, icon: Icon }, i) => (
              <Card
                key={i}
                className="text-center group hover:shadow-xl transition-all duration-300"
              >
                <CardContent className="pt-8">
                  <div
                    className={`w-16 h-16 bg-gradient-to-r ${gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform`}
                    aria-hidden="true"
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{title}</h3>
                  <p className="text-gray-600 leading-relaxed">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      {/* ===================== Stats Section ===================== */}
      <section
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20 mt-16"
        aria-labelledby="stats-heading"
      >
        <div className="max-w-screen-lg mx-auto text-center px-6 lg:px-12">
          <h2 id="stats-heading" className="text-3xl font-bold mb-12">
            Trusted by developers worldwide
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-12">
            {[
              { label: "APIs Published", value: "10,000+" },
              { label: "API Calls Daily", value: "50M+" },
              { label: "Uptime Guarantee", value: "99.9%" },
            ].map(({ label, value }, i) => (
              <div key={i}>
                <div className="text-4xl font-bold mb-2" aria-label={label}>
                  {value}
                </div>
                <div className="text-blue-100">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== CTA Section ===================== */}
      <section className="py-20 text-center bg-white" aria-labelledby="cta-heading">
        <div className="max-w-3xl mx-auto px-6">
          <h2 id="cta-heading" className="text-3xl font-bold text-gray-900 mb-6">
            Ready to transform your API business?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of developers who are already building the future of API
            commerce with Launchify.
          </p>
          <Button
            size="lg"
            onClick={() => safeNavigate("/auth")}
            className="group"
            aria-label="Start Your Journey"
          >
            Start Your Journey
            <ArrowRight
              size={18}
              className="ml-2 group-hover:translate-x-1 transition-transform"
              aria-hidden="true"
            />
          </Button>
        </div>
      </section>
    </div>
  );
}
