import type { Metadata } from "next";
import RequireAuth from "@/components/auth/RequireAuth";
import AdminTeacherVerification from "@/components/admin/AdminTeacherVerification";

export const metadata: Metadata = { title: "Teacher Verification · TutorNear" };

export default function AdminTeachersPage() {
  return (
    <RequireAuth allowedRoles={["admin"]} loginPath="/admin">
      <AdminTeacherVerification />
    </RequireAuth>
  );
}
