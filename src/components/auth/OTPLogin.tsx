"use client";

/**
 * Updated to match the homepage palette:
 *   Navy: #15213D   Red: #C0392B   Peach: #FBE7E0
 */

import React, { useState, useEffect } from "react";
import AuthService from "@/services/auth.service";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AiOutlineMail } from "react-icons/ai";
import OTPInput from "./OTPInput";
import { otpRequestSchema, OtpRequestData } from "@/lib/validations";
import axios from "axios";

const NAVY = "#15213D";
const RED = "#C0392B";

const OTP_RESEND_SECONDS = 60;

export default function OTPLogin() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "verify">("email");
  const [sentEmail, setSentEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [timer, setTimer] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OtpRequestData>({ resolver: zodResolver(otpRequestSchema) });

  useEffect(() => {
    if (timer <= 0) return;
    const id = setTimeout(() => setTimer((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timer]);

  const sendOTP = async (data: OtpRequestData) => {
    setIsSending(true);
    setSubmitError("");

    try {
      await AuthService.sendEmailOTP(data.email);

      setSentEmail(data.email);
      setStep("verify");
      setTimer(OTP_RESEND_SECONDS);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setSubmitError(
          error.response?.data?.error ||
            error.response?.data?.detail ||
            error.response?.data?.message ||
            "Unable to send OTP.",
        );
      } else {
        setSubmitError("Unable to send OTP.");
      }
    } finally {
      setIsSending(false);
    }
  };
  const resendOTP = async () => {
    if (!sentEmail) return;

    setIsSending(true);
    setOtp("");
    setOtpError("");
    setSubmitError("");

    try {
      await AuthService.sendEmailOTP(sentEmail);

      setTimer(OTP_RESEND_SECONDS);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setSubmitError(
          error.response?.data?.error ||
            error.response?.data?.detail ||
            error.response?.data?.message ||
            "Unable to resend OTP.",
        );
      } else {
        setSubmitError("Unable to resend OTP.");
      }
    } finally {
      setIsSending(false);
    }
  };
  const verifyOTP = async () => {
    if (otp.length < 6) {
      setOtpError("Enter all 6 digits of the OTP");
      return;
    }

    setIsVerifying(true);
    setOtpError("");
    setSubmitError("");

    try {
      const res = await AuthService.verifyEmailOTP(sentEmail, otp);

      const token =
        res.data?.token ||
        res.data?.access ||
        res.data?.auth_token ||
        res.data?.data?.token;

      if (token) {
        localStorage.setItem("authToken", token);
      }

      router.push("/dashboard");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setOtpError(
          error.response?.data?.error ||
            error.response?.data?.detail ||
            error.response?.data?.message ||
            "OTP verification failed.",
        );
      } else {
        setOtpError("OTP verification failed.");
      }
    } finally {
      setIsVerifying(false);
    }
  };
  if (step === "verify") {
    return (
      <div className="flex flex-col gap-5">
        <div
          className="rounded-xl p-4 flex items-start gap-3"
          style={{ background: "#FBE7E0" }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
            style={{ background: "#F6D6CB" }}
          >
            <AiOutlineMail className="w-4 h-4" style={{ color: RED }} />
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: NAVY }}>
              OTP sent to
            </p>
            <p className="text-sm font-semibold" style={{ color: RED }}>
              {sentEmail}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Check your inbox and enter the 6-digit code below.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
          <p className="text-sm font-medium text-gray-700 text-center">
            Enter verification code
          </p>
          <OTPInput
            value={otp}
            onChange={(v) => {
              setOtp(v);
              setOtpError("");
            }}
            error={otpError}
          />
        </div>

        {/* Timer / resend */}
        <div className="flex items-center justify-center gap-2 text-sm">
          {timer > 0 ? (
            <p className="text-gray-500">
              Resend in{" "}
              <span
                className="font-semibold tabular-nums"
                style={{ color: RED }}
              >
                {timer}s
              </span>
            </p>
          ) : (
            <button
              type="button"
              onClick={resendOTP}
              disabled={isSending}
              className="font-semibold hover:underline disabled:opacity-50"
              style={{ color: RED }}
            >
              {isSending ? "Sending…" : "Resend OTP"}
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={verifyOTP}
          disabled={isVerifying || otp.length < 6}
          className="w-full py-3 text-white text-sm font-semibold rounded-xl
            transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed
            flex items-center justify-center gap-2 hover:opacity-90"
          style={{ background: RED }}
        >
          {isVerifying ? (
            <>
              <svg
                className="w-4 h-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
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
              Verifying…
            </>
          ) : (
            "Verify & Sign In"
          )}
        </button>

        {submitError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {submitError}
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            setStep("email");
            setOtp("");
            setOtpError("");
          }}
          className="text-sm text-center text-gray-500 hover:text-gray-700 flex items-center justify-center gap-1 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to password login
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(sendOTP)}
      noValidate
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="otp-email"
          className="text-sm font-medium text-gray-700"
        >
          Email address
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <AiOutlineMail className="w-4.5 h-4.5" />
          </span>
          <input
            id="otp-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            {...register("email")}
            className={`w-full pl-10 pr-4 py-2.5 text-sm text-gray-900 border rounded-lg outline-none transition-all duration-150
              placeholder:text-gray-400 bg-white
              focus:ring-2 focus:ring-[#C0392B]/20 focus:border-[#C0392B]
              ${errors.email ? "border-red-400 bg-red-50" : "border-gray-200 hover:border-gray-300"}`}
          />
        </div>
        {errors.email && (
          <p className="text-xs text-red-500 flex items-center gap-1">
            <svg
              className="w-3.5 h-3.5 shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {errors.email.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSending}
        className="mt-1 w-full py-3 text-white text-sm font-semibold rounded-xl
          transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed
          flex items-center justify-center gap-2 hover:opacity-90"
        style={{ background: RED }}
      >
        {isSending ? (
          <>
            <svg
              className="w-4 h-4 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
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
            Sending OTP…
          </>
        ) : (
          "Send OTP"
        )}
      </button>
      {submitError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {submitError}
        </div>
      )}
    </form>
  );
}
