"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AiOutlineMail } from "react-icons/ai";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import PasswordInput from "@/components/auth/PasswordInput";
import AuthService, { extractRole } from "@/services/auth.service";
import { clearAuth, saveRole } from "@/utils/auth";

type AccountType = "admin" | "staff";

export default function AdminLoginForm() {
  const router = useRouter();
  const [accountType, setAccountType] = useState<AccountType>("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setSubmitError("");

    try {
      const response = await AuthService.login({ email, password, user_role: accountType });
      const authenticatedRole = extractRole(response);

      if (authenticatedRole !== accountType) {
        clearAuth();
        setSubmitError(
          authenticatedRole
            ? `These credentials are not for a ${accountType === "admin" ? "Admin" : "Staff"} account.`
            : "Unable to verify your account type. Please contact your administrator.",
        );
        return;
      }

      saveRole(authenticatedRole);
      router.replace("/admin/dashboard");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Sign-in failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F5F7FB] px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
        <Link href="/" className="text-xl font-extrabold tracking-tight text-brand-navy">
          Tutor<span className="text-brand-orange">Near</span>
        </Link>
        <p className="mt-8 text-sm font-semibold uppercase tracking-wide text-brand-orange">
          Secure portal
        </p>
        <h1 className="mt-1 text-2xl font-bold text-brand-navy">Admin sign in</h1>
        <p className="mt-2 text-sm text-gray-500">
          Sign in to manage TutorNear administration.
        </p>

        <div className="mt-6 grid grid-cols-2 rounded-xl bg-gray-100 p-1" aria-label="Choose account type">
          {(["admin", "staff"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => {
                setAccountType(type);
                setSubmitError("");
              }}
              aria-pressed={accountType === type}
              className={`rounded-lg px-4 py-2.5 text-sm font-semibold capitalize transition-colors ${
                accountType === type
                  ? "bg-white text-brand-orange shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <Input
            id="admin-email"
            label="Email address"
            type="email"
            autoComplete="username"
            placeholder="you@example.com"
            icon={<AiOutlineMail className="h-4 w-4" />}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <PasswordInput
            id="admin-password"
            label="Password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          {submitError && (
            <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {submitError}
            </p>
          )}
          <Button type="submit" loading={isLoading} loadingText="Signing in..." className="mt-1">
            Sign in as {accountType === "admin" ? "Admin" : "Staff"}
          </Button>
        </form>

        <Link href="/login" className="mt-6 block text-center text-sm font-medium text-brand-orange hover:underline">
          Return to user sign in
        </Link>
      </section>
    </main>
  );
}
