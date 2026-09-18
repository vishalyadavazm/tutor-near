import React, { forwardRef } from "react";
import clsx from "clsx";

type Variant = "primary" | "outline" | "ghost";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
  loadingText?: string;
}

const variantCls: Record<Variant, string> = {
  primary:
    "bg-brand-red text-white shadow-sm hover:opacity-90 disabled:opacity-60",
  outline:
    "border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-60",
  ghost: "text-gray-500 hover:text-gray-700 disabled:opacity-60",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      loading = false,
      loadingText,
      disabled,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={clsx(
          "w-full py-3 text-sm font-semibold rounded-xl transition-all duration-200",
          "disabled:cursor-not-allowed flex items-center justify-center gap-2",
          variantCls[variant],
          className,
        )}
        {...props}
      >
        {loading ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            {loadingText ?? children}
          </>
        ) : (
          children
        )}
      </button>
    );
  },
);

Button.displayName = "Button";
export default Button;
