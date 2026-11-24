"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import RequireAuth from "@/components/auth/RequireAuth";
import AdminHeader from "@/components/admin/AdminHeader";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (pathname.replace(/\/+$/, "") === "/admin") return children;

  return (
    <RequireAuth allowedRoles={["admin", "staff"]} loginPath="/admin">
      <div className="min-h-screen bg-[#F5F7FB]">
        <AdminHeader />
        {children}
      </div>
    </RequireAuth>
  );
}
