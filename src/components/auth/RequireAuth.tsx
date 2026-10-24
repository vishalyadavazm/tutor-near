"use client";

import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getIsAuthenticatedSnapshot,
  getRole,
  subscribeToRoleChanges,
} from "@/utils/auth";

interface RequireAuthProps {
  children: ReactNode;
  allowedRoles?: string[];
}

export default function RequireAuth({ children, allowedRoles }: RequireAuthProps) {
  const router = useRouter();
  const isAuthenticated = useSyncExternalStore(
    subscribeToRoleChanges,
    getIsAuthenticatedSnapshot,
    () => false,
  );
  const role = useSyncExternalStore(subscribeToRoleChanges, getRole, () => null);
  const hasAllowedRole = !allowedRoles || (role !== null && allowedRoles.includes(role));

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

  if (!hasAllowedRole) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-gray-50 px-4 text-center">
        <p className="text-sm text-gray-600">You don&apos;t have permission to access this page.</p>
        <Link href="/" className="text-sm font-medium text-brand-orange hover:underline">
          Return to home
        </Link>
      </main>
    );
  }

  return children;
}
