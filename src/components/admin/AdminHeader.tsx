"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AiOutlineLogout } from "react-icons/ai";
import AuthService from "@/services/auth.service";
import { useAdminAccount } from "@/components/admin/useAdminAccount";

const sections: Record<string, string> = {
  "/admin/dashboard": "Administration",
  "/admin/staff": "Staff management",
  "/admin/teachers": "Teacher verification",
  "/admin/enquiries": "Enquiry management",
  "/admin/courses": "Courses management",
  "/admin/qualifications": "Qualifications management",
  "/admin/profile": "My profile",
};

export default function AdminHeader() {
  const pathname = usePathname().replace(/\/+$/, "");
  const { profile, roleLabel, displayName, initials } = useAdminAccount();

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center gap-2 px-4 py-3 sm:gap-4 sm:px-6 lg:px-8">
        <Link href="/admin/dashboard" className="shrink-0 text-lg font-extrabold tracking-tight text-brand-navy">
          Tutor<span className="text-brand-orange">Near</span>
          <span className="ml-2 hidden text-sm font-medium text-gray-500 sm:inline">
            {roleLabel === "Staff" ? "Staff" : "Admin"}
          </span>
        </Link>
        <span className="hidden rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700 lg:inline">
          {sections[pathname] || "Administration"}
        </span>
        <nav aria-label="Account" className="ml-auto flex min-w-0 items-center gap-2 sm:gap-3">
          <Link
            href="/admin/profile"
            aria-label="My profile"
            aria-current={pathname === "/admin/profile" ? "page" : undefined}
            title={profile?.name || profile?.email || "My profile"}
            className="flex min-w-0 items-center gap-2 rounded-full border border-gray-200 bg-white p-1 pr-2.5 text-xs font-semibold text-brand-navy transition-colors hover:border-orange-200 hover:bg-orange-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2 sm:pr-3 sm:text-sm"
          >
            <span aria-hidden="true" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-navy text-[11px] text-white sm:h-8 sm:w-8">
              {initials}
            </span>
            <span className="sm:hidden">Profile</span>
            <span className="hidden max-w-40 truncate sm:inline">{profile?.name || "My profile"}</span>
            <span className="sr-only">{displayName}</span>
          </Link>
          <button
            type="button"
            onClick={() => AuthService.logout()}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-xs font-medium text-gray-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 sm:px-3 sm:text-sm"
          >
            <AiOutlineLogout aria-hidden="true" className="h-4 w-4" />
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}
