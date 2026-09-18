"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import clsx from "clsx";
import {
  AiOutlineUser,
  AiOutlineMail,
} from "react-icons/ai";
import { FaGraduationCap, FaChalkboardTeacher } from "react-icons/fa";
import PasswordInput from "./PasswordInput";
import OTPInput from "./OTPInput";
import { studentRegisterSchema, StudentRegisterData } from "@/lib/validations";
import AuthService from "@/services/auth.service";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import FieldError from "@/components/ui/FieldError";

type UserType = "student" | "teacher";
type Step = "form" | "otp";

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
      className={clsx(
        "flex-1 rounded-xl border-2 p-4 text-left transition-all duration-150 flex items-center justify-between gap-3",
        selected
          ? "border-brand-red bg-brand-peach"
          : hasError
            ? "border-red-400 bg-white"
            : "border-gray-200 bg-white",
      )}
    >
      <div>
        <p
          className={clsx(
            "text-sm font-bold",
            selected ? "text-brand-red" : "text-brand-navy",
          )}
        >
          {title}
        </p>
        <p className="text-xs text-gray-500 mt-1 leading-relaxed max-w-[180px]">
          {desc}
        </p>
      </div>
      <div
        className={clsx(
          "w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-lg",
          selected ? "bg-brand-peach text-brand-red" : "bg-gray-100 text-gray-400",
        )}
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
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-brand-peach">
        <svg
          className="w-8 h-8 text-brand-red"
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
          <span className="font-semibold text-brand-navy">{email}</span>
        </p>
      </div>

      <OTPInput value={otp} onChange={setOtp} error={otpError} />

      <Button
        onClick={handleVerify}
        disabled={otp.length < 6}
        loading={isVerifying}
        loadingText="Verifying…"
      >
        Verify OTP
      </Button>

      <p className="text-sm text-gray-500">
        Didn&apos;t receive the code?{" "}
        {canResend ? (
          <button
            onClick={handleResend}
            className="font-semibold text-brand-red hover:underline"
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
          <h2 className="text-2xl font-bold tracking-tight text-brand-navy">
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
        <h2 className="text-2xl font-bold tracking-tight text-brand-navy">
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
          <Input
            label="First Name"
            placeholder="Rahul"
            icon={<AiOutlineUser className="w-4.5 h-4.5" />}
            error={errors.firstName?.message}
            {...register("firstName")}
          />
          <Input
            label="Last Name"
            placeholder="Verma"
            icon={<AiOutlineUser className="w-4.5 h-4.5" />}
            error={errors.lastName?.message}
            {...register("lastName")}
          />
        </div>

        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          icon={<AiOutlineMail className="w-4.5 h-4.5" />}
          error={errors.email?.message}
          {...register("email")}
        />

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
              className={clsx(
                "flex-1 pr-4 py-2.5 text-sm text-gray-900 border rounded-r-lg outline-none transition-all duration-150",
                "placeholder:text-gray-400 bg-white focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red",
                errors.phone
                  ? "border-red-400 bg-red-50"
                  : "border-gray-200 hover:border-gray-300",
              )}
            />
          </div>
          <FieldError message={errors.phone?.message} />
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
            I am registering as <span className="text-brand-red">*</span>
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
            <FieldError message="Please select an account type to continue" />
          )}
        </div>

        {submitError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {submitError}
          </div>
        )}

        <Button
          type="submit"
          loading={isLoading}
          loadingText="Creating account…"
          className="mt-1"
        >
          Create Account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-brand-red hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
