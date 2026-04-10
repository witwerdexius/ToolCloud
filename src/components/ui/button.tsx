"use client";

import { forwardRef } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const cls = [
      "tc-btn",
      `tc-btn-${variant}`,
      `tc-btn-${size}`,
      className ?? "",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <button
        ref={ref}
        className={cls}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <span className="tc-spinner" aria-hidden />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export { Button };
