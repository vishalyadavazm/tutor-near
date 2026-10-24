import RequireAuth from "@/components/auth/RequireAuth";
import type { ReactNode } from "react";

export default function TeachersLayout({ children }: { children: ReactNode }) {
  return <RequireAuth>{children}</RequireAuth>;
}
