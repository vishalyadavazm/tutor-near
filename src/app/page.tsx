"use client";

/**
 * Content-rich guest homepage (Naukri-style) — same navy/red palette:
 *  Navy:    #15213D   Red: #C0392B   Peach: #FBE7E0   Lavender: #EEF1FB
 */

import React, { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import AuthService from "@/services/auth.service";
import {
  AiOutlineSearch,
  AiOutlineEnvironment,
  AiOutlineCalendar,
  AiOutlineBook,
} from "react-icons/ai";
import { BsStarFill, BsHeartFill, BsShieldCheck, BsChevronDown, BsChevronUp } from "react-icons/bs";
import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaRupeeSign,
  FaClock,
  FaUserCheck,
  FaBriefcase,
  FaGraduationCap,
} from "react-icons/fa";
import mentorService from "@/services/mentor.service";
import studentService, { type StudentPost } from "@/services/student.service";
import JobPostSlider from "@/components/student/JobPostSlider";
import { DisplayTeacher, formatExperience, toDisplayTeacherFromDirectory } from "@/utils/teacherDisplay";
import { getToken } from "@/utils/auth";

const NAVY = "#15213D";
const RED = "#C0392B";
const ORANGE = "#E8621A";

function subscribeToAuthChanges(onChange: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", onChange);
  window.addEventListener("auth-state-change", onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener("auth-state-change", onChange);
  };
}

function getAuthSnapshot() {
  return !!getToken();
}

/* ─── Data ─────────────────────────────────────── */
const TRENDING_SEARCHES = [
  "JEE Physics", "Class 10 Maths", "Spoken English", "Python for Kids",
  "NEET Biology", "Guitar Classes", "GMAT Prep", "French Language",
];

const TESTIMONIALS = [
  { initials: "SV", name: "Sunita Verma", role: "Parent, Kanpur",  rating: 5, quote: "We found a physics tutor within a day of signing up. My son's grades improved within a month of starting sessions." },
  { initials: "RS", name: "Rohit Sharma", role: "Maths Tutor",      rating: 5, quote: "Managing my students and getting paid on time has never been this simple. TutorNear handles the admin so I can focus on teaching." },
  { initials: "AR2", name: "Ananya Roy",  role: "Student, Delhi",  rating: 4.5, quote: "Found an amazing French tutor online. The booking process was smooth and the demo class convinced me right away." },
];

const FAQS = [
  { q: "Is TutorNear free to use for students?", a: "Yes, browsing tutor profiles, comparing rates, and booking a free demo class is completely free for students and parents." },
  { q: "How are tutors verified on the platform?", a: "Every tutor goes through ID verification, qualification checks, and a short screening interview before their profile goes live." },
  { q: "Can I switch tutors if I'm not satisfied?", a: "Absolutely. You can book a demo with multiple tutors and switch anytime — there's no lock-in period." },
  { q: "How do I become a tutor on TutorNear?", a: "Click \"Apply to Teach\", complete your profile and verification, and you can start accepting students within 48 hours." },
  { q: "Do you offer both online and offline tutoring?", a: "Yes, you can filter tutors by online, in-person (home/center), or hybrid availability based on your preference." },
];

const STEPS = [
  { icon: <AiOutlineSearch className="w-5 h-5" />, title: "1. Search", desc: "Browse our curated list of expert tutors based on your subject, level, and location preferences." },
  { icon: <AiOutlineCalendar className="w-5 h-5" />, title: "2. Book", desc: "Check schedules, read reviews, and book a session that fits your busy lifestyle instantly." },
  { icon: <AiOutlineBook className="w-5 h-5" />, title: "3. Start Learning", desc: "Connect in-person or online and begin achieving your academic and personal learning goals." },
];

const FOOTER_COLUMNS = [
  { title: "STUDENTS", links: ["Find a Tutor", "Learning Resources", "Scholarship Program", "Pricing & Plans"] },
  { title: "TUTORS",   links: ["Apply to Teach", "Teaching Guide", "Tutor Dashboard", "Payout FAQ"] },
  { title: "SUPPORT",  links: ["Help Center", "Privacy Policy", "Terms of Service", "Contact Us"] },
];

