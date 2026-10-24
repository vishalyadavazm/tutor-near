"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AiOutlineDashboard,
  AiOutlineUser,
  AiOutlineSearch,
  AiOutlineBell,
  AiOutlineCheckCircle,
  AiOutlineCloseCircle,
  AiOutlineClose,
} from "react-icons/ai";
import { BsShieldCheck, BsLightbulb } from "react-icons/bs";
import { FiChevronRight, FiZap } from "react-icons/fi";
import AuthService from "@/services/auth.service";
import mentorService, { MentorProfileRecord } from "@/services/mentor.service";
import { getInitials } from "@/utils/teacherDisplay";

const NAVY = "#15213D";
const ORANGE = "#E8621A";
const ORANGE_BG = "#FFF3EC";
const ORANGE_BORDER = "#F8C9A8";

/* ─── Profile completion ──────────────────────────────── */

interface ProfileChecklistItem {
  label: string;
  done: boolean;
  tip: string;
}

function computeProfileCompletion(p: MentorProfileRecord | null): {
  items: ProfileChecklistItem[];
  pct: number;
} {
  const items: ProfileChecklistItem[] = [
    { label: "Profile photo", done: !!p?.profile_pic, tip: "Add a photo so students can recognize you" },
    { label: "Gender & date of birth", done: !!p?.gender && !!p?.date_of_birth, tip: "Required for your profile" },
    { label: "About & teaching style", done: !!p?.about?.trim(), tip: "Write a short bio about your teaching approach" },
    { label: "Expertise", done: !!p?.expertise?.trim(), tip: "A short label for what you're known for" },
    { label: "Courses you teach", done: (p?.courses_can_teach.length ?? 0) > 0, tip: "Add the courses you can teach" },
    { label: "Years of experience", done: p != null && p.total_expierence_in_years !== null, tip: "Mention your experience to build trust" },
    { label: "Highest qualification", done: (p?.highest_qualification.length ?? 0) > 0, tip: "Add your education credentials" },
    { label: "Temporary & permanent address", done: !!p?.temp_address?.trim() && !!p?.permanent_address?.trim(), tip: "Required for your profile" },
    { label: "City, state & country", done: !!p?.city?.trim() && !!p?.state?.trim() && !!p?.country?.trim(), tip: "Help nearby students find you" },
  ];
  const doneCount = items.filter((i) => i.done).length;
  const pct = Math.round((doneCount / items.length) * 100);
  return { items, pct };
}

const NAV_ITEMS = [
  { icon: <AiOutlineDashboard className="w-5 h-5" />, label: "Dashboard", href: "/dashboard" },
  { icon: <AiOutlineUser className="w-5 h-5" />, label: "My Profile", href: "/profile" },
  { icon: <AiOutlineSearch className="w-5 h-5" />, label: "Browse Teachers", href: "/student" },
];

/* ─── Sub-components ──────────────────────────────── */

function CircleProgress({ pct }: { pct: number }) {
  const r = 40;
  const circ = 2 * Math.PI * r;
  const dash = circ * (pct / 100);
  return (
    <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r={r} fill="none" stroke="#F3F4F6" strokeWidth="9" />
      <circle
        cx="50"
        cy="50"
        r={r}
        fill="none"
        stroke={ORANGE}
        strokeWidth="9"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        style={{ transition: "stroke-dasharray 0.6s ease" }}
      />
    </svg>
  );
}

/* ─── Main component ──────────────────────────────── */

