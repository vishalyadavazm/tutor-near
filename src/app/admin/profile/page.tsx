import type { Metadata } from "next";
import AdminProfile from "@/components/admin/AdminProfile";

export const metadata: Metadata = { title: "My profile · TutorNear Administration" };

export default function AdminProfilePage() {
  return <AdminProfile />;
}
