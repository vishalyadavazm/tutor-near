"use client";

/**
 * Updated: focus ring and filled-digit colors match the brand red (#C0392B) instead of blue.
 */

import React, { useRef, KeyboardEvent, ClipboardEvent } from "react";

interface OTPInputProps {
  value: string;
  onChange: (val: string) => void;
  error?: string;
  length?: number;
}

export default function OTPInput({ value, onChange, error, length = 6 }: OTPInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.split("").concat(Array(length).fill("")).slice(0, length);

  const updateOTP = (arr: string[]) => onChange(arr.join(""));

  const handleChange = (index: number, char: string) => {
    const sanitized = char.replace(/\D/g, "").slice(-1);
    const arr = [...digits];
    arr[index] = sanitized;
    updateOTP(arr);
    if (sanitized && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (digits[index]) {
        const arr = [...digits];
        arr[index] = "";
        updateOTP(arr);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    const arr = pasted.split("").concat(Array(length).fill("")).slice(0, length);
    updateOTP(arr);
    const nextEmpty = arr.findIndex((c) => !c);
    const focusIdx = nextEmpty === -1 ? length - 1 : nextEmpty;
    inputRefs.current[focusIdx]?.focus();
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex gap-2.5 sm:gap-3">
        {Array.from({ length }).map((_, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digits[i] ?? ""}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            onFocus={(e) => e.target.select()}
            aria-label={`OTP digit ${i + 1}`}
            className={`w-11 h-12 sm:w-12 sm:h-13 text-center text-lg font-bold rounded-xl border-2 outline-none
              transition-all duration-150 bg-white text-gray-900
              focus:border-[#C0392B] focus:ring-2 focus:ring-[#C0392B]/20 focus:scale-105
              ${error ? "border-red-400 bg-red-50" : digits[i] ? "border-[#C0392B] bg-[#FBE7E0]" : "border-gray-200"}
            `}
          />
        ))}
      </div>
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