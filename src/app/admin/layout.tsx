"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import RequireAuth from "@/components/auth/RequireAuth";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (pathname.replace(/\/+$/, "") === "/admin") return children;

  return <RequireAuth allowedRoles={["admin", "staff"]}>{children}</RequireAuth>;
}
