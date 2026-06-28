"use client";

/**
 * Updated to match the homepage palette:
 *   Navy: #15213D   Red: #C0392B
 */

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { AiOutlineMail } from "react-icons/ai";
import PasswordInput from "./PasswordInput";
import OTPLogin from "./OTPLogin";
import { loginSchema, LoginFormData } from "@/lib/validations";
import AuthService, { extractRole } from "@/services/auth.service";
import { saveRole, redirectByRole } from "@/utils/auth";

const NAVY = "#15213D";
const RED = "#C0392B";

type Tab = "password" | "otp";

export default function LoginForm() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("password");
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });
  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setSubmitError("");

    try {
      const res = await AuthService.login(data);
      const roleFromApi = extractRole(res);
      if (roleFromApi) saveRole(roleFromApi);
      redirectByRole(router);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Login failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-7">
        <h2
          className="text-2xl font-bold tracking-tight"
          style={{ color: NAVY }}
        >
          Welcome back
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Sign in to continue to TutorNear
        </p>
      </div>

      {/* Tab switcher */}
      <div className="flex bg-gray-100 rounded-xl p-1 mb-7">
        {(["password", "otp"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
              tab === t
                ? "bg-white shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
            style={tab === t ? { color: RED } : undefined}
          >
            {t === "password" ? "Password Login" : "Login with OTP"}
          </button>
        ))}
      </div>

      {tab === "password" ? (
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex flex-col gap-4"
        >
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-700"
            >
              Email address
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <AiOutlineMail className="w-4.5 h-4.5" />
              </span>
              <input
                id="email"
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

          {/* Password */}
          <PasswordInput
            label="Password"
            id="password"
            autoComplete="current-password"
            placeholder="Your password"
            {...register("password")}
            value={watch("password") ?? ""}
            error={errors.password?.message}
          />

          {/* Remember me + forgot */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                {...register("rememberMe")}
                className="w-4 h-4 rounded border-gray-300"
                style={{ accentColor: RED }}
              />
              <span className="text-sm text-gray-600">Remember me</span>
            </label>
            <Link
              href="/forgot-password"
              className="text-sm font-medium hover:underline transition-colors"
              style={{ color: RED }}
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="mt-1 w-full py-3 text-white text-sm font-semibold rounded-xl
              transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed
              shadow-sm hover:opacity-90 flex items-center justify-center gap-2"
            style={{ background: RED }}
          >
            {isLoading ? (
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
                Signing in…
              </>
            ) : (
              "Sign In"
            )}
          </button>

          {submitError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {submitError}
            </div>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3 my-1">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Google SSO placeholder — brand colors intentionally left as-is */}
          <button
            type="button"
            className="w-full py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700
              hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 flex items-center justify-center gap-2.5"
          >
            <svg className="w-5 h-5" viewBox="0 0 48 48">
              <path
                fill="#FFC107"
                d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
              />
              <path
                fill="#FF3D00"
                d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
              />
              <path
                fill="#4CAF50"
                d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
              />
              <path
                fill="#1976D2"
                d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
              />
            </svg>
            Continue with Google
          </button>
        </form>
      ) : (
        <OTPLogin />
      )}

      {/* Footer */}
      <p className="mt-7 text-center text-sm text-gray-500">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-semibold hover:underline"
          style={{ color: RED }}
        >
          Create account
        </Link>
      </p>
    </div>
  );
}
