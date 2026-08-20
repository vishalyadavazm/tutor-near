"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AiOutlineEnvironment,
  AiOutlineGlobal,
  AiOutlineMessage,
  AiOutlineShareAlt,
  AiOutlineSearch,
  AiOutlineClose,
  AiOutlineBell,
} from "react-icons/ai";
import { BsShieldCheck, BsHeart, BsHeartFill, BsStarFill, BsStar } from "react-icons/bs";
import { FiBookOpen } from "react-icons/fi";
import { MdOutlineSchool } from "react-icons/md";
import AuthService from "@/services/auth.service";
import ContactModal from "@/components/shared/ContactModal";
import mentorService, { MentorDirectoryEntry } from "@/services/mentor.service";
import { DisplayTeacher, formatExperience, toDisplayTeacherFromDirectory } from "@/utils/teacherDisplay";

/* ── Brand ──────────────────────────────────────── */
const NAVY = "#15213D";
const ORANGE = "#E8621A";

function StarRating({ rating, reviewCount }: { rating: number | null; reviewCount: number }) {
  if (rating === null) {
    return <span className="text-sm text-gray-400">No reviews yet</span>;
  }
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) =>
        i <= Math.round(rating) ? (
          <BsStarFill key={i} className="w-3.5 h-3.5 text-amber-400" />
        ) : (
          <BsStar key={i} className="w-3.5 h-3.5 text-gray-200" />
        ),
      )}
      <span className="text-sm font-semibold text-gray-800 ml-1">{rating.toFixed(1)}</span>
      <span className="text-xs text-gray-400">({reviewCount} reviews)</span>
    </div>
  );
}

function RateWidget({
  isRated,
  submitting,
  error,
  onSubmit,
}: {
  isRated: boolean;
  submitting: boolean;
  error: string | null;
  onSubmit: (value: number) => void;
}) {
  const [hoverValue, setHoverValue] = useState(0);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-gray-500">{isRated ? "Update your rating:" : "Rate this tutor:"}</span>
      <div className="flex items-center gap-0.5" onMouseLeave={() => setHoverValue(0)}>
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            disabled={submitting}
            onMouseEnter={() => setHoverValue(i)}
            onClick={() => onSubmit(i)}
            className="disabled:opacity-50"
          >
            {i <= hoverValue ? (
              <BsStarFill className="w-4 h-4 text-amber-400" />
            ) : (
              <BsStar className="w-4 h-4 text-gray-300 hover:text-amber-300" />
            )}
          </button>
        ))}
      </div>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}