export default function TeacherDashboard() {
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [profileExpanded, setProfileExpanded] = useState(true);
  const [myProfile, setMyProfile] = useState<MentorProfileRecord | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const profiles = await mentorService.getProfiles();
        if (!cancelled) setMyProfile(profiles[0] ?? null);
      } catch (error) {
        if (!cancelled) {
          setMyProfile(null);
          setProfileError(error instanceof Error ? error.message : "Unable to load your teacher profile.");
        }
      } finally {
        if (!cancelled) setProfileLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const { items: profileItems, pct: completionPct } = useMemo(
    () => computeProfileCompletion(myProfile),
    [myProfile],
  );
  const displayName =
    [myProfile?.user?.first_name, myProfile?.user?.last_name].filter(Boolean).join(" ") ||
    myProfile?.user?.email ||
    "Teacher";
  const displayInitials = myProfile ? getInitials(displayName) : "T";
  const isVerified = !!myProfile?.identity_verification_name;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      {/* ── Topbar ── */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-5 h-16 flex items-center gap-6">

          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2.5 shrink-0">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: NAVY }}
            >
              <svg className="w-4.5 h-4.5 text-white" fill="white" viewBox="0 0 24 24">
                <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
              </svg>
            </div>
            <span className="text-base font-semibold">
              <span style={{ color: NAVY }}>Tutor</span>
              <span style={{ color: ORANGE }}>Near</span>
            </span>
          </Link>

          <Link
            href="/teachers"
            className="hidden sm:flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <AiOutlineSearch className="h-4 w-4" />
            Browse teachers
          </Link>

          {/* Right actions */}
          <div className="flex items-center gap-2 ml-auto">
            <button className="relative w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
              <AiOutlineBell className="w-4.5 h-4.5" />
            </button>

            <Link
              href="/profile"
              className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              title="My Profile"
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full text-xs font-bold text-white"
                style={{ background: NAVY }}
              >
                {myProfile?.profile_pic ? (
                  <img
                    src={myProfile.profile_pic}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  displayInitials
                )}
              </span>
              <span className="hidden sm:block max-w-40 truncate">{displayName}</span>
            </Link>

            <button
              onClick={() => AuthService.logout()}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 border border-gray-200 transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* ── Page body ── */}
      <div className="max-w-[1400px] mx-auto px-5 py-6 flex gap-6 items-start">

        {/* ── Left sidebar ── */}
        <aside className="hidden lg:flex flex-col w-60 shrink-0 sticky top-24 self-start gap-1">

          {/* Profile mini-card */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-3 text-center">
            {myProfile?.profile_pic ? (
              <img
                src={myProfile.profile_pic}
                alt={displayName}
                className="w-14 h-14 rounded-full object-cover mx-auto mb-2"
              />
            ) : (
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold text-white mx-auto mb-2"
                style={{ background: NAVY }}
              >
                {displayInitials}
              </div>
            )}
            <div className="text-sm font-semibold text-gray-900 truncate">{displayName}</div>
            {!profileLoading && !profileError && (
              <div className="mt-2 flex items-center justify-center gap-1">
                {isVerified ? (
                  <>
                    <BsShieldCheck className="w-3 h-3 text-green-500" />
                    <span className="text-xs text-green-600 font-medium">Verified</span>
                  </>
                ) : (
                  <span className="text-xs text-gray-400">Not verified</span>
                )}
              </div>
            )}

            {/* Profile strength mini-bar */}
            {!profileLoading && !profileError && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] text-gray-500">Profile strength</span>
                  <span className="text-[10px] font-semibold" style={{ color: ORANGE }}>
                    {completionPct}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full">
                  <div
                    className="h-1.5 rounded-full transition-all"
                    style={{ width: `${completionPct}%`, background: ORANGE }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Nav items */}
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                item.href === "/dashboard"
                  ? "text-white"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
              style={item.href === "/dashboard" ? { background: NAVY } : undefined}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}

          <button
            onClick={() => AuthService.logout()}
            className="mt-2 flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 min-w-0 flex flex-col gap-5">

          {/* Welcome strip */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold" style={{ color: NAVY }}>
                Welcome back{myProfile ? `, ${displayName}` : ""}
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Manage your teacher profile and account
              </p>
            </div>
            <Link
              href="/teachers"
              className="inline-flex sm:hidden items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition-colors hover:border-orange-200 hover:text-[#E8621A]"
            >
              <AiOutlineSearch className="h-4 w-4" />
              Browse teachers
            </Link>
          </div>

          {profileError && (
            <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              Unable to load your teacher profile: {profileError}
            </div>
          )}

          {/* ── Profile Completion Section ── */}
          {!profileError && !bannerDismissed && !profileLoading && completionPct < 100 && (
            <div
              className="rounded-2xl border overflow-hidden"
              style={{ borderColor: ORANGE_BORDER }}
            >
              {/* Header row */}
              <div
                role="button"
                tabIndex={0}
                className="w-full flex items-center justify-between px-5 py-4 cursor-pointer"
                style={{ background: ORANGE_BG }}
                onClick={() => setProfileExpanded((p) => !p)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setProfileExpanded((p) => !p);
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: ORANGE }}
                  >
                    <FiZap className="w-4.5 h-4.5 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold" style={{ color: NAVY }}>
                      {myProfile ? `Complete your profile — ${completionPct}% done` : "Create your teacher profile"}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      Help students learn about your teaching experience and expertise
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-24 h-2 bg-orange-100 rounded-full hidden sm:block">
                    <div
                      className="h-2 rounded-full"
                      style={{ width: `${completionPct}%`, background: ORANGE }}
                    />
                  </div>
                  <span className="text-xs font-semibold" style={{ color: ORANGE }}>
                    {completionPct}%
                  </span>
                  <button
                    className="ml-1 text-gray-400 hover:text-gray-600 p-1 rounded"
                    onClick={(e) => {
                      e.stopPropagation();
                      setBannerDismissed(true);
                    }}
                  >
                    <AiOutlineClose className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Checklist */}
              {profileExpanded && (
                <div className="bg-white px-5 py-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
                    {profileItems.map((item) => (
                      <div
                        key={item.label}
                        className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                          item.done
                            ? "bg-green-50 border-green-100"
                            : "bg-gray-50 border-gray-100 hover:border-orange-200 cursor-pointer"
                        }`}
                      >
                        <div className="shrink-0 mt-0.5">
                          {item.done ? (
                            <AiOutlineCheckCircle className="w-4.5 h-4.5 text-green-500" />
                          ) : (
                            <AiOutlineCloseCircle className="w-4.5 h-4.5 text-gray-300" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div
                            className={`text-xs font-semibold ${
                              item.done ? "text-green-700" : "text-gray-700"
                            }`}
                          >
                            {item.label}
                          </div>
                          {!item.done && item.tip && (
                            <div className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                              {item.tip}
                            </div>
                          )}
                        </div>
                        {!item.done && (
                          <Link
                            href="/profile"
                            className="text-[11px] font-semibold shrink-0 px-2 py-1 rounded-lg transition-all hover:opacity-80"
                            style={{ color: ORANGE, background: ORANGE_BG }}
                          >
                            Add →
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                  <Link
                    href="/profile"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                    style={{ background: ORANGE }}
                  >
                    <AiOutlineUser className="w-4 h-4" />
                    Complete My Profile
                    <FiChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* ── Profile strength / tips ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Profile Strength widget */}
            {!profileError && !profileLoading && (
              <div className="bg-white border border-gray-100 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: ORANGE_BG }}
                  >
                    <FiZap className="w-3.5 h-3.5" style={{ color: ORANGE }} />
                  </div>
                  <h3 className="text-sm font-semibold" style={{ color: NAVY }}>
                    Profile Strength
                  </h3>
                </div>

                {/* Circular progress */}
                <div className="flex flex-col items-center mb-4">
                  <div className="relative">
                    <CircleProgress pct={completionPct} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xl font-bold" style={{ color: NAVY }}>
                        {completionPct}%
                      </span>
                      <span className="text-[10px] text-gray-400">complete</span>
                    </div>
                  </div>
                  <div className="text-xs text-center text-gray-500 mt-2">
                    {completionPct === 100 ? (
                      "Your profile is complete! 🎉"
                    ) : (
                      <>Add <span className="font-semibold text-gray-700">{profileItems.filter((i) => !i.done).length} more sections</span> to reach 100%</>
                    )}
                  </div>
                </div>

                {/* Checklist */}
                <div className="flex flex-col gap-1.5">
                  {profileItems.map((item) => (
                    <div key={item.label} className="flex items-center gap-2.5">
                      {item.done ? (
                        <AiOutlineCheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-gray-200 shrink-0" />
                      )}
                      <span
                        className={`text-xs flex-1 ${
                          item.done ? "text-green-700 line-through" : "text-gray-600"
                        }`}
                      >
                        {item.label}
                      </span>
                      {!item.done && (
                        <Link
                          href="/profile"
                          className="text-[10px] font-medium shrink-0 transition-colors hover:underline"
                          style={{ color: ORANGE }}
                        >
                          Add
                        </Link>
                      )}
                    </div>
                  ))}
                </div>

                <Link
                  href="/profile"
                  className="mt-4 w-full py-2.5 rounded-xl text-sm font-semibold text-center block text-white transition-all hover:opacity-90"
                  style={{ background: ORANGE }}
                >
                  Complete Profile
                </Link>
              </div>
            )}

          {/* Tips card */}
          <div
            className="rounded-2xl p-5 border"
            style={{ background: NAVY, borderColor: NAVY }}
          >
            <div className="flex items-center gap-2 mb-3">
              <BsLightbulb className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-semibold text-white">Quick Tips</span>
            </div>
            <div className="flex flex-col gap-2.5">
              {[
                "Reply promptly to student inquiries",
                "Add a profile photo so students can recognize you",
                "Keep your teaching subjects and profile details up to date",
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span
                    className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5"
                    style={{ background: ORANGE, color: "white" }}
                  >
                    {i + 1}
                  </span>
                  <span className="text-xs text-gray-300 leading-relaxed">{tip}</span>
                </div>
              ))}
            </div>
          </div>
          </div>
        </main>
      </div>
    </div>
  );
}
