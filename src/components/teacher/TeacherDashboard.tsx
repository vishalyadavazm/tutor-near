"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AiOutlineDashboard,
  AiOutlineUser,
  AiOutlineCalendar,
  AiOutlineTeam,
  AiOutlineStar,
  AiOutlineSetting,
  AiOutlineBell,
  AiOutlineCheckCircle,
  AiOutlineCloseCircle,
  AiOutlineEnvironment,
  AiOutlineClose,
  AiOutlineMessage,
} from "react-icons/ai";
import {
  BsStarFill,
  BsCurrencyRupee,
  BsShieldCheck,
  BsLightbulb,
} from "react-icons/bs";
import { FiUsers, FiTrendingUp, FiChevronRight, FiZap } from "react-icons/fi";
import { MdOutlineVideoCall } from "react-icons/md";
import AuthService from "@/services/auth.service";
import mentorService, { MentorProfileRecord } from "@/services/mentor.service";
import { getInitials } from "@/utils/teacherDisplay";

const NAVY = "#15213D";
const ORANGE = "#E8621A";
const ORANGE_BG = "#FFF3EC";
const ORANGE_BORDER = "#F8C9A8";
const NAVY_BG = "#EEF0F6";
const MUTED = "#9FA9C4";

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
    { label: "Profile photo", done: !!p?.profile_pic, tip: "Teachers with photos get 3× more inquiries" },
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

/* ─── Static data ──────────────────────────────────── */

const STATS = [
  {
    label: "Active Students",
    value: "12",
    icon: <FiUsers className="w-5 h-5" />,
    bg: "#EEF2FF",
    color: "#4338CA",
    change: "+2 this week",
  },
  {
    label: "Sessions This Month",
    value: "34",
    icon: <AiOutlineCalendar className="w-5 h-5" />,
    bg: "#F0FDF4",
    color: "#16A34A",
    change: "+8 vs last month",
  },
  {
    label: "Avg Rating",
    value: "4.7",
    icon: <BsStarFill className="w-5 h-5" />,
    bg: "#FFFBEB",
    color: "#D97706",
    change: "Based on 23 reviews",
  },
  {
    label: "Monthly Earnings",
    value: "₹8,400",
    icon: <BsCurrencyRupee className="w-5 h-5" />,
    bg: ORANGE_BG,
    color: ORANGE,
    change: "+₹1,200 vs last month",
  },
];

const INQUIRIES = [
  {
    id: 1,
    initials: "AS",
    name: "Aarav Singh",
    subject: "Mathematics",
    level: "Class 11 · JEE Prep",
    city: "Varanasi",
    mode: "Offline",
    budget: "₹500–700/hr",
    posted: "2 hrs ago",
    bg: "#DBEAFE",
    color: "#1D4ED8",
    isNew: true,
  },
  {
    id: 2,
    initials: "PG",
    name: "Pooja Gupta",
    subject: "Physics",
    level: "Class 12 · NEET",
    city: "Varanasi",
    mode: "Online",
    budget: "₹400–600/hr",
    posted: "5 hrs ago",
    bg: "#D1FAE5",
    color: "#065F46",
    isNew: true,
  },
  {
    id: 3,
    initials: "RM",
    name: "Ritesh Mishra",
    subject: "Mathematics",
    level: "Class 9",
    city: "Mirzapur",
    mode: "Both",
    budget: "₹300–500/hr",
    posted: "1 day ago",
    bg: "#FEF9C3",
    color: "#92400E",
    isNew: false,
  },
  {
    id: 4,
    initials: "SK",
    name: "Sneha Kumari",
    subject: "English",
    level: "Class 10 · Boards",
    city: "Varanasi",
    mode: "Offline",
    budget: "₹350–500/hr",
    posted: "1 day ago",
    bg: "#FAE8FF",
    color: "#86198F",
    isNew: false,
  },
  {
    id: 5,
    initials: "VT",
    name: "Vivek Tiwari",
    subject: "Chemistry",
    level: "Class 12 · JEE Adv",
    city: "Varanasi",
    mode: "Online",
    budget: "₹600–800/hr",
    posted: "2 days ago",
    bg: "#ECFDF5",
    color: "#047857",
    isNew: false,
  },
  {
    id: 6,
    initials: "NK",
    name: "Nisha Khatri",
    subject: "Mathematics",
    level: "Class 8",
    city: "Sarnath",
    mode: "Offline",
    budget: "₹250–400/hr",
    posted: "3 days ago",
    bg: "#E0F2FE",
    color: "#0369A1",
    isNew: false,
  },
];

const SESSIONS = [
  {
    student: "Aarav Singh",
    subject: "Mathematics",
    time: "Today, 4:00 PM",
    mode: "Offline",
    initials: "AS",
    bg: "#DBEAFE",
    color: "#1D4ED8",
  },
  {
    student: "Pooja Gupta",
    subject: "Physics",
    time: "Tomorrow, 10:00 AM",
    mode: "Online",
    initials: "PG",
    bg: "#D1FAE5",
    color: "#065F46",
  },
  {
    student: "Ritesh Mishra",
    subject: "Mathematics",
    time: "Thu, Jun 30 · 5:00 PM",
    mode: "Offline",
    initials: "RM",
    bg: "#FEF9C3",
    color: "#92400E",
  },
];

