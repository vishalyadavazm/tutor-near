"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { AiOutlineRight, AiOutlineTeam } from "react-icons/ai";
import { getRole, subscribeToRoleChanges } from "@/utils/auth";

export default function AdminStaffLink() {
  const role = useSyncExternalStore(subscribeToRoleChanges, getRole, () => null);
  if (role !== "admin") return null;

  return (
    <Link
      href="/admin/staff"
      className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
          <AiOutlineTeam className="h-6 w-6" />
        </span>
        <AiOutlineRight className="mt-1 text-gray-400 transition group-hover:translate-x-1 group-hover:text-orange-600" />
      </div>
      <h2 className="mt-5 text-lg font-semibold text-brand-navy">Staff</h2>
      <p className="mt-2 text-sm leading-relaxed text-gray-500">
        View staff accounts and register new team members.
      </p>
    </Link>
  );
}
