"use client";

import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  getIsAuthenticatedSnapshot,
  subscribeToRoleChanges,
} from "@/utils/auth";

export default function RequireAuth({ children }: { children: ReactNode }) {
  const router = useRouter();
  const isAuthenticated = useSyncExternalStore(
    subscribeToRoleChanges,
    getIsAuthenticatedSnapshot,
    () => false,
  );

  useEffect(() => {
    if (!isAuthenticated) router.replace("/login");
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 text-sm text-gray-600">
        Redirecting to sign in…
      </main>
    );
  }

  return children;
}
