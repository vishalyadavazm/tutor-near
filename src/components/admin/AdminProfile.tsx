"use client";

import { AiOutlineMail, AiOutlinePhone, AiOutlineSafetyCertificate, AiOutlineUser } from "react-icons/ai";
import BackLink from "@/components/common/BackLink";
import { useAdminAccount } from "@/components/admin/useAdminAccount";

export default function AdminProfile() {
  const { profile, roleLabel, displayName, initials } = useAdminAccount();
  const details = [
    { label: "Full name", value: profile?.name || "Not provided", icon: AiOutlineUser },
    { label: "Email address", value: profile?.email || "Not available", icon: AiOutlineMail },
    { label: "Phone number", value: profile?.phone || "Not provided", icon: AiOutlinePhone },
    { label: "Account role", value: roleLabel, icon: AiOutlineSafetyCertificate },
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 pb-10 pt-3 text-gray-900 sm:px-6 lg:px-8">
      <BackLink href="/admin/dashboard">Admin dashboard</BackLink>
      <div className="mx-auto max-w-3xl py-7 sm:py-10">
        <p className="text-sm font-semibold text-brand-orange">ADMINISTRATION</p>
        <h1 className="mt-1 text-2xl font-bold text-brand-navy sm:text-3xl">My profile</h1>
        <p className="mt-2 text-sm text-gray-500">Your TutorNear account details.</p>

        <section aria-label="Account details" className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center gap-4 border-b border-gray-100 bg-slate-50/70 p-5 sm:p-6">
            <span aria-hidden="true" className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-brand-navy text-xl font-semibold text-white">
              {initials}
            </span>
            <div className="min-w-0">
              <h2 className="break-words text-lg font-semibold text-brand-navy">{displayName}</h2>
              {profile?.email && <p className="mt-1 break-all text-sm text-gray-500">{profile.email}</p>}
              <span className="mt-2 inline-block rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700">
                {roleLabel}
              </span>
            </div>
          </div>
          <dl className="grid gap-x-8 gap-y-6 p-5 sm:grid-cols-2 sm:p-6">
            {details.map(({ label, value, icon: Icon }) => (
              <div key={label} className="min-w-0">
                <dt className="flex items-center gap-2 text-xs font-medium text-gray-500">
                  <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
                  {label}
                </dt>
                <dd className="mt-2 break-words text-sm font-medium text-brand-navy">{value}</dd>
              </div>
            ))}
          </dl>
          {!profile && (
            <p className="border-t border-gray-100 px-5 py-4 text-sm text-gray-500 sm:px-6">
              Sign in again to see your account details.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