/* ── "More profiles" sidebar card ─────────────── */
function MoreProfilesSidebar({
  currentId,
  teachers,
}: {
  currentId: number;
  teachers: DisplayTeacher[];
}) {
  const suggestions = teachers.filter((t) => t.id !== currentId).slice(0, 5);

  if (suggestions.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-100">
        <h3 className="text-sm font-bold text-gray-800">More profiles for you</h3>
        <p className="text-xs text-gray-400 mt-0.5">Tutors you might like</p>
      </div>

      {/* List */}
      <div className="divide-y divide-gray-50">
        {suggestions.map((t) => (
          <div key={t.id} className="px-4 py-3.5 hover:bg-gray-50 transition-colors group">
            <div className="flex items-start gap-3">
              {/* Avatar */}
              {t.photoUrl ? (
                <img
                  src={t.photoUrl}
                  alt={t.name}
                  className="w-11 h-11 rounded-xl object-cover shrink-0"
                />
              ) : (
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
                  style={{ background: t.bg, color: t.color }}
                >
                  {t.initials}
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="text-sm font-semibold text-gray-900 truncate">{t.name}</span>
                  {t.verified && (
                    <BsShieldCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-gray-400 truncate mt-0.5">
                  {t.expertise || "Tutor"} · {t.city || "—"}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[11px] text-gray-400">{formatExperience(t.experienceYears)}</span>
                  <Link
                    href={`/teacher/${t.id}`}
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-all"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-100 text-center">
        <Link
          href="/student"
          className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
        >
          Show all tutors →
        </Link>
      </div>
    </div>
  );
}

/* ─── Main component ─────────────────────────────── */
export default function TeacherPublicProfile({ teacherId }: { teacherId: number }) {
  const router = useRouter();

  const [profiles, setProfiles] = useState<MentorDirectoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [searchText, setSearchText] = useState("");
  const [contactType, setContactType] = useState<"inquiry" | "demo" | "message">("inquiry");
  const [showContact, setShowContact] = useState(false);

  const [liking, setLiking] = useState(false);
  const [likeError, setLikeError] = useState<string | null>(null);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [rateError, setRateError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const profilesRes = await mentorService.getAllProfiles();
        if (!cancelled) setProfiles(profilesRes);
      } catch {
        if (!cancelled) setLoadError("Couldn't load this profile. Please refresh the page.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const teachers = useMemo(
    () => profiles.map(toDisplayTeacherFromDirectory).filter((t): t is DisplayTeacher => t !== null),
    [profiles],
  );
  const teacher = teachers.find((t) => t.id === teacherId);

  function openContact(type: "inquiry" | "demo" | "message") {
    setContactType(type);
    setShowContact(true);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push("/student");
  }

  async function refreshProfiles() {
    const refreshed = await mentorService.getAllProfiles();
    setProfiles(refreshed);
  }

  async function handleToggleLike() {
    setLiking(true);
    setLikeError(null);
    try {
      await mentorService.toggleLike(teacherId);
      await refreshProfiles();
    } catch (err) {
      setLikeError(err instanceof Error ? err.message : "Couldn't update like.");
    } finally {
      setLiking(false);
    }
  }

  async function handleRate(value: number) {
    setSubmittingRating(true);
    setRateError(null);
    try {
      await mentorService.rateMentor(teacherId, value);
      await refreshProfiles();
    } catch (err) {
      setRateError(err instanceof Error ? err.message : "Couldn't submit rating.");
    } finally {
      setSubmittingRating(false);
    }
  }

  const Topbar = (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto px-5 h-16 flex items-center gap-4">
        <Link href="/student" className="flex items-center gap-2.5 shrink-0">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: NAVY }}
          >
            <svg className="w-4 h-4" fill="white" viewBox="0 0 24 24">
              <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
            </svg>
          </div>
          <span className="text-base font-semibold hidden sm:block" style={{ color: NAVY }}>
            TutorNear
          </span>
        </Link>

        <form
          onSubmit={handleSearch}
          className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 max-w-xl hover:border-orange-300 focus-within:border-orange-400 transition-colors"
        >
          <AiOutlineSearch className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search by subject, teacher name, or skill…"
            className="bg-transparent outline-none text-sm text-gray-900 placeholder:text-gray-400 w-full"
          />
          {searchText && (
            <button type="button" onClick={() => setSearchText("")} className="text-gray-400 hover:text-gray-600">
              <AiOutlineClose className="w-3.5 h-3.5" />
            </button>
          )}
        </form>

        <div className="flex items-center gap-2 ml-auto">
          <button className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
            <AiOutlineBell className="w-4 h-4" />
          </button>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
            style={{ background: NAVY }}
          >
            S
          </div>
          <button
            onClick={() => AuthService.logout()}
            className="hidden sm:flex px-3 py-2 rounded-xl text-xs font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 border border-gray-200 transition-all"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 font-sans">
        {Topbar}
        <div className="max-w-[1400px] mx-auto px-5 py-16 text-center text-sm text-gray-400">
          Loading profile…
        </div>
      </div>
    );
  }

  if (loadError || !teacher) {
    return (
      <div className="min-h-screen bg-gray-100 font-sans">
        {Topbar}
        <div className="max-w-[1400px] mx-auto px-5 py-16 text-center">
          <div className="text-4xl mb-3">🔍</div>
          <div className="text-base font-semibold text-gray-700 mb-1">
            {loadError ?? "This tutor profile couldn't be found"}
          </div>
          <Link
            href="/student"
            className="inline-block mt-4 px-5 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ background: ORANGE }}
          >
            Browse tutors
          </Link>
        </div>
      </div>
    );
  }

  const statsBar = [
    { icon: "🎓", label: "Experience", value: formatExperience(teacher.experienceYears) },
    { icon: "📚", label: "Courses", value: teacher.courses.length > 0 ? teacher.courses.join(", ") : "Not specified" },
    { icon: "🏫", label: "Qualification", value: teacher.qualifications.length > 0 ? teacher.qualifications.join(", ") : "Not specified" },
    { icon: "🌐", label: "Location", value: [teacher.city, teacher.state].filter(Boolean).join(", ") || "Not specified" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {Topbar}

      {/* ── Body: two-column layout ── */}
      <div className="max-w-[1400px] mx-auto px-5 py-5">
        <div className="flex gap-5 items-start">

          {/* ── LEFT: main profile content ── */}
          <div className="flex-1 min-w-0 flex flex-col gap-4">

            {/* Cover + Profile card */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">

              {/* Cover banner */}
              <div
                className="relative h-32 overflow-hidden"
                style={{ background: "linear-gradient(135deg, #0A1628 0%, #1A2F5E 55%, #0D1F45 100%)" }}
              >
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute rounded-full opacity-10"
                    style={{
                      width: `${(i % 3) * 3 + 4}px`,
                      height: `${(i % 3) * 3 + 4}px`,
                      left: `${(i * 13) % 100}%`,
                      top: `${(i * 17) % 100}%`,
                      background: i % 3 === 0 ? "#F59E0B" : "#60A5FA",
                    }}
                  />
                ))}
              </div>

              {/* Profile info */}
              <div className="px-6 pb-6">
                {/* Avatar + action row */}
                <div className="flex items-end justify-between -mt-14 mb-4">
                  <div
                    className="rounded-full shrink-0 shadow-xl"
                    style={{
                      background: "linear-gradient(135deg, #F97316, #EC4899, #8B5CF6)",
                      padding: "3px",
                    }}
                  >
                    <div className="rounded-full bg-white" style={{ padding: "3px" }}>
                      {teacher.photoUrl ? (
                        <img
                          src={teacher.photoUrl}
                          alt={teacher.name}
                          className="w-28 h-28 rounded-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-28 h-28 rounded-full flex items-center justify-center text-2xl font-black"
                          style={{ background: teacher.bg, color: teacher.color }}
                        >
                          {teacher.initials}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 mt-14">
                    <button
                      onClick={() => openContact("message")}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all"
                    >
                      <AiOutlineMessage className="w-4 h-4" />
                      Message
                    </button>
                    <button
                      onClick={handleToggleLike}
                      disabled={liking}
                      className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center transition-all hover:border-red-200 disabled:opacity-50"
                    >
                      {teacher.isLiked
                        ? <BsHeartFill className="w-4 h-4 text-red-500" />
                        : <BsHeart className="w-4 h-4 text-gray-400" />}
                    </button>
                    <button className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-all">
                      <AiOutlineShareAlt className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Name + info + summary */}
                <div className="flex gap-6 flex-col lg:flex-row">

                  {/* Left: name, location */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-xl font-bold text-gray-900">{teacher.name}</h1>
                      {teacher.verified && (
                        <BsShieldCheck className="w-5 h-5 text-blue-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{teacher.expertise || "Tutor"}</p>
                    <div className="mt-2">
                      <StarRating rating={teacher.rating} reviewCount={teacher.reviewCount} />
                    </div>
                    <div className="mt-2">
                      <RateWidget
                        isRated={teacher.isRated}
                        submitting={submittingRating}
                        error={rateError}
                        onSubmit={handleRate}
                      />
                    </div>
                    {likeError && <p className="text-xs text-red-500 mt-1">{likeError}</p>}

                    {/* Location + experience */}
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 flex-wrap">
                      <span className="flex items-center gap-1.5">
                        <AiOutlineEnvironment className="w-4 h-4 text-gray-400" />
                        {[teacher.city, teacher.state, teacher.country].filter(Boolean).join(", ") || "Location not specified"}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <AiOutlineGlobal className="w-4 h-4 text-gray-400" />
                        {formatExperience(teacher.experienceYears)}
                      </span>
                    </div>

                    {/* Courses */}
                    {teacher.courses.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {teacher.courses.map((c) => (
                          <span key={c} className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                            {c}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right: About + contact */}
                  <div
                    className="lg:w-64 shrink-0 rounded-xl border border-blue-100 p-4"
                    style={{ background: "#F0F7FF" }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                        <FiBookOpen className="w-3.5 h-3.5 text-blue-600" />
                      </div>
                      <span className="text-xs font-semibold text-blue-800">About</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed line-clamp-6">
                      {teacher.about || "This tutor hasn't added a bio yet."}
                    </p>
                    <div className="flex gap-2 mt-3 pt-3 border-t border-blue-100">
                      <button
                        onClick={() => openContact("inquiry")}
                        className="flex-1 py-1.5 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90"
                        style={{ background: ORANGE }}
                      >
                        Send Inquiry
                      </button>
                      <button
                        onClick={() => openContact("demo")}
                        className="flex-1 py-1.5 rounded-lg text-xs font-medium border border-blue-200 text-blue-700 hover:bg-blue-50 transition-all"
                      >
                        Book Demo
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Qualifications */}
            {teacher.qualifications.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm px-6 py-5">
                <div className="flex items-center gap-2 mb-3">
                  <MdOutlineSchool className="w-4 h-4 text-gray-500" />
                  <h2 className="text-sm font-semibold" style={{ color: NAVY }}>Qualifications</h2>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {teacher.qualifications.map((q) => (
                    <span key={q} className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                      {q}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Stats bar */}
            <div className="bg-white rounded-2xl shadow-sm">
              <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-100">
                {statsBar.map((s, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-3 px-4 py-4 ${i >= 2 ? "border-t border-gray-100 sm:border-t-0" : ""}`}
                  >
                    <span className="text-xl shrink-0">{s.icon}</span>
                    <div className="min-w-0">
                      <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">{s.label}</div>
                      <div className="text-sm font-bold text-gray-900 line-clamp-2">{s.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* ── RIGHT: sticky sidebar ── */}
          <div className="hidden xl:block w-72 shrink-0">
            <div className="sticky top-20 flex flex-col gap-4">
              <MoreProfilesSidebar currentId={teacher.id} teachers={teachers} />

              {/* Quick links card */}
              <div className="bg-white rounded-2xl shadow-sm p-4">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Quick Links</h3>
                <div className="flex flex-col gap-1">
                  {[
                    { label: "Browse all tutors", href: "/student", emoji: "🔍" },
                    { label: "Online tutors", href: "/student", emoji: "💻" },
                  ].map((l) => (
                    <Link
                      key={l.label}
                      href={l.href}
                      className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-all"
                    >
                      <span>{l.emoji}</span>
                      {l.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Floating CTA (mobile) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 flex gap-3 xl:hidden z-40">
        <button
          onClick={() => openContact("message")}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700"
        >
          Message
        </button>
        <button
          onClick={() => openContact("inquiry")}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ background: ORANGE }}
        >
          Send Inquiry
        </button>
      </div>
      <div className="h-16 xl:hidden" />

      {/* Contact modal */}
      {showContact && (
        <ContactModal
          teacher={{
            id: teacher.id,
            initials: teacher.initials,
            name: teacher.name,
            courses: teacher.courses,
            verified: teacher.verified,
            bg: teacher.bg,
            color: teacher.color,
            tagline: [teacher.expertise, teacher.city].filter(Boolean).join(" · "),
          }}
          defaultType={contactType}
          onClose={() => setShowContact(false)}
        />
      )}
    </div>
  );
}
