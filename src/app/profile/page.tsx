"use client";

import { useEffect, useState } from "react";
import TeacherProfile from "@/components/teacher/TeacherProfile";
import StudentProfile from "@/components/student/StudentProfile";
import { getRole } from "@/utils/auth";

export default function ProfilePage() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    setRole(getRole());
  }, []);

  if (role === "student") return <StudentProfile />;
  return <TeacherProfile />;
}
