"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  AiOutlineSearch,
  AiOutlineEnvironment,
  AiOutlineBell,
  AiOutlineClose,
  AiOutlineFilter,
} from "react-icons/ai";
import {
  BsHeart,
  BsHeartFill,
  BsShieldCheck,
  BsFunnel,
  BsStarFill,
  BsStar,
} from "react-icons/bs";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import AuthService from "@/services/auth.service";
import ContactModal from "@/components/shared/ContactModal";
import mentorService, { CourseOption, MentorDirectoryEntry } from "@/services/mentor.service";
import { DisplayTeacher, formatExperience, toDisplayTeacherFromDirectory } from "@/utils/teacherDisplay";

const NAVY = "#15213D";
const ORANGE = "#E8621A";

const EXP_BUCKETS = [
  { label: "0–2 years", min: 0, max: 2 },
  { label: "3–5 years", min: 3, max: 5 },
  { label: "6–10 years", min: 6, max: 10 },
  { label: "10+ years", min: 11, max: 99 },
];

/* ─── Sub-components ────────────────────────────── */

function ModeBadge({ verified }: { verified: boolean }) {
  if (!verified) return null;
  return (
    <span className="flex items-center gap-1 text-xs font-medium text-green-700">
      <BsShieldCheck className="w-3.5 h-3.5 text-green-500" /> Verified
    </span>
  );
}

function FilterSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 py-4">
      <button
        className="flex items-center justify-between w-full text-sm font-semibold text-gray-800 mb-3"
        onClick={() => setOpen((o) => !o)}
      >
        {title}
        {open ? <FiChevronUp className="w-4 h-4 text-gray-400" /> : <FiChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {open && children}
    </div>
  );
}

function CheckboxFilter({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      className="flex items-center gap-2.5 cursor-pointer py-1 group"
      onClick={onChange}
    >
      <div
        className="w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all"
        style={checked ? { background: ORANGE, borderColor: ORANGE } : { borderColor: "#D1D5DB" }}
      >
        {checked && (
          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 12 12">
            <path d="M10 3L5 8.5 2 5.5" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span className="text-sm text-gray-600 group-hover:text-gray-900">{label}</span>
    </label>
  );
}

function StarRating({ rating, reviewCount }: { rating: number | null; reviewCount: number }) {
  if (rating === null) {
    return <span className="text-xs text-gray-400">No reviews yet</span>;
  }
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) =>
        i <= Math.round(rating) ? (
          <BsStarFill key={i} className="w-3 h-3 text-amber-400" />
        ) : (
          <BsStar key={i} className="w-3 h-3 text-gray-200" />
        ),
      )}
      <span className="text-xs font-semibold text-gray-700 ml-0.5">{rating.toFixed(1)}</span>
      <span className="text-xs text-gray-400">({reviewCount})</span>
    </div>
  );
}

