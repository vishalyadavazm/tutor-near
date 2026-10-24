import RequireAuth from "@/components/auth/RequireAuth";
import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <RequireAuth allowedRoles={["admin"]}>{children}</RequireAuth>;
}