/* ─── Sub-components ─────────────────────────────── */
function TutorCard({ t, index }: { t: DisplayTeacher; index: number }) {
  const [brokenPhotoUrl, setBrokenPhotoUrl] = useState<string | null>(null);
  const [brokenBannerUrl, setBrokenBannerUrl] = useState<string | null>(null);
  const photoUrl = t.photoUrl?.replace(/^http:\/\//i, "https://") ?? null;
  const bannerUrl = t.bannerUrl?.replace(/^http:\/\//i, "https://") ?? null;

  return (
    <div
      className="group h-full flex flex-col rounded-2xl overflow-hidden bg-white border border-gray-200/80 shadow-[0_3px_12px_rgba(21,33,61,0.04)] transition-all duration-200 hover:-translate-y-1 hover:shadow-lg animate-fade-in-up"
      style={{ animationDelay: `${Math.min(index, 7) * 70}ms` }}
    >
      <div
        className="relative h-24 shrink-0 bg-gradient-to-br from-[#FBE7E0] to-[#F6D6CB]"
      >
        {bannerUrl && brokenBannerUrl !== bannerUrl && (
          <img
            src={bannerUrl}
            alt=""
            aria-hidden="true"
            onError={() => setBrokenBannerUrl(bannerUrl)}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-[#15213D]/10 to-transparent" />
        <span
          className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-semibold"
          style={{ color: NAVY }}
          aria-label={`${t.totalLikes} likes`}
        >
          <BsHeartFill className="h-3 w-3 text-red-500" />
          {t.totalLikes.toLocaleString()}
        </span>
        <span className="absolute top-3 right-3 flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-white" style={{ color: NAVY }}>
          <BsStarFill className="w-3 h-3" style={{ color: "#F2B705" }} />
          {t.rating === null ? "New tutor" : t.rating.toFixed(1)}
        </span>
        <div
          className="absolute -bottom-7 left-5 flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-white text-sm font-bold text-[#15213D] shadow-md"
          style={{ backgroundColor: t.bg, color: t.color }}
        >
          {t.initials}
          {photoUrl && brokenPhotoUrl !== photoUrl && (
            <img
              src={photoUrl}
              alt={t.name}
              onError={() => setBrokenPhotoUrl(photoUrl)}
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col px-5 pb-4 pt-9">
        <h3 className="flex items-center gap-1.5 truncate text-sm font-bold" style={{ color: NAVY }}>
          <span className="truncate">{t.name}</span>
          {t.verified && <BsShieldCheck className="h-3.5 w-3.5 shrink-0 text-blue-500" title="Verified tutor" />}
        </h3>
        <p className="min-h-8 text-[11px] font-semibold uppercase tracking-wide mt-1 line-clamp-2" style={{ color: ORANGE }}>
          {t.expertise || "Tutor"}
        </p>
        <div className="mt-2.5 space-y-1.5 text-xs text-gray-600">
          <div className="flex items-start gap-2">
            <FaBriefcase className="mt-0.5 h-3 w-3 shrink-0 text-gray-400" aria-hidden="true" />
            <span>
              <span className="font-semibold text-gray-700">Experience:</span>{" "}
              {formatExperience(t.experienceYears)}
            </span>
          </div>
          <div className="flex items-start gap-2">
            <FaGraduationCap className="mt-0.5 h-3 w-3 shrink-0 text-gray-400" aria-hidden="true" />
            <span className="line-clamp-2">
              <span className="font-semibold text-gray-700">Education:</span>{" "}
              {t.qualifications.length > 0 ? t.qualifications.join(", ") : "Not specified"}
            </span>
          </div>
        </div>
        <p className="min-h-10 text-xs text-gray-500 mt-2.5 leading-relaxed line-clamp-2">
          {t.about || t.courses.join(", ") || "View this tutor's profile to learn more."}
        </p>
        <hr className="mt-3 mb-3 border-gray-100" />
        <Link
          href={`/teacher/${t.id}`}
          className="mt-auto block w-full rounded-lg bg-[#111b33] py-2 text-center text-xs font-semibold text-white transition-colors hover:bg-[#1d2d50]"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
}

function FaqItem({ q, a, isOpen, onClick }: { q: string; a: string; isOpen: boolean; onClick: () => void }) {
  return (
    <div className="border border-gray-100 rounded-xl bg-white overflow-hidden">
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <span className="text-sm font-semibold" style={{ color: NAVY }}>{q}</span>
        {isOpen ? <BsChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <BsChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
      </button>
      {isOpen && (
        <div className="px-5 pb-4 text-sm text-gray-500 leading-relaxed">{a}</div>
      )}
    </div>
  );
}

/* ─── Main Page ───────────────────────────────────── */
export default function HomeGuestPage() {
  const [subject, setSubject] = useState("");
  const [location, setLocation] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [teachers, setTeachers] = useState<DisplayTeacher[]>([]);
  const [teachersLoading, setTeachersLoading] = useState(true);
  const [teachersError, setTeachersError] = useState(false);
  const [teachersRetry, setTeachersRetry] = useState(0);
  const [posts, setPosts] = useState<StudentPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsError, setPostsError] = useState(false);
  const [postsRetry, setPostsRetry] = useState(0);
  const isLoggedIn = useSyncExternalStore(subscribeToAuthChanges, getAuthSnapshot, () => false);

  useEffect(() => {
    let cancelled = false;

    async function loadTeachers() {
      setTeachersLoading(true);
      setTeachersError(false);
      try {
        const directory = await mentorService.getAllProfiles({ page: 1, perPage: 8 });
        const loadedTeachers = directory
          .map(toDisplayTeacherFromDirectory)
          .filter((teacher): teacher is DisplayTeacher => teacher !== null)
          .sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1));
        if (!cancelled) setTeachers(loadedTeachers);
      } catch {
        if (!cancelled) setTeachersError(true);
      } finally {
        if (!cancelled) setTeachersLoading(false);
      }
    }

    void loadTeachers();
    return () => {
      cancelled = true;
    };
  }, [teachersRetry]);

  useEffect(() => {
    let cancelled = false;

    async function loadPosts() {
      setPostsLoading(true);
      setPostsError(false);
      try {
        const loadedPosts = await studentService.getPosts();
        const sortedPosts = [...loadedPosts].sort((a, b) => {
          const dateDifference = Date.parse(b.created_t) - Date.parse(a.created_t);
          return Number.isFinite(dateDifference) && dateDifference !== 0
            ? dateDifference
            : b.id - a.id;
        });
        if (!cancelled) setPosts(sortedPosts);
      } catch {
        if (!cancelled) setPostsError(true);
      } finally {
        if (!cancelled) setPostsLoading(false);
      }
    }

    void loadPosts();
    return () => {
      cancelled = true;
    };
  }, [postsRetry]);

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "Inter, sans-serif" }}>

      {/* ── Navbar ── */}
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm" style={{ background: NAVY }}>
              <svg className="w-4 h-4" fill="white" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
              </svg>
            </div>
            <span className="flex flex-col leading-tight">
              <span className="text-sm font-semibold">
                <span style={{ color: NAVY }}>Tutor</span>
                <span style={{ color: ORANGE }}>Near</span>
              </span>
              <span className="hidden sm:block text-[9px] font-medium uppercase tracking-[0.08em] text-gray-400">
                Verified tutors
              </span>
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <span className="cursor-pointer" style={{ color: ORANGE }}>Find Tutors</span>
            <span className="text-gray-600 hover:text-gray-900 cursor-pointer transition-colors">Become a Teacher</span>
            <span className="text-gray-600 hover:text-gray-900 cursor-pointer transition-colors">How it works</span>
          </div>
          <div className="flex items-center gap-5">
            {isLoggedIn ? (
              <>
                <Link
                  href="/profile"
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                  style={{ background: NAVY }}
                  title="My Profile"
                  aria-label="My Profile"
                >
                  S
                </Link>
                <button
                  onClick={() => AuthService.logout()}
                  className="px-3 py-2 rounded-xl text-xs font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 border border-gray-200 transition-all"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Login</Link>
                <Link href="/register" className="px-5 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90" style={{ background: ORANGE }}>
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="px-6 pt-12 pb-6 text-center" style={{ background: "#F7F7FA" }}>
        <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight animate-fade-in-up" style={{ color: NAVY }}>
          Unlock Your Potential with the
        </h1>
        <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-8 animate-fade-in-up" style={{ color: RED, animationDelay: "100ms" }}>
          Perfect Tutor
        </h1>

        <div className="bg-white rounded-full border border-gray-200 flex items-stretch max-w-2xl mx-auto shadow-sm overflow-hidden animate-fade-in-up" style={{ animationDelay: "180ms" }}>
          <div className="flex items-center gap-2 flex-1 px-5 py-3 border-r border-gray-100">
            <AiOutlineBook className="w-4 h-4 text-gray-400 shrink-0" />
            <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject (e.g. Physics)" className="bg-transparent outline-none text-sm text-gray-900 placeholder:text-gray-400 w-full" />
          </div>
          <div className="flex items-center gap-2 flex-1 px-5 py-3">
            <AiOutlineEnvironment className="w-4 h-4 text-gray-400 shrink-0" />
            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)}
              placeholder="Location or Online" className="bg-transparent outline-none text-sm text-gray-900 placeholder:text-gray-400 w-full" />
          </div>
          <button className="px-7 text-sm font-semibold text-white transition-opacity hover:opacity-90 shrink-0" style={{ background: ORANGE }}>
            Search
          </button>
        </div>
      </section>

      {/* ── Trending searches ── */}
      <section className="px-6 pb-8" style={{ background: "#F7F7FA" }}>
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-2.5 flex-wrap">
          <span className="text-xs font-semibold text-gray-400 mr-1">Trending:</span>
          {TRENDING_SEARCHES.map((s, index) => (
            <span
              key={s}
              className="text-xs font-medium px-3.5 py-1.5 rounded-full bg-white border border-gray-200 text-gray-600 cursor-pointer
                hover:border-[#C0392B] hover:text-[#C0392B] hover:-translate-y-0.5 transition-all animate-fade-in-up"
              style={{ animationDelay: `${Math.min(index, 7) * 45}ms` }}
            >
              {s}
            </span>
          ))}
        </div>
      </section>

      {/* ── Featured job posts ── */}
      <section aria-label="Featured job posts" className="bg-[#F7F7FA] px-5 py-5 sm:px-6">
        <div className="mx-auto max-w-[1400px]">
          {postsLoading ? (
            <div className="h-[220px] animate-pulse rounded-2xl bg-gray-200" />
          ) : postsError ? (
            <div role="alert" className="rounded-xl border border-red-100 bg-red-50 px-4 py-5 text-center text-sm text-red-700">
              <p>Couldn&apos;t load job posts.</p>
              <button
                onClick={() => setPostsRetry((count) => count + 1)}
                className="mt-2 font-semibold underline underline-offset-2"
              >
                Try again
              </button>
            </div>
          ) : posts.length > 0 ? (
            <div className="animate-fade-in-up">
              <JobPostSlider posts={posts} />
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-4 py-8 text-center text-sm text-gray-500">
              No job posts available right now.
            </div>
          )}
        </div>
      </section>

      {/* ── Top Rated Tutors (full grid) ── */}
      <section className="px-5 py-10 sm:px-6 sm:py-12" style={{ background: "#F7F8FD" }}>
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-end justify-between mb-6 flex-wrap gap-2">
            <div className="animate-fade-in-up">
              <h2 className="text-2xl font-bold" style={{ color: NAVY }}>Top Rated Tutors</h2>
              <p className="text-sm text-gray-500 mt-1">Learn from the best verified teachers in the field</p>
            </div>
            <Link href="/student" className="text-sm font-semibold hover:underline animate-fade-in-up" style={{ color: RED, animationDelay: "100ms" }}>
              View all tutors →
            </Link>
          </div>
          <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {teachersLoading ? (
              Array.from({ length: 3 }, (_, index) => (
                <div key={index} className="h-64 rounded-2xl bg-white animate-pulse" />
              ))
            ) : teachersError ? (
              <div role="alert" className="col-span-full rounded-2xl bg-white p-6 text-center text-sm text-red-600">
                <p>We couldn&apos;t load tutors right now.</p>
                <button
                  onClick={() => setTeachersRetry((count) => count + 1)}
                  className="mt-2 font-semibold underline"
                >
                  Try again
                </button>
              </div>
            ) : teachers.length > 0 ? (
              teachers.map((teacher, index) => <TutorCard key={teacher.id} t={teacher} index={index} />)
            ) : (
              <p className="col-span-full rounded-2xl bg-white p-6 text-center text-sm text-gray-500">
                No tutor profiles are available yet.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ── Become a Tutor banner ── */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="rounded-3xl px-8 sm:px-12 py-10 flex flex-col lg:flex-row items-center justify-between gap-8 transition-transform duration-300 hover:-translate-y-1" style={{ background: NAVY }}>
          <div className="text-center lg:text-left">
            <h3 className="text-2xl font-bold text-white">Share your knowledge. Earn on your schedule.</h3>
            <p className="text-sm mt-2 max-w-md mx-auto lg:mx-0" style={{ color: "#9FA9C4" }}>
              Join 8,200+ educators already teaching on TutorNear. Set your own hours, your own rates, and get matched with students near you.
            </p>
            <div className="flex items-center justify-center lg:justify-start gap-6 mt-5 flex-wrap">
              <span className="flex items-center gap-1.5 text-sm text-white"><FaRupeeSign className="w-3.5 h-3.5" style={{ color: "#F2B705" }} />₹25,000+ avg. monthly earning</span>
              <span className="flex items-center gap-1.5 text-sm text-white"><FaClock className="w-3.5 h-3.5" style={{ color: "#F2B705" }} />Flexible hours</span>
              <span className="flex items-center gap-1.5 text-sm text-white"><FaUserCheck className="w-3.5 h-3.5" style={{ color: "#F2B705" }} />Free to join</span>
            </div>
          </div>
          <button className="px-6 py-3 rounded-lg text-sm font-semibold shrink-0 transition-all hover:-translate-y-0.5 hover:shadow-lg" style={{ background: RED, color: "white" }}>
            Apply to Teach
          </button>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-center" style={{ color: NAVY }}>What Our Community Says</h2>
        <p className="text-sm text-gray-500 text-center mt-2 mb-10">Real stories from students, parents, and tutors.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, index) => (
            <div
              key={t.name}
              className="bg-white border border-gray-100 rounded-2xl p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-md animate-fade-in-up"
              style={{ animationDelay: `${index * 90}ms` }}
            >
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <BsStarFill key={i} className="w-3.5 h-3.5" style={{ color: i < Math.round(t.rating) ? "#F2B705" : "#E5E7EB" }} />
                ))}
              </div>
              <p className="text-sm text-gray-600 leading-relaxed mb-5">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "#FBE7E0", color: RED }}>
                  {t.initials}
                </div>
                <div>
                  <div className="text-sm font-semibold" style={{ color: NAVY }}>{t.name}</div>
                  <div className="text-xs text-gray-400">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Start Your Learning Journey ── */}
      <section className="max-w-5xl mx-auto px-6 py-16 text-center" style={{ background: "#F7F7FA" }}>
        <h2 className="text-2xl font-bold" style={{ color: NAVY }}>Start Your Learning Journey</h2>
        <p className="text-sm text-gray-500 mt-2 mb-14">Three simple steps to connect with your perfect academic match.</p>
        <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-10">
          <div className="hidden sm:block absolute top-7 left-[16%] right-[16%] h-px border-t border-dashed border-gray-300" />
          {STEPS.map((s, index) => (
            <div key={s.title} className="relative z-10 flex flex-col items-center animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
              <div className="w-14 h-14 rounded-full bg-white border-2 flex items-center justify-center mb-4 transition-transform duration-300 hover:scale-110" style={{ borderColor: RED, color: RED }}>
                {s.icon}
              </div>
              <h3 className="text-base font-bold mb-1.5" style={{ color: NAVY }}>{s.title}</h3>
              <p className="text-sm text-gray-500 max-w-[220px] leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQs ── */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-center" style={{ color: NAVY }}>Frequently Asked Questions</h2>
        <p className="text-sm text-gray-500 text-center mt-2 mb-10">Everything you need to know before getting started.</p>
        <div className="flex flex-col gap-3">
          {FAQS.map((f, i) => (
            <FaqItem key={f.q} q={f.q} a={f.a} isOpen={openFaq === i} onClick={() => setOpenFaq(openFaq === i ? null : i)} />
          ))}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="rounded-3xl px-8 sm:px-12 py-10 flex flex-col sm:flex-row items-center justify-between gap-6" style={{ background: RED }}>
          <div className="text-center sm:text-left">
            <h3 className="text-2xl font-bold text-white">Ready to reach your goals?</h3>
            <p className="text-white/85 text-sm mt-2 max-w-md">Join 50,000+ students already learning with TutorNear. Start your free trial session today.</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-white" style={{ color: RED }}>Find a Tutor</button>
            <button className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white border border-white/50 hover:bg-white/10 transition-colors">How it Works</button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="px-6 pt-14 pb-8" style={{ background: NAVY }}>
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <h4 className="text-lg font-bold text-white mb-3">TutorNear</h4>
            <p className="text-sm leading-relaxed" style={{ color: "#9FA9C4" }}>
              Connecting ambitious students with world-class educators since 2024. Your future starts with the right guidance.
            </p>
            <div className="flex items-center gap-3 mt-5">
              {[FaFacebookF, FaTwitter, FaLinkedinIn].map((Icon, i) => (
                <span key={i} className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer text-xs transition-colors" style={{ background: "rgba(255,255,255,0.08)", color: "#C7CEE3" }}>
                  <Icon />
                </span>
              ))}
            </div>
          </div>
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <h5 className="text-xs font-semibold tracking-wider mb-4" style={{ color: "#7C88AC" }}>{col.title}</h5>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l} className="text-sm cursor-pointer hover:text-white transition-colors" style={{ color: "#9FA9C4" }}>{l}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <hr className="my-8 border-white/10 max-w-6xl mx-auto" />
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-2 text-xs" style={{ color: "#7C88AC" }}>
          <span>© {new Date().getFullYear()} TutorNear. All rights reserved.</span>
          <span className="flex gap-5">
            <span className="cursor-pointer hover:text-white transition-colors">Cookie Policy</span>
            <span className="cursor-pointer hover:text-white transition-colors">Accessibility</span>
          </span>
        </div>
      </footer>
    </div>
  );
}