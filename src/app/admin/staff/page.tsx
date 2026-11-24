import type { Metadata } from "next";
import AdminStaffManager from "@/components/admin/AdminStaffManager";
import RequireAuth from "@/components/auth/RequireAuth";

export const metadata: Metadata = { title: "Staff · TutorNear" };

export default function AdminStaffPage() {
  return (
    <RequireAuth allowedRoles={["admin"]} loginPath="/admin">
      <AdminStaffManager />
    </RequireAuth>
  );
}
