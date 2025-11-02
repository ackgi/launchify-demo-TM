"use client";

import { ReactNode } from "react";

interface BadgeProps {
  variant?: "success" | "warning" | "error" | "neutral" | "info";
  size?: "sm" | "md";
  children: ReactNode;
  className?: string;
}

export default function Badge({
  variant = "neutral",
  size = "md",
  children,
  className = "",
}: BadgeProps) {
  const baseClasses =
    "inline-flex items-center font-medium rounded-full transition-colors";

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
  };

  const variantClasses = {
    success: "bg-green-100 text-green-800 border border-green-200",
    warning: "bg-yellow-100 text-yellow-800 border border-yellow-200",
    error: "bg-red-100 text-red-800 border border-red-200",
    neutral: "bg-gray-100 text-gray-700 border border-gray-200",
    info: "bg-blue-100 text-blue-800 border border-blue-200",
  };

  return (
    <span
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
