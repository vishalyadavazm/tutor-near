"use client";

import { useMemo, useSyncExternalStore } from "react";
import { getAccountSnapshot, parseAccountProfile } from "@/utils/account";
import { getRole, subscribeToRoleChanges } from "@/utils/auth";

export function useAdminAccount() {
  const snapshot = useSyncExternalStore(subscribeToRoleChanges, getAccountSnapshot, () => null);
  const role = useSyncExternalStore(subscribeToRoleChanges, getRole, () => null);
  const profile = useMemo(() => parseAccountProfile(snapshot), [snapshot]);
  const roleLabel = role === "staff" ? "Staff" : "Administrator";
  const displayName = profile?.name || roleLabel;
  const initials = displayName.split(/\s+/).slice(0, 2).map((word) => word[0]).join("").toUpperCase();

  return { profile, roleLabel, displayName, initials };
}
