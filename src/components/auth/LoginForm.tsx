"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { AiOutlineMail } from "react-icons/ai";
import PasswordInput from "./PasswordInput";
import OTPLogin from "./OTPLogin";
import { loginSchema, LoginFormData } from "@/lib/validations";
import AuthService, { extractRole } from "@/services/auth.service";
import { saveRole, redirectByRole } from "@/utils/auth";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

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
        <h2 className="text-2xl font-bold tracking-tight text-brand-navy">
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
                ? "bg-white shadow-sm text-brand-red"
                : "text-gray-500 hover:text-gray-700"
            }`}
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
          <Input
            id="email"
            label="Email address"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            icon={<AiOutlineMail className="w-4.5 h-4.5" />}
            error={errors.email?.message}
            {...register("email")}
          />

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
                className="w-4 h-4 rounded border-gray-300 accent-brand-red"
              />
              <span className="text-sm text-gray-600">Remember me</span>
            </label>
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-brand-red hover:underline transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            loading={isLoading}
            loadingText="Signing in…"
            className="mt-1"
          >
            Sign In
          </Button>

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
          <Button type="button" variant="outline" className="gap-2.5">
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
          </Button>
        </form>
      ) : (
        <OTPLogin />
      )}

      {/* Footer */}
      <p className="mt-7 text-center text-sm text-gray-500">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-semibold text-brand-red hover:underline">
          Create account
        </Link>
      </p>
    </div>
  );
}
