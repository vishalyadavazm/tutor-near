import React, { forwardRef } from "react";
import clsx from "clsx";
import FieldError from "./FieldError";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={props.id} className="text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            className={clsx(
              "w-full py-2.5 pr-4 text-sm text-gray-900 border rounded-lg outline-none transition-all duration-150",
              "placeholder:text-gray-400 bg-white focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red",
              icon ? "pl-10" : "pl-4",
              error
                ? "border-red-400 bg-red-50 focus:ring-red-500/20 focus:border-red-400"
                : "border-gray-200 hover:border-gray-300",
              className,
            )}
            {...props}
          />
        </div>
        <FieldError message={error} />
      </div>
    );
  },
);

Input.displayName = "Input";
export default Input;
