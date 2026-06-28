import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

export const otpRequestSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
});

export const otpVerifySchema = z.object({
  otp: z.string().length(6, "Enter the 6-digit OTP"),
});

export const studentRegisterSchema = z
  .object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().min(1, "Email is required").email("Enter a valid email"),
    phone: z
      .string()
      .min(10, "Enter a valid phone number")
      .max(10, "Enter a valid 10-digit number")
      .regex(/^\d+$/, "Phone number must be digits only"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const teacherRegisterSchema = z
  .object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().min(1, "Email is required").email("Enter a valid email"),
    phone: z
      .string()
      .min(10, "Enter a valid phone number")
      .max(10, "Enter a valid 10-digit number")
      .regex(/^\d+$/, "Phone number must be digits only"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    subjects: z
      .array(z.string())
      .min(1, "Select at least one subject"),
    experience: z.string().min(1, "Experience is required"),
    city: z.string().min(2, "City is required"),
    teachingMode: z.enum(["online", "offline", "both"], {
      message: "Select a teaching mode",
    }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const forgotPasswordEmailSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
});

export const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type OtpRequestData = z.infer<typeof otpRequestSchema>;
export type OtpVerifyData = z.infer<typeof otpVerifySchema>;
export type StudentRegisterData = z.infer<typeof studentRegisterSchema>;
export type TeacherRegisterData = z.infer<typeof teacherRegisterSchema>;
export type ForgotPasswordEmailData = z.infer<typeof forgotPasswordEmailSchema>;
export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

export const SUBJECTS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "Hindi",
  "History",
  "Geography",
  "Computer Science",
  "Economics",
  "Accountancy",
  "Business Studies",
  "Political Science",
  "Sociology",
  "Psychology",
  "Music",
  "Drawing / Art",
  "Physical Education",
];

export const EXPERIENCE_OPTIONS = [
  "Less than 1 year",
  "1–2 years",
  "3–5 years",
  "6–10 years",
  "More than 10 years",
];