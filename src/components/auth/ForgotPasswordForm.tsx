"use client";

/**
 * Updated to match the homepage palette:
 *   Navy: #15213D   Red: #C0392B   Peach: #FBE7E0
 * Step-progress "done" and final success states keep semantic green —
 * that signals completion, not brand, same logic used elsewhere in the app.
 */

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { AiOutlineMail, AiOutlineCheckCircle } from "react-icons/ai";
import OTPInput from "./OTPInput";
import PasswordInput from "./PasswordInput";
import {
  forgotPasswordEmailSchema,
  ForgotPasswordEmailData,
  resetPasswordSchema,
  ResetPasswordData,
} from "@/lib/validations";

const NAVY = "#15213D";
const RED = "#C0392B";

type Step = "email" | "otp" | "reset" | "success";
const OTP_RESEND_SECONDS = 60;

export default function ForgotPasswordForm() {
  const [step, setStep] = useState<Step>("email");
  const [sentEmail, setSentEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(0);

  // Email form
  const {
    register: regEmail,
    handleSubmit: handleEmail,
    formState: { errors: emailErrors },
  } = useForm<ForgotPasswordEmailData>({ resolver: zodResolver(forgotPasswordEmailSchema) });

  // Reset form
  const {
    register: regReset,
    watch,
    handleSubmit: handleReset,
    formState: { errors: resetErrors },
  } = useForm<ResetPasswordData>({ resolver: zodResolver(resetPasswordSchema) });

  useEffect(() => {
    if (timer <= 0) return;
    const id = setTimeout(() => setTimer((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timer]);

  const sendOTP = async (data: ForgotPasswordEmailData) => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSentEmail(data.email);
    setStep("otp");
    setTimer(OTP_RESEND_SECONDS);
    setIsLoading(false);
  };

  const resendOTP = async () => {
    setIsLoading(true);
    setOtp("");
    setOtpError("");
    await new Promise((r) => setTimeout(r, 1000));
    setTimer(OTP_RESEND_SECONDS);
    setIsLoading(false);
  };

  const verifyOTP = async () => {
    if (otp.length < 6) { setOtpError("Enter all 6 digits of the OTP"); return; }
    setIsLoading(true);
    setOtpError("");
    await new Promise((r) => setTimeout(r, 1200));
    console.log("Verified OTP:", otp);
    setStep("reset");
    setIsLoading(false);
  };

  const resetPassword = async (data: ResetPasswordData) => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1400));
    console.log("Reset password for:", sentEmail, data.newPassword);
    setStep("success");
    setIsLoading(false);
  };

  // Step progress indicator
  const steps = ["Email", "Verify OTP", "New Password"];
  const stepIndex = step === "email" ? 0 : step === "otp" ? 1 : step === "reset" ? 2 : 3;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight" style={{ color: NAVY }}>Reset password</h2>
        <p className="text-gray-500 text-sm mt-1">We&apos;ll get you back in 3 quick steps</p>
      </div>

      {/* Progress bar (hide on success) */}
      {step !== "success" && (
        <div className="flex items-center gap-0 mb-8">
          {steps.map((label, i) => {
            const done = i < stepIndex;
            const active = i === stepIndex;
            return (
              <React.Fragment key={label}>
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
                      ${done ? "bg-green-500 text-white" : active ? "text-white" : "bg-gray-100 text-gray-400"}`}
                    style={active ? { background: RED, boxShadow: `0 0 0 4px ${RED}1A` } : undefined}
                  >
                    {done ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : i + 1}
                  </div>
                  <span
                    className={`text-xs font-medium whitespace-nowrap ${done ? "text-green-600" : "text-gray-400"}`}
                    style={active ? { color: RED } : undefined}
                  >
                    {label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 mb-5 rounded-full transition-all duration-300 ${i < stepIndex ? "bg-green-400" : "bg-gray-200"}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}

      {/* ── Step 1: Email ── */}
      {step === "email" && (
        <form onSubmit={handleEmail(sendOTP)} noValidate className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="fp-email" className="text-sm font-medium text-gray-700">
              Registered email address
            </label>
            <div className="relative">
              <AiOutlineMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4.5 h-4.5" />
              <input
                id="fp-email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                {...regEmail("email")}
                className={`w-full pl-10 pr-4 py-2.5 text-sm text-gray-900 border rounded-lg outline-none transition-all duration-150
                  placeholder:text-gray-400 bg-white focus:ring-2 focus:ring-[#C0392B]/20 focus:border-[#C0392B]
                  ${emailErrors.email ? "border-red-400 bg-red-50" : "border-gray-200 hover:border-gray-300"}`}
              />
            </div>
            {emailErrors.email && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {emailErrors.email.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-1 w-full py-3 text-white text-sm font-semibold rounded-xl
              transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed
              flex items-center justify-center gap-2 hover:opacity-90"
            style={{ background: RED }}
          >
            {isLoading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Sending OTP…
              </>
            ) : (
              "Send Reset OTP"
            )}
          </button>

          <p className="text-center text-sm text-gray-500">
            Remembered it?{" "}
            <Link href="/login" className="font-semibold hover:underline" style={{ color: RED }}>Back to login</Link>
          </p>
        </form>
      )}

      {/* ── Step 2: OTP ── */}
      {step === "otp" && (
        <div className="flex flex-col gap-5">
          <div className="rounded-xl p-4 text-center" style={{ background: "#FBE7E0" }}>
            <p className="text-sm text-gray-600">OTP sent to</p>
            <p className="text-sm font-bold mt-0.5" style={{ color: RED }}>{sentEmail}</p>
          </div>

          <div className="flex flex-col items-center gap-4">
            <p className="text-sm font-medium text-gray-700">Enter 6-digit OTP</p>
            <OTPInput value={otp} onChange={(v) => { setOtp(v); setOtpError(""); }} error={otpError} />
          </div>

          <div className="flex items-center justify-center text-sm">
            {timer > 0 ? (
              <p className="text-gray-500">Resend in <span className="font-semibold tabular-nums" style={{ color: RED }}>{timer}s</span></p>
            ) : (
              <button type="button" onClick={resendOTP} disabled={isLoading} className="font-semibold hover:underline disabled:opacity-50" style={{ color: RED }}>
                {isLoading ? "Sending…" : "Resend OTP"}
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={verifyOTP}
            disabled={isLoading || otp.length < 6}
            className="w-full py-3 text-white text-sm font-semibold rounded-xl
              transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed
              flex items-center justify-center gap-2 hover:opacity-90"
            style={{ background: RED }}
          >
            {isLoading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Verifying…
              </>
            ) : (
              "Verify OTP"
            )}
          </button>
        </div>
      )}

      {/* ── Step 3: Reset ── */}
      {step === "reset" && (
        <form onSubmit={handleReset(resetPassword)} noValidate className="flex flex-col gap-4">
          <PasswordInput
            label="New Password"
            placeholder="Min 8 chars, 1 uppercase, 1 number"
            showStrength
            {...regReset("newPassword")}
            value={watch("newPassword") ?? ""}
            error={resetErrors.newPassword?.message}
          />
          <PasswordInput
            label="Confirm New Password"
            placeholder="Repeat new password"
            {...regReset("confirmPassword")}
            value={watch("confirmPassword") ?? ""}
            error={resetErrors.confirmPassword?.message}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="mt-1 w-full py-3 text-white text-sm font-semibold rounded-xl
              transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed
              flex items-center justify-center gap-2 hover:opacity-90"
            style={{ background: RED }}
          >
            {isLoading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Resetting…
              </>
            ) : (
              "Reset Password"
            )}
          </button>
        </form>
      )}

      {/* ── Step 4: Success ── */}
      {step === "success" && (
        <div className="flex flex-col items-center gap-5 py-4 text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
            <AiOutlineCheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold" style={{ color: NAVY }}>Password reset!</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-xs">
              Your password has been updated. You can now sign in with your new password.
            </p>
          </div>
          <Link
            href="/login"
            className="w-full py-3 text-white text-sm font-semibold rounded-xl
              transition-all duration-200 text-center block hover:opacity-90"
            style={{ background: RED }}
          >
            Back to Login
          </Link>
        </div>
      )}
    </div>
  );
}