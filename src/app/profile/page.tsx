"use client";

import { useSyncExternalStore } from "react";
import TeacherProfile from "@/components/teacher/TeacherProfile";
import StudentProfile from "@/components/student/StudentProfile";
import { getRole, subscribeToRoleChanges } from "@/utils/auth";

export default function ProfilePage() {
  const role = useSyncExternalStore(subscribeToRoleChanges, getRole, () => null);

  if (role === null) {
    return <main className="flex min-h-screen items-center justify-center bg-gray-50 text-sm text-gray-500">Loading profile…</main>;
  }
  if (role === "student") return <StudentProfile />;
  return <TeacherProfile />;
}
