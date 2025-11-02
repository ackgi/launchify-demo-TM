// src/app/creator/endpoints/new/form/Field.tsx
"use client";
import React from "react";

// =======================
// 型定義
// =======================
type BaseProps = {
  label: string;
  id: string;
  error?: string[] | string;
  children?: React.ReactNode;
  className?: string;
};

// =======================
// Field コンポーネント
// =======================
export function Field({ label, id, error, children, className }: BaseProps) {
  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-800 mb-1"
      >
        {label}
      </label>
      <div className="text-base">{children}</div>
      {error && (
        <p className="mt-1 text-sm text-red-600">
          {Array.isArray(error) ? error.join(", ") : error}
        </p>
      )}
    </div>
  );
}

// =======================
// TextInput
// =======================
export function TextInput({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
        className ?? "border-gray-300"
      }`}
    />
  );
}

// =======================
// Select
// =======================
export function Select({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
        className ?? "border-gray-300"
      }`}
    >
      {children}
    </select>
  );
}

// =======================
// Textarea
// =======================
export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
        className ?? "border-gray-300"
      }`}
    />
  );
}
