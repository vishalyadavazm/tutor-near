"use client";

import { notifySuccess } from "@/lib/notifications";

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
      notifySuccess("Welcome back! You’re signed in.", "auth-login");
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
                ? "bg-white shadow-sm text-brand-orange"
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
                className="w-4 h-4 rounded border-gray-300 accent-brand-orange"
              />
              <span className="text-sm text-gray-600">Remember me</span>
            </label>
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-brand-orange hover:underline transition-colors"
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

        </form>
      ) : (
        <OTPLogin />
      )}

      {/* Footer */}
      <p className="mt-7 text-center text-sm text-gray-500">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-semibold text-brand-orange hover:underline">
          Create account
        </Link>
      </p>
    </div>
  );
}
