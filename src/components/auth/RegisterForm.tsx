"use client";

/**
 * Updated to match the homepage palette:
 *   Navy: #15213D   Red: #C0392B   Peach: #FBE7E0   Lavender: #EEF1FB
 *
 * Field order changed: Full Name → Email → Phone → Password → Confirm
 * Password → Account type (cards) → Submit. All fields are visible at once;
 * account type is still required, but it's now validated on submit instead
 * of hiding the form until it's picked.
 */

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AiOutlineUser,
  AiOutlineMail,
  AiOutlineExclamationCircle,
} from "react-icons/ai";
import { FaGraduationCap, FaChalkboardTeacher } from "react-icons/fa";
import PasswordInput from "./PasswordInput";
import OTPInput from "./OTPInput";
import { studentRegisterSchema, StudentRegisterData } from "@/lib/validations";
import AuthService from "@/services/auth.service";
const NAVY = "#15213D";
const RED = "#C0392B";

type UserType = "student" | "teacher";
type Step = "form" | "otp";

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
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
      {msg}
    </p>
  );
}

function inputCls(error?: string) {
  return `w-full pl-10 pr-4 py-2.5 text-sm text-gray-900 border rounded-lg outline-none transition-all duration-150
    placeholder:text-gray-400 bg-white focus:ring-2 focus:ring-[#C0392B]/20 focus:border-[#C0392B]
    ${error ? "border-red-400 bg-red-50 focus:ring-red-500/20 focus:border-red-400" : "border-gray-200 hover:border-gray-300"}`;
}

// ── Account type option card ────────────────────────────────────
function TypeCard({
  selected,
  onClick,
  icon,
  title,
  desc,
  hasError,
}: {
  selected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  desc: string;
  hasError?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-1 rounded-xl border-2 p-4 text-left transition-all duration-150 flex items-center justify-between gap-3"
      style={
        selected
          ? { borderColor: RED, background: "#FBE7E0" }
          : hasError
            ? { borderColor: "#F87171", background: "white" }
            : { borderColor: "#E5E7EB", background: "white" }
      }
    >
      <div>
        <p
          className="text-sm font-bold"
          style={{ color: selected ? RED : NAVY }}
        >
          {title}
        </p>
        <p className="text-xs text-gray-500 mt-1 leading-relaxed max-w-[180px]">
          {desc}
        </p>
      </div>
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-lg"
        style={{
          background: selected ? "#F6D6CB" : "#F3F4F6",
          color: selected ? RED : "#9CA3AF",
        }}
      >
        {icon}
      </div>
    </button>
  );
}