function TeacherCard({
  t,
  liking,
  onToggleLike,
  onContact,
}: {
  t: DisplayTeacher;
  liking: boolean;
  onToggleLike: () => void;
  onContact: () => void;
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 hover:border-orange-200 hover:shadow-md transition-all duration-200">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        {t.photoUrl ? (
          <img
            src={t.photoUrl}
            alt={t.name}
            className="w-14 h-14 rounded-2xl object-cover shrink-0"
          />
        ) : (
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold shrink-0"
            style={{ background: t.bg, color: t.color }}
          >
            {t.initials}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Row 1: Name + save */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-semibold text-gray-900">{t.name}</h3>
                <ModeBadge verified={t.verified} />
              </div>
              <div className="text-sm text-gray-500 mt-0.5 truncate">
                {t.expertise || "Tutor"} &nbsp;·&nbsp; {formatExperience(t.experienceYears)}
              </div>
            </div>

            <button
              onClick={onToggleLike}
              disabled={liking}
              className="p-2 rounded-xl border border-gray-200 text-gray-400 hover:border-red-200 hover:text-red-500 transition-all shrink-0 disabled:opacity-50"
            >
              {t.isLiked ? (
                <BsHeartFill className="w-4 h-4 text-red-500" />
              ) : (
                <BsHeart className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Row 2: Rating + location */}
          <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-2">
            <StarRating rating={t.rating} reviewCount={t.reviewCount} />
            <span className="text-gray-200 hidden sm:block">|</span>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <AiOutlineEnvironment className="w-3.5 h-3.5" />
              {[t.city, t.state, t.country].filter(Boolean).join(", ") || "Location not specified"}
            </div>
          </div>

          {/* Row 3: About */}
          {t.about && (
            <p className="text-sm text-gray-500 mt-2.5 line-clamp-2 leading-relaxed">{t.about}</p>
          )}

          {/* Row 4: Courses */}
          {t.courses.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {t.courses.map((c) => (
                <span
                  key={c}
                  className="text-xs bg-gray-50 text-gray-500 px-2.5 py-1 rounded-full border border-gray-100"
                >
                  {c}
                </span>
              ))}
            </div>
          )}

          {/* Row 5: CTAs */}
          <div className="flex items-center justify-end mt-3.5 pt-3.5 border-t border-gray-100 gap-2">
            <Link
              href={`/teacher/${t.id}`}
              className="px-4 py-1.5 text-sm font-medium rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all"
            >
              View Profile
            </Link>
            <button
              onClick={onContact}
              className="px-4 py-1.5 text-sm font-semibold rounded-xl text-white transition-all hover:opacity-90"
              style={{ background: ORANGE }}
            >
              Contact
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main component ─────────────────────────────── */
export default function StudentHome() {
  const [profiles, setProfiles] = useState<MentorDirectoryEntry[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [searchText, setSearchText] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [courseFilters, setCourseFilters] = useState<string[]>([]);
  const [expBucket, setExpBucket] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState("relevant");
  const [likingId, setLikingId] = useState<number | null>(null);
  const [likeError, setLikeError] = useState<string | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [contactTeacher, setContactTeacher] = useState<DisplayTeacher | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [profilesRes, coursesRes] = await Promise.all([
          mentorService.getAllProfiles(),
          mentorService.getCourses(),
        ]);
        if (cancelled) return;
        setProfiles(profilesRes);
        setCourses(coursesRes);
      } catch {
        if (!cancelled) setLoadError("Couldn't load tutors. Please refresh the page.");
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

  const cityOptions = useMemo(
    () => Array.from(new Set(teachers.map((t) => t.city).filter(Boolean))).sort(),
    [teachers],
  );

  function toggleCourse(c: string) {
    setCourseFilters((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c],
    );
  }
  async function handleToggleLike(id: number) {
    setLikingId(id);
    setLikeError(null);
    try {
      await mentorService.toggleLike(id);
      const refreshed = await mentorService.getAllProfiles();
      setProfiles(refreshed);
    } catch {
      setLikeError("Couldn't update like. Please try again.");
    } finally {
      setLikingId(null);
    }
  }
  function clearFilters() {
    setCourseFilters([]);
    setExpBucket("");
    setCityFilter("all");
    setVerifiedOnly(false);
  }

  const activeFilterCount =
    courseFilters.length +
    (expBucket ? 1 : 0) +
    (cityFilter !== "all" ? 1 : 0) +
    (verifiedOnly ? 1 : 0);

  const results = useMemo(() => {
    const bucket = EXP_BUCKETS.find((b) => b.label === expBucket);
    let list = teachers.filter((t) => {
      if (
        searchText &&
        !t.name.toLowerCase().includes(searchText.toLowerCase()) &&
        !t.expertise.toLowerCase().includes(searchText.toLowerCase()) &&
        !t.about.toLowerCase().includes(searchText.toLowerCase()) &&
        !t.courses.some((c) => c.toLowerCase().includes(searchText.toLowerCase()))
      )
        return false;
      if (cityFilter !== "all" && t.city !== cityFilter) return false;
      if (courseFilters.length > 0 && !t.courses.some((c) => courseFilters.includes(c)))
        return false;
      if (bucket) {
        const years = t.experienceYears ?? -1;
        if (years < bucket.min || years > bucket.max) return false;
      }
      if (verifiedOnly && !t.verified) return false;
      return true;
    });

    switch (sortBy) {
      case "rating":
        list = [...list].sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1));
        break;
      case "exp":
        list = [...list].sort((a, b) => (b.experienceYears ?? 0) - (a.experienceYears ?? 0));
        break;
      case "name":
        list = [...list].sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }
    return list;
  }, [teachers, searchText, cityFilter, courseFilters, expBucket, verifiedOnly, sortBy]);

  const filterPanel = (
    <div className="flex flex-col">
      {/* Filter header */}
      <div className="flex items-center justify-between mb-1 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <BsFunnel className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-semibold text-gray-800">Filters</span>
          {activeFilterCount > 0 && (
            <span
              className="text-xs font-bold px-1.5 py-0.5 rounded-full text-white"
              style={{ background: ORANGE }}
            >
              {activeFilterCount}
            </span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="text-xs font-medium hover:underline"
            style={{ color: ORANGE }}
          >
            Clear all
          </button>
        )}
      </div>

      {/* Course */}
      <FilterSection title="Courses">
        <div className="flex flex-col">
          {courses.length === 0 && (
            <p className="text-xs text-gray-400">No courses available</p>
          )}
          {courses.map((c) => (
            <CheckboxFilter
              key={c.id}
              label={c.name}
              checked={courseFilters.includes(c.name)}
              onChange={() => toggleCourse(c.name)}
            />
          ))}
        </div>
      </FilterSection>

      {/* City */}
      <FilterSection title="City">
        <select
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none bg-white"
        >
          <option value="all">All cities</option>
          {cityOptions.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </FilterSection>

      {/* Experience */}
      <FilterSection title="Experience">
        <div className="flex flex-col gap-1">
          {EXP_BUCKETS.map((b) => (
            <label
              key={b.label}
              className="flex items-center gap-2.5 cursor-pointer py-1"
              onClick={() => setExpBucket(expBucket === b.label ? "" : b.label)}
            >
              <div
                className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0"
                style={
                  expBucket === b.label
                    ? { borderColor: ORANGE }
                    : { borderColor: "#D1D5DB" }
                }
              >
                {expBucket === b.label && (
                  <div className="w-2 h-2 rounded-full" style={{ background: ORANGE }} />
                )}
              </div>
              <span className="text-sm text-gray-600">{b.label}</span>
            </label>
          ))}
          {expBucket && (
            <button
              onClick={() => setExpBucket("")}
              className="text-xs mt-1 text-left hover:underline"
              style={{ color: ORANGE }}
            >
              Clear
            </button>
          )}
        </div>
      </FilterSection>

      {/* Verified */}
      <FilterSection title="Verification" defaultOpen={false}>
        <CheckboxFilter
          label="Verified tutors only"
          checked={verifiedOnly}
          onChange={() => setVerifiedOnly((v) => !v)}
        />
      </FilterSection>
    </div>
  );

  const ct = contactTeacher;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      {/* ── Topbar ── */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-5 h-16 flex items-center gap-4">
          {/* Logo */}
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

          {/* Inline search */}
          <div className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 max-w-xl hover:border-orange-300 focus-within:border-orange-400 transition-colors">
            <AiOutlineSearch className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search by name, expertise, or course…"
              className="bg-transparent outline-none text-sm text-gray-900 placeholder:text-gray-400 w-full"
            />
            {searchText && (
              <button onClick={() => setSearchText("")} className="text-gray-400 hover:text-gray-600">
                <AiOutlineClose className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* City */}
          <div className="hidden md:flex items-center gap-1.5 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 bg-white hover:border-orange-300 transition-colors">
            <AiOutlineEnvironment className="w-4 h-4 text-gray-400 shrink-0" />
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="bg-transparent outline-none cursor-pointer"
            >
              <option value="all">All cities</option>
              {cityOptions.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2 ml-auto">
            <button className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
              <AiOutlineBell className="w-4.5 h-4.5" />
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

      {/* ── Hero search bar ── */}
      <div className="border-b border-gray-100 bg-white">
        <div className="max-w-[1400px] mx-auto px-5 py-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-lg font-bold" style={{ color: NAVY }}>
                Find Your Perfect Tutor
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {results.length} teachers available
                {cityFilter !== "all" ? ` in ${cityFilter}` : ""}
                {courseFilters.length > 0 ? ` · ${courseFilters.join(", ")}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Mobile filter button */}
              <button
                onClick={() => setMobileFiltersOpen((o) => !o)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 lg:hidden transition-all"
              >
                <AiOutlineFilter className="w-4 h-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span
                    className="w-4 h-4 text-[10px] font-bold rounded-full text-white flex items-center justify-center"
                    style={{ background: ORANGE }}
                  >
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 hidden sm:block">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none bg-white hover:border-orange-300 transition-colors cursor-pointer"
                >
                  <option value="relevant">Most Relevant</option>
                  <option value="rating">Highest Rated</option>
                  <option value="exp">Most Experienced</option>
                  <option value="name">Name (A–Z)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-[1400px] mx-auto px-5 py-6 flex gap-6 items-start">

        {/* ── Filter sidebar (desktop) ── */}
        <aside className="hidden lg:block w-60 shrink-0 sticky top-24 self-start bg-white border border-gray-100 rounded-2xl p-4">
          {filterPanel}
        </aside>

        {/* ── Mobile filter drawer ── */}
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setMobileFiltersOpen(false)}
            />
            <div className="absolute right-0 top-0 bottom-0 w-72 bg-white overflow-y-auto p-5 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-base font-semibold" style={{ color: NAVY }}>Filters</span>
                <button onClick={() => setMobileFiltersOpen(false)}>
                  <AiOutlineClose className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              {filterPanel}
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="mt-4 w-full py-3 rounded-xl text-sm font-semibold text-white"
                style={{ background: ORANGE }}
              >
                Show {results.length} results
              </button>
            </div>
          </div>
        )}

        {/* ── Teacher listing ── */}
        <div className="flex-1 min-w-0 flex flex-col gap-3">
          {likeError && (
            <div className="px-4 py-2.5 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">
              {likeError}
            </div>
          )}
          {loading ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center text-sm text-gray-400">
              Loading tutors…
            </div>
          ) : loadError ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center text-sm text-red-500">
              {loadError}
            </div>
          ) : results.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center">
              <div className="text-4xl mb-3">🔍</div>
              <div className="text-base font-semibold text-gray-700 mb-1">No tutors found</div>
              <div className="text-sm text-gray-400">
                Try adjusting your filters or search terms
              </div>
              <button
                onClick={clearFilters}
                className="mt-4 px-5 py-2 rounded-xl text-sm font-semibold text-white"
                style={{ background: ORANGE }}
              >
                Clear all filters
              </button>
            </div>
          ) : (
            results.map((t) => (
              <TeacherCard
                key={t.id}
                t={t}
                liking={likingId === t.id}
                onToggleLike={() => handleToggleLike(t.id)}
                onContact={() => setContactTeacher(t)}
              />
            ))
          )}

          {/* Pagination hint */}
          {!loading && !loadError && results.length > 0 && (
            <div className="text-center py-4 text-sm text-gray-400">
              Showing {results.length} of {teachers.length} teachers
            </div>
          )}
        </div>
      </div>

      {ct && (
        <ContactModal
          teacher={{
            id: ct.id,
            initials: ct.initials,
            name: ct.name,
            courses: ct.courses,
            verified: ct.verified,
            bg: ct.bg,
            color: ct.color,
            tagline: [ct.expertise, ct.city].filter(Boolean).join(" · "),
          }}
          defaultType="inquiry"
          onClose={() => setContactTeacher(null)}
        />
      )}
    </div>
  );
}
