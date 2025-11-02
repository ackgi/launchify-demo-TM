"use client";

import React, {
  ReactNode,
  HTMLAttributes,
  ButtonHTMLAttributes,
  MouseEventHandler,
  ReactElement,
} from "react";

type DivProps = HTMLAttributes<HTMLDivElement>;
type BtnProps = ButtonHTMLAttributes<HTMLButtonElement>;

interface BaseProps {
  children: ReactNode;
  hover?: boolean;
  className?: string;
}

type ClickableProps = BaseProps &
  Omit<BtnProps, "className" | "children" | "type"> & {
    onClick: NonNullable<MouseEventHandler<HTMLButtonElement>>;
  };

type NonClickableProps = BaseProps &
  Omit<
    DivProps,
    "className" | "children" | "role" | "tabIndex" | "onClick" | "onKeyDown"
  > & {
    onClick?: never;
  };

// オーバーロード
export function Card(props: ClickableProps): ReactElement;
export function Card(props: NonClickableProps): ReactElement;

export function Card(props: ClickableProps | NonClickableProps): ReactElement {
  // ✅ 修正ポイント：w-fullを追加
  const base =
    "w-full bg-white rounded-2xl shadow-sm border border-gray-100 transition-all duration-200";
  const hoverCls = props.hover ? "hover:shadow-lg hover:-translate-y-1" : "";
  const classes = `${base} ${hoverCls} ${props.className ?? ""}`;

  const isClickable = (p: any): p is ClickableProps =>
    typeof p.onClick === "function";

  if (isClickable(props)) {
    const { children, onClick, hover, className, ...rest } = props;
    return (
      <button
        type="button"
        onClick={onClick}
        {...rest}
        className={`${classes} cursor-pointer`}
      >
        {children}
      </button>
    );
  }

  const { children, hover, className, ...rest } = props as NonClickableProps;
  return (
    <div {...rest} className={classes}>
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div
      className={`px-6 py-4 border-b border-gray-100 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardContent({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  // ✅ 修正ポイント：内部も確実に全幅にする
  return (
    <div className={`w-full px-6 py-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div
      className={`px-6 py-4 border-t border-gray-100 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