// ── OTP Verification Screen ───────────────────────────────────
function OTPScreen({
  email,
  onVerify,
  onSuccess,
  onBack,
}: {
  email: string;
  onVerify: (otp: string) => Promise<void>;
  onSuccess: () => void;
  onBack: () => void;
}) {
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let t = 30;
    const interval = setInterval(() => {
      t -= 1;
      setResendTimer(t);
      if (t <= 0) {
        clearInterval(interval);
        setCanResend(true);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const startResendTimer = () => {
    setCanResend(false);
    setResendTimer(30);
    let t = 30;
    const interval = setInterval(() => {
      t -= 1;
      setResendTimer(t);
      if (t <= 0) {
        clearInterval(interval);
        setCanResend(true);
      }
    }, 1000);
  };

  const handleVerify = async () => {
    if (otp.length < 6) {
      setOtpError("Please enter the complete 6-digit OTP");
      return;
    }
    setOtpError("");
    setIsVerifying(true);
    try {
      await onVerify(otp);
      setIsVerifying(false);
      onSuccess();
    } catch (error) {
      setOtpError(
        error instanceof Error ? error.message : "OTP verification failed.",
      );
    }
  };

  const handleResend = () => {
    setOtp("");
    setOtpError("");
    // TODO: resend OTP API call
    startResendTimer();
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{ background: "#FBE7E0" }}
      >
        <svg
          className="w-8 h-8"
          style={{ color: RED }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
          />
        </svg>
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-500">
          We sent a 6-digit code to{" "}
          <span className="font-semibold" style={{ color: NAVY }}>
            {email}
          </span>
        </p>
      </div>

      <OTPInput value={otp} onChange={setOtp} error={otpError} />

      <button
        onClick={handleVerify}
        disabled={isVerifying || otp.length < 6}
        className="w-full py-3 text-white text-sm font-semibold rounded-xl
          transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed
          flex items-center justify-center gap-2 shadow-sm hover:opacity-90"
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
          "Verify OTP"
        )}
      </button>

      <p className="text-sm text-gray-500">
        Didn&apos;t receive the code?{" "}
        {canResend ? (
          <button
            onClick={handleResend}
            className="font-semibold hover:underline"
            style={{ color: RED }}
          >
            Resend OTP
          </button>
        ) : (
          <span className="text-gray-400">Resend in {resendTimer}s</span>
        )}
      </p>

      <button
        onClick={onBack}
        className="text-sm text-gray-400 hover:text-gray-600 hover:underline transition-colors"
      >
        ← Wrong email? Go back
      </button>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────
export default function RegisterForm() {
  const router = useRouter();
  const [userType, setUserType] = useState<UserType | null>(null);
  const [typeError, setTypeError] = useState(false);
  const [step, setStep] = useState<Step>("form");
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [registrationData, setRegistrationData] =
    useState<StudentRegisterData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const {
    register,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<StudentRegisterData>({
    resolver: zodResolver(studentRegisterSchema),
  });

  const onSubmit = async (data: StudentRegisterData) => {
    if (!userType) {
      setTypeError(true);
      // Scroll the cards into view so the error isn't missed below the fold
      document
        .getElementById("account-type-section")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setTypeError(false);
    setSubmitError("");
    setIsLoading(true);
    setRegistrationData(data);

    try {
      await AuthService.sendRegisterOTP({
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: userType!,
        profile_type: userType!.charAt(0).toUpperCase() + userType!.slice(1),
      });

      setRegisteredEmail(data.email);
      setStep("otp");
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Unable to create account.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterNewUser = async (otp: string) => {
    if (!registrationData) {
      throw new Error("Missing registration data");
    }

    const payload = {
      first_name: registrationData.firstName,
      last_name: registrationData.lastName,
      email: registrationData.email,
      phone: registrationData.phone,
      password: registrationData.password,
      role: userType!,
      profile_type: userType!.charAt(0).toUpperCase() + userType!.slice(1),
      otp,
    };

    await AuthService.registerUser(payload);
  };

  const handleOTPSuccess = () => {
    router.push("/login");
  };

  if (step === "otp") {
    return (
      <div>
        <div className="mb-6">
          <h2
            className="text-2xl font-bold tracking-tight"
            style={{ color: NAVY }}
          >
            Verify your email
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Almost there! Enter the code we sent you.
          </p>
        </div>
        <OTPScreen
          email={registeredEmail}
          onVerify={handleRegisterNewUser}
          onSuccess={handleOTPSuccess}
          onBack={() => setStep("form")}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2
          className="text-2xl font-bold tracking-tight"
          style={{ color: NAVY }}
        >
          Create your account
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Join thousands of learners and educators on TutorNear
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-4"
      >
        {/* First / Last Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              First Name
            </label>
            <div className="relative">
              <AiOutlineUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4.5 h-4.5" />
              <input
                type="text"
                placeholder="Rahul"
                {...register("firstName")}
                className={inputCls(errors.firstName?.message)}
              />
            </div>
            <FieldError msg={errors.firstName?.message} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Last Name
            </label>
            <div className="relative">
              <AiOutlineUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4.5 h-4.5" />
              <input
                type="text"
                placeholder="Verma"
                {...register("lastName")}
                className={inputCls(errors.lastName?.message)}
              />
            </div>
            <FieldError msg={errors.lastName?.message} />
          </div>
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">
            Email address
          </label>
          <div className="relative">
            <AiOutlineMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4.5 h-4.5" />
            <input
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              {...register("email")}
              className={inputCls(errors.email?.message)}
            />
          </div>
          <FieldError msg={errors.email?.message} />
        </div>

        {/* Phone */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">
            Phone Number
          </label>
          <div className="relative flex">
            <span className="flex items-center px-3 border border-r-0 border-gray-200 rounded-l-lg bg-gray-50 text-sm text-gray-600 font-medium">
              +91
            </span>
            <input
              type="tel"
              placeholder="9876543210"
              maxLength={10}
              {...register("phone")}
              className={`flex-1 pr-4 py-2.5 text-sm text-gray-900 border rounded-r-lg outline-none transition-all duration-150
                placeholder:text-gray-400 bg-white focus:ring-2 focus:ring-[#C0392B]/20 focus:border-[#C0392B]
                ${errors.phone ? "border-red-400 bg-red-50" : "border-gray-200 hover:border-gray-300"}`}
            />
          </div>
          <FieldError msg={errors.phone?.message} />
        </div>

        {/* Password */}
        <PasswordInput
          label="Password"
          placeholder="Min 8 chars, 1 uppercase, 1 number"
          showStrength
          {...register("password")}
          value={watch("password") ?? ""}
          error={errors.password?.message}
        />

        {/* Confirm Password */}
        <PasswordInput
          label="Confirm Password"
          placeholder="Repeat password"
          {...register("confirmPassword")}
          value={watch("confirmPassword") ?? ""}
          error={errors.confirmPassword?.message}
        />

        {/* Account type — now appears after Confirm Password */}
        <div id="account-type-section" className="flex flex-col gap-1.5 mt-1">
          <label className="text-sm font-medium text-gray-700">
            I am registering as <span style={{ color: RED }}>*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <TypeCard
              selected={userType === "student"}
              hasError={typeError}
              onClick={() => {
                setUserType("student");
                setTypeError(false);
              }}
              icon={<FaGraduationCap />}
              title="Student / Parent"
              desc="I'm looking for a tutor to learn a subject or skill"
            />
            <TypeCard
              selected={userType === "teacher"}
              hasError={typeError}
              onClick={() => {
                setUserType("teacher");
                setTypeError(false);
              }}
              icon={<FaChalkboardTeacher />}
              title="Teacher"
              desc="I want to offer tutoring services and earn"
            />
          </div>
          {typeError && (
            <FieldError msg="Please select an account type to continue" />
          )}
        </div>

        {submitError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {submitError}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="mt-1 w-full py-3 text-white text-sm font-semibold rounded-xl
            transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed
            flex items-center justify-center gap-2 shadow-sm hover:opacity-90"
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
              Creating account…
            </>
          ) : (
            "Create Account"
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold hover:underline"
          style={{ color: RED }}
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