const NAV_ITEMS = [
  { icon: <AiOutlineDashboard className="w-5 h-5" />, label: "Dashboard", href: "/dashboard" },
  { icon: <AiOutlineUser className="w-5 h-5" />, label: "My Profile", href: "/profile" },
  { icon: <AiOutlineCalendar className="w-5 h-5" />, label: "Sessions", href: "/sessions" },
  { icon: <AiOutlineTeam className="w-5 h-5" />, label: "My Students", href: "/students" },
  { icon: <BsCurrencyRupee className="w-5 h-5" />, label: "Earnings", href: "/earnings" },
  { icon: <AiOutlineStar className="w-5 h-5" />, label: "Reviews", href: "/reviews" },
  { icon: <AiOutlineSetting className="w-5 h-5" />, label: "Settings", href: "/settings" },
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

function InquiryCard({
  inq,
  onRespond,
}: {
  inq: (typeof INQUIRIES)[0];
  onRespond: (id: number) => void;
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 hover:border-orange-200 hover:shadow-sm transition-all duration-150">
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0"
          style={{ background: inq.bg, color: inq.color }}
        >
          {inq.initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900 truncate">
              {inq.name}
            </span>
            {inq.isNew && (
              <span
                className="text-xs font-medium px-1.5 py-0.5 rounded-full shrink-0"
                style={{ background: ORANGE_BG, color: ORANGE }}
              >
                New
              </span>
            )}
          </div>
          <div className="text-xs text-gray-500 truncate">
            {inq.subject} · {inq.level}
          </div>
        </div>
        <span className="text-xs text-gray-400 shrink-0">{inq.posted}</span>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        <span className="text-xs bg-gray-50 text-gray-500 px-2 py-0.5 rounded-full border border-gray-100 flex items-center gap-1">
          <AiOutlineEnvironment className="w-3 h-3" />
          {inq.city}
        </span>
        <span
          className="text-xs px-2 py-0.5 rounded-full border"
          style={{
            background: inq.mode === "Online" ? "#F0FDF4" : inq.mode === "Offline" ? "#EEF2FF" : ORANGE_BG,
            color: inq.mode === "Online" ? "#16A34A" : inq.mode === "Offline" ? "#4338CA" : ORANGE,
            borderColor: inq.mode === "Online" ? "#BBF7D0" : inq.mode === "Offline" ? "#C7D2FE" : ORANGE_BORDER,
          }}
        >
          {inq.mode}
        </span>
        <span className="text-xs bg-gray-50 text-gray-500 px-2 py-0.5 rounded-full border border-gray-100">
          {inq.budget}
        </span>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onRespond(inq.id)}
          className="flex-1 py-1.5 text-xs font-semibold rounded-lg text-white transition-all hover:opacity-90"
          style={{ background: ORANGE }}
        >
          Respond
        </button>
        <button className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all">
          View
        </button>
      </div>
    </div>
  );
}

/* ─── Main component ──────────────────────────────── */

export default function TeacherDashboard() {
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [profileExpanded, setProfileExpanded] = useState(true);
  const [inquiryFilter, setInquiryFilter] = useState<"all" | "new" | "responded">("all");
  const [respondedIds, setRespondedIds] = useState<Set<number>>(new Set());
  const [myProfile, setMyProfile] = useState<MentorProfileRecord | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const profiles = await mentorService.getProfiles();
        if (!cancelled) setMyProfile(profiles[0] ?? null);
      } catch {
        if (!cancelled) setMyProfile(null);
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
  const displayName = myProfile?.user?.name || "Teacher";
  const displayInitials = myProfile ? getInitials(displayName) : "T";
  const isVerified = !!myProfile?.identity_verification_name;

  const activeInquiries =
    inquiryFilter === "new"
      ? INQUIRIES.filter((i) => i.isNew && !respondedIds.has(i.id))
      : inquiryFilter === "responded"
      ? INQUIRIES.filter((i) => respondedIds.has(i.id))
      : INQUIRIES;

  const newCount = INQUIRIES.filter((i) => i.isNew && !respondedIds.has(i.id)).length;

  function handleRespond(id: number) {
    setRespondedIds((prev) => new Set(prev).add(id));
  }

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
            <span className="text-base font-semibold" style={{ color: NAVY }}>
              TutorNear
            </span>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-1 flex-1">
            {[
              { label: "Dashboard", href: "/dashboard", active: true },
              { label: "Students", href: "/students", active: false },
              { label: "Sessions", href: "/sessions", active: false },
              { label: "Earnings", href: "/earnings", active: false },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  item.active ? "text-white" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                }`}
                style={item.active ? { background: ORANGE } : undefined}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 ml-auto">
            <button className="relative w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
              <AiOutlineMessage className="w-4.5 h-4.5" />
            </button>
            <button className="relative w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
              <AiOutlineBell className="w-4.5 h-4.5" />
              {newCount > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 w-4 h-4 text-white text-[9px] font-bold rounded-full flex items-center justify-center"
                  style={{ background: ORANGE }}
                >
                  {newCount}
                </span>
              )}
            </button>

            {/* Avatar */}
            <Link href="/profile" className="flex items-center gap-2 pl-2 border-l border-gray-100">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                style={{ background: NAVY }}
              >
                {displayInitials}
              </div>
              <div className="hidden lg:block leading-tight">
                <div className="text-xs font-semibold text-gray-800 truncate max-w-[140px]">{displayName}</div>
                <div className="text-[10px]" style={{ color: MUTED }}>View profile</div>
              </div>
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
        <aside className="hidden lg:flex flex-col w-52 shrink-0 sticky top-24 self-start gap-1">

          {/* Profile mini-card */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-3 text-center">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold text-white mx-auto mb-2"
              style={{ background: NAVY }}
            >
              {displayInitials}
            </div>
            <div className="text-sm font-semibold text-gray-900 truncate">{displayName}</div>
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

            {/* Profile strength mini-bar */}
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
                Good morning! 👋
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Here&apos;s what&apos;s happening with your tutoring today
              </p>
            </div>
            <div className="text-xs text-gray-400 hidden sm:block">
              Sat, 28 Jun 2026
            </div>
          </div>

          {/* ── Profile Completion Section ── */}
          {!bannerDismissed && !profileLoading && (
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
                      Teachers with complete profiles get <span className="font-medium" style={{ color: ORANGE }}>5× more student inquiries</span>
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

          {/* ── Stats row ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: stat.bg, color: stat.color }}
                  >
                    {stat.icon}
                  </div>
                  <FiTrendingUp className="w-3.5 h-3.5 text-gray-300" />
                </div>
                <div className="text-xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
                <div className="text-[11px] mt-1 font-medium" style={{ color: stat.color }}>
                  {stat.change}
                </div>
              </div>
            ))}
          </div>

          {/* ── Student Inquiries ── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold" style={{ color: NAVY }}>
                  Student Inquiries
                </h2>
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: ORANGE_BG, color: ORANGE }}
                >
                  {INQUIRIES.length}
                </span>
              </div>

              {/* Filter tabs */}
              <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
                {(["all", "new", "responded"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setInquiryFilter(f)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all ${
                      inquiryFilter === f
                        ? "bg-white shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    style={inquiryFilter === f ? { color: ORANGE } : undefined}
                  >
                    {f}
                    {f === "new" && newCount > 0 && (
                      <span
                        className="ml-1 px-1 py-0.5 rounded text-[9px] font-bold text-white"
                        style={{ background: ORANGE }}
                      >
                        {newCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {activeInquiries.length === 0 ? (
              <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center">
                <div className="text-3xl mb-2">🎉</div>
                <div className="text-sm font-medium text-gray-600">All caught up!</div>
                <div className="text-xs text-gray-400 mt-1">No inquiries in this category yet.</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {activeInquiries.map((inq) => (
                  <InquiryCard
                    key={inq.id}
                    inq={{ ...inq, isNew: inq.isNew && !respondedIds.has(inq.id) }}
                    onRespond={handleRespond}
                  />
                ))}
              </div>
            )}
          </div>
        </main>

        {/* ── Right sidebar ── */}
        <aside className="hidden xl:flex flex-col w-72 shrink-0 sticky top-24 self-start gap-4">

          {/* Profile Strength widget */}
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

          {/* Upcoming sessions */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: NAVY_BG }}
                >
                  <AiOutlineCalendar className="w-3.5 h-3.5" style={{ color: NAVY }} />
                </div>
                <h3 className="text-sm font-semibold" style={{ color: NAVY }}>
                  Upcoming Sessions
                </h3>
              </div>
              <Link
                href="/sessions"
                className="text-xs font-medium hover:underline"
                style={{ color: ORANGE }}
              >
                View all
              </Link>
            </div>

            <div className="flex flex-col gap-3">
              {SESSIONS.map((s, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
                    style={{ background: s.bg, color: s.color }}
                  >
                    {s.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-gray-800 truncate">
                      {s.student}
                    </div>
                    <div className="text-[11px] text-gray-500">{s.subject}</div>
                    <div className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                      <AiOutlineCalendar className="w-3 h-3" />
                      {s.time}
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0 flex items-center gap-0.5 ${
                      s.mode === "Online"
                        ? "bg-green-50 text-green-700"
                        : "bg-blue-50 text-blue-700"
                    }`}
                  >
                    {s.mode === "Online" && <MdOutlineVideoCall className="w-3 h-3" />}
                    {s.mode}
                  </span>
                </div>
              ))}
            </div>
          </div>

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
                "Respond to student inquiries within 2 hours to increase acceptance rate",
                "Add a profile photo — verified photos increase trust by 40%",
                "Set your availability calendar to show when you can take new students",
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
        </aside>
      </div>
    </div>
  );
}
