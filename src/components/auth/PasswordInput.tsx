"use client";

/**
 * Updated: focus ring color matches the brand red (#C0392B) instead of blue.
 * Strength meter colors (red/orange/yellow/green) are intentionally left alone —
 * that's a semantic weak→strong gradient, not a brand surface.
 */

import React, { useState, forwardRef } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible, AiOutlineLock } from "react-icons/ai";

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  showStrength?: boolean;
}

function getStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: "", color: "" };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
    { score: 1, label: "Weak", color: "bg-red-500" },
    { score: 2, label: "Fair", color: "bg-orange-400" },
    { score: 3, label: "Good", color: "bg-yellow-400" },
    { score: 4, label: "Strong", color: "bg-green-500" },
  ];
  return levels[score - 1] ?? { score: 0, label: "", color: "" };
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, error, showStrength = false, className = "", ...props }, ref) => {
    const [visible, setVisible] = useState(false);
    const value = (props.value as string) ?? "";
    const strength = showStrength ? getStrength(value) : null;

    return (
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <AiOutlineLock className="w-4.5 h-4.5" />
          </span>
          <input
            ref={ref}
            type={visible ? "text" : "password"}
            className={`w-full pl-10 pr-11 py-2.5 text-sm text-gray-900 border rounded-lg outline-none transition-all duration-150
              placeholder:text-gray-400 bg-white
              focus:ring-2 focus:ring-[#C0392B]/20 focus:border-[#C0392B]
              ${error ? "border-red-400 bg-red-50 focus:ring-red-500/20 focus:border-red-400" : "border-gray-200 hover:border-gray-300"}
              ${className}`}
            {...props}
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setVisible((v) => !v)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label={visible ? "Hide password" : "Show password"}
          >
            {visible ? <AiOutlineEyeInvisible className="w-5 h-5" /> : <AiOutlineEye className="w-5 h-5" />}
          </button>
        </div>

        {/* Strength meter */}
        {showStrength && value && strength && (
          <div className="flex items-center gap-2 mt-0.5">
            <div className="flex gap-1 flex-1">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                    i <= strength.score ? strength.color : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
            <span className={`text-xs font-medium ${
              strength.score === 1 ? "text-red-500"
              : strength.score === 2 ? "text-orange-500"
              : strength.score === 3 ? "text-yellow-600"
              : "text-green-600"
            }`}>
              {strength.label}
            </span>
          </div>
        )}

        {error && (
          <p className="text-xs text-red-500 flex items-center gap-1">
            <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";
export default PasswordInput;