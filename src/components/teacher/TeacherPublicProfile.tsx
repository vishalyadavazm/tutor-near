"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  AiOutlineEnvironment,
  AiOutlineGlobal,
  AiOutlineMessage,
  AiOutlinePhone,
  AiOutlineShareAlt,
  AiOutlineClose,
  AiOutlineBell,
  AiOutlineLeft,
  AiOutlineRight,
} from "react-icons/ai";
import { BsShieldCheck, BsHeart, BsHeartFill, BsStarFill, BsStar } from "react-icons/bs";
import { FiBookOpen } from "react-icons/fi";
import AuthService from "@/services/auth.service";
import ContactModal from "@/components/shared/ContactModal";
import mentorService, { MentorComment, MentorDirectoryEntry } from "@/services/mentor.service";
import { DisplayTeacher, formatExperience, toDisplayTeacherFromDirectory } from "@/utils/teacherDisplay";

/* ── Brand ──────────────────────────────────────── */
const NAVY = "#15213D";
const ORANGE = "#E8621A";
const CONTACT_PHONE = "81445 48534";

function Avatar({
  photoUrl,
  name,
  initials,
  bg,
  color,
}: {
  photoUrl: string | null;
  name: string;
  initials: string;
  bg: string;
  color: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const [broken, setBroken] = useState(false);

  return (
    <div className="relative h-20 w-20 overflow-hidden rounded-full">
      <div
        className="absolute inset-0 flex items-center justify-center text-2xl font-black"
        style={{ background: bg, color }}
      >
        {initials}
      </div>
      {photoUrl && !broken && (
        <img
          src={photoUrl}
          alt={name}
          onLoad={() => setLoaded(true)}
          onError={() => setBroken(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-200 ${loaded ? "opacity-100" : "opacity-0"}`}
        />
      )}
    </div>
  );
}

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

  if (isRated) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-gray-500">Rate this tutor:</span>
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

function AboutContactCard({
  about,
  onInquiry,
  onDemo,
}: {
  about: string;
  onInquiry: () => void;
  onDemo: () => void;
}) {
  return (
    <section className="rounded-xl border border-[#E6EBF2] bg-white p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
          <FiBookOpen className="h-3.5 w-3.5" />
        </span>
        <h2 className="text-xs font-semibold text-[#15213D]">About Tutor</h2>
      </div>
      <p className="rounded-lg bg-[#F7F9FC] p-3 text-xs leading-relaxed text-gray-600">
        {about || "This tutor hasn't added a bio yet."}
      </p>
      <div className="mt-3 flex items-center justify-between gap-2 border-t border-gray-100 pt-3 text-[11px]">
        <span className="text-gray-500">Contact Number</span>
        <span className="inline-flex items-center gap-1 font-semibold text-gray-700">
          <AiOutlinePhone className="h-3 w-3" />
          {CONTACT_PHONE}
        </span>
      </div>
      <div className="mt-2 flex items-center justify-between gap-2 text-[11px]">
        <span className="text-gray-500">Hourly Rate</span>
        <span className="font-semibold text-gray-700">Contact for rates</span>
      </div>
      <div className="mt-3 flex flex-col gap-2">
        <button
          type="button"
          onClick={onInquiry}
          className="w-full rounded-lg px-3 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: ORANGE }}
        >
          Send Inquiry
        </button>
        <button
          type="button"
          onClick={onDemo}
          className="w-full rounded-lg border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-50"
        >
          Book Demo
        </button>
      </div>
    </section>
  );
}

function MoreProfilesSidebar({
  currentId,
  teachers,
  error,
}: {
  currentId: number;
  teachers: DisplayTeacher[];
  error: string | null;
}) {
  const suggestions = teachers.filter((teacher) => teacher.id !== currentId).slice(0, 3);

  if (suggestions.length === 0 && !error) return null;

  return (
    <section className="overflow-hidden rounded-xl border border-[#E6EBF2] bg-white shadow-sm">
      <div className="border-b border-gray-100 px-4 py-3">
        <h2 className="text-xs font-semibold text-gray-900">More profiles for you</h2>
        <p className="mt-0.5 text-[10px] text-gray-500">Tutors you might like</p>
      </div>
      {error ? (
        <p role="alert" className="px-4 py-3 text-[10px] text-red-600">{error}</p>
      ) : (
        <>
          <div className="divide-y divide-gray-100">
            {suggestions.map((suggestion) => (
              <article key={suggestion.id} className="flex items-center gap-2.5 px-3 py-3">
                {suggestion.photoUrl ? (
                  <img
                    src={suggestion.photoUrl}
                    alt=""
                    className="h-9 w-9 shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-semibold"
                    style={{ background: suggestion.bg, color: suggestion.color }}
                  >
                    {suggestion.initials}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-semibold text-gray-900">
                    {suggestion.name}
                    {suggestion.verified && (
                      <BsShieldCheck className="ml-1 inline h-3 w-3 text-blue-600" />
                    )}
                  </p>
                  <p className="truncate text-[10px] text-gray-500">
                    {suggestion.expertise || "Tutor"} · {suggestion.city || "—"}
                  </p>
                  <p className="mt-1 text-[10px] text-gray-500">
                    {formatExperience(suggestion.experienceYears)}
                  </p>
                </div>
                <Link
                  href={`/teacher/${suggestion.id}`}
                  className="shrink-0 rounded-md border border-gray-200 px-2 py-1 text-[9px] font-semibold text-gray-700 transition-colors hover:border-orange-200 hover:text-[#E8621A]"
                >
                  View Profile
                </Link>
              </article>
            ))}
          </div>
          <Link
            href="/student"
            className="block border-t border-gray-100 px-4 py-2.5 text-center text-[10px] font-semibold text-[#E8621A] hover:bg-orange-50"
          >
            Show all tutors →
          </Link>
        </>
      )}
    </section>
  );
}

/* ─── Main component ─────────────────────────────── */
export default function TeacherPublicProfile({ teacherId }: { teacherId: number }) {

  const [profile, setProfile] = useState<MentorDirectoryEntry | null>(null);
  const [recommendations, setRecommendations] = useState<MentorDirectoryEntry[]>([]);
  const [recommendationsError, setRecommendationsError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [comments, setComments] = useState<MentorComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentsError, setCommentsError] = useState<string | null>(null);
  const [commentsPage, setCommentsPage] = useState(1);
  const [commentsHaveMore, setCommentsHaveMore] = useState(false);
  const [changingCommentPage, setChangingCommentPage] = useState(false);
  const [commentPageError, setCommentPageError] = useState<string | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [commentDraft, setCommentDraft] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentSubmitError, setCommentSubmitError] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editCommentDraft, setEditCommentDraft] = useState("");
  const [editCommentError, setEditCommentError] = useState<string | null>(null);
  const [savingComment, setSavingComment] = useState(false);

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
        const profileRes = await mentorService.getProfileById(teacherId);
        if (cancelled) return;
        setProfile(profileRes);

        try {
          const recommendationsRes = await mentorService.getAllProfiles({ perPage: 6 });
          if (!cancelled) setRecommendations(recommendationsRes);
        } catch {
          if (!cancelled) setRecommendationsError("Couldn't load more tutor profiles.");
        }
      } catch {
        if (!cancelled) setLoadError("Couldn't load this profile. Please refresh the page.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [teacherId]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setCommentsLoading(true);
      setCommentsError(null);
      try {
        const response = await mentorService.getMentorComments(teacherId, 1);
        if (!cancelled) {
          setComments(response.comments);
          setCommentsPage(response.page);
          setCommentsHaveMore(response.moreRecords);
        }
      } catch {
        if (!cancelled) setCommentsError("Couldn't load comments. Please try again later.");
      } finally {
        if (!cancelled) setCommentsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [teacherId]);

  useEffect(() => {
    if (!showComments) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowComments(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [showComments]);

  const teacher = profile ? toDisplayTeacherFromDirectory(profile) : null;
  const recommendedTeachers = recommendations
    .map(toDisplayTeacherFromDirectory)
    .filter((recommended): recommended is DisplayTeacher => recommended !== null);

  function openContact(type: "inquiry" | "demo" | "message") {
    setContactType(type);
    setShowContact(true);
  }

  async function refreshProfile() {
    const refreshed = await mentorService.getProfileById(teacherId);
    setProfile(refreshed);
  }

  async function handleToggleLike() {
    setLiking(true);
    setLikeError(null);
    try {
      await mentorService.toggleLike(teacherId, !!teacher?.isLiked);
      await refreshProfile();
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
      await refreshProfile();
    } catch (err) {
      setRateError(err instanceof Error ? err.message : "Couldn't submit rating.");
    } finally {
      setSubmittingRating(false);
    }
  }

  async function handleSubmitComment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const comment = commentDraft.trim();
    if (!comment) return;

    setSubmittingComment(true);
    setCommentSubmitError(null);
    try {
      await mentorService.addMentorComment(teacherId, comment);
    } catch (err) {
      setCommentSubmitError(err instanceof Error ? err.message : "Unable to post comment.");
      setSubmittingComment(false);
      return;
    }

    setCommentDraft("");
    try {
      const response = await mentorService.getMentorComments(teacherId, 1);
      setComments(response.comments);
      setCommentsPage(response.page);
      setCommentsHaveMore(response.moreRecords);
      setCommentsError(null);
    } catch {
      setCommentsError("Your comment was posted, but the list couldn't refresh.");
    } finally {
      setSubmittingComment(false);
    }
  }

  function startEditingComment(item: MentorComment) {
    setEditingCommentId(item.id);
    setEditCommentDraft(item.comment);
    setEditCommentError(null);
  }

  function cancelEditingComment() {
    setEditingCommentId(null);
    setEditCommentDraft("");
    setEditCommentError(null);
  }

  async function handleUpdateComment(commentId: number) {
    const comment = editCommentDraft.trim();
    if (!comment) return;

    setSavingComment(true);
    setEditCommentError(null);
    try {
      await mentorService.updateMentorComment(commentId, comment);
    } catch (err) {
      setEditCommentError(err instanceof Error ? err.message : "Unable to update comment.");
      setSavingComment(false);
      return;
    }

    setComments((current) => current.map((item) =>
      item.id === commentId ? { ...item, comment, is_edited: true } : item,
    ));
    cancelEditingComment();
    setSavingComment(false);
  }

  async function handleCommentPageChange(page: number) {
    if (page < 1 || page === commentsPage || changingCommentPage) return;
    if (page > commentsPage && !commentsHaveMore) return;

    setChangingCommentPage(true);
    setCommentPageError(null);
    try {
      const response = await mentorService.getMentorComments(teacherId, page);
      setComments(response.comments);
      setCommentsPage(response.page);
      setCommentsHaveMore(response.moreRecords);
    } catch {
      setCommentPageError("Couldn't load comments. Please try again.");
    } finally {
      setChangingCommentPage(false);
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
          <span className="hidden text-base font-semibold sm:block">
            <span style={{ color: NAVY }}>Tutor</span>
            <span style={{ color: ORANGE }}>Near</span>
          </span>
        </Link>

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

  const DashboardLink = (
    <div className="mx-auto max-w-[1400px] px-5 pt-4">
      <Link
        href="/student"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 transition-colors hover:text-[#E8621A]"
      >
        <span aria-hidden="true">←</span>
        Back to dashboard
      </Link>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 font-sans">
        {Topbar}
        {DashboardLink}
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
        {DashboardLink}
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
      {DashboardLink}

      {/* ── Body: two-column layout ── */}
      <div className="mx-auto max-w-[1280px] px-4 pb-8 pt-3 sm:px-5">
        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,2fr)_300px]">

          {/* ── LEFT: main profile content ── */}
          <div className="flex min-w-0 flex-col gap-4">

            {/* Cover + Profile card */}
            <div className="overflow-hidden rounded-xl border border-[#E6EBF2] bg-white shadow-sm">

              {/* Cover banner */}
              <div
                className="relative h-28 overflow-hidden sm:h-32"
                style={
                  teacher.bannerUrl
                    ? undefined
                    : { background: "repeating-linear-gradient(90deg, #0A1628 0px, #0A1628 12px, #17294B 14px, #0A1628 25px)" }
                }
              >
                {teacher.bannerUrl ? (
                  <img
                    src={teacher.bannerUrl}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  [...Array(20)].map((_, i) => (
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
                  ))
                )}
                {teacher.verified && (
                  <span className="absolute right-3 top-3 rounded-full border border-emerald-300/20 bg-emerald-600/80 px-2.5 py-1 text-[10px] font-medium text-white">
                    <BsShieldCheck className="mr-1 inline h-3 w-3" />
                    Verified Educator
                  </span>
                )}
              </div>

              {/* Profile info */}
              <div className="px-4 pb-4 sm:px-5">
                {/* Avatar + action row */}
                <div className="mb-3 flex items-end justify-between -mt-12 sm:-mt-14">
                  <div
                    className="relative z-10 rounded-full shrink-0 shadow-xl"
                    style={{
                      background: "linear-gradient(135deg, #F97316, #EC4899, #8B5CF6)",
                      padding: "3px",
                    }}
                  >
                    <div className="rounded-full bg-white p-[3px]">
                      <Avatar
                        photoUrl={teacher.photoUrl}
                        name={teacher.name}
                        initials={teacher.initials}
                        bg={teacher.bg}
                        color={teacher.color}
                      />
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="mt-12 flex items-center gap-1.5 sm:gap-2">
                    <button
                      onClick={() => openContact("message")}
                      className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-2 text-xs font-medium text-gray-700 transition-all hover:bg-gray-50 sm:px-3 sm:text-sm"
                    >
                      <AiOutlineMessage className="w-4 h-4" />
                      <span className="hidden sm:inline">Message</span>
                    </button>
                    <button
                      onClick={handleToggleLike}
                      disabled={liking}
                      aria-label={teacher.isLiked ? "Remove tutor from saved" : "Save tutor"}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 transition-all hover:border-red-200 disabled:opacity-50"
                    >
                      {teacher.isLiked
                        ? <BsHeartFill className="w-4 h-4 text-red-500" />
                        : <BsHeart className="w-4 h-4 text-gray-400" />}
                    </button>
                    <span
                      className="min-w-5 text-center text-[11px] font-medium text-gray-500"
                      aria-label={`${teacher.totalLikes} likes`}
                      title={`${teacher.totalLikes} likes`}
                    >
                      {teacher.totalLikes}
                    </span>
                    <button
                      type="button"
                      aria-label="Share tutor profile"
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition-all hover:bg-gray-50"
                    >
                      <AiOutlineShareAlt className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Name + info + summary */}
                <div className="flex flex-col gap-4">

                  {/* Left: name, location */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-lg font-bold text-gray-900 sm:text-xl">{teacher.name}</h1>
                      {teacher.verified && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                          <BsShieldCheck className="h-3 w-3" />
                          Verified Educator
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-gray-500">{teacher.expertise || "Tutor"}</p>
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
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500">
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

                </div>
              </div>
            </div>

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

            <section className="rounded-xl border border-[#E6EBF2] bg-white p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                    <FiBookOpen className="h-3.5 w-3.5" />
                  </span>
                  <h2 className="text-sm font-semibold text-gray-900">About &amp; Teaching</h2>
                </div>
                {teacher.verified && (
                  <span className="text-[10px] font-medium text-blue-700">ID Verified</span>
                )}
              </div>
              <p className="whitespace-pre-line py-4 text-xs leading-6 text-gray-600">
                {teacher.about || "This tutor hasn't added a bio yet."}
              </p>
              {teacher.qualifications.length > 0 && (
                <div className="border-t border-gray-100 pt-3">
                  <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                    Qualifications
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {teacher.qualifications.map((qualification) => (
                      <span
                        key={qualification}
                        className="rounded-full bg-gray-50 px-2.5 py-1 text-[10px] text-gray-600"
                      >
                        {qualification}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>

            <div className="lg:hidden">
              <AboutContactCard
                about={teacher.about}
                onInquiry={() => openContact("inquiry")}
                onDemo={() => openContact("demo")}
              />
            </div>

            {/* Student reviews and community comments */}
            <section className="rounded-xl border border-[#E6EBF2] bg-white p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                    <BsStarFill className="h-3.5 w-3.5" />
                  </span>
                  <div>
                    <h2 className="text-sm font-semibold text-gray-900">Student &amp; Parent Reviews</h2>
                    <p className="mt-0.5 text-[10px] text-gray-500">
                      Based on {teacher.reviewCount} rating{teacher.reviewCount === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5" aria-label={
                  teacher.rating === null
                    ? "No ratings yet"
                    : `Rated ${teacher.rating.toFixed(1)} out of 5`
                }>
                  {teacher.rating !== null && (
                    <>
                      <span className="text-base font-bold text-[#15213D]">
                        {teacher.rating.toFixed(1)}
                      </span>
                      <span className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <BsStarFill
                            key={star}
                            className={`h-3 w-3 ${star <= Math.round(teacher.rating!) ? "text-amber-400" : "text-gray-200"}`}
                          />
                        ))}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-4 rounded-xl bg-[#F0F5FF] p-3 sm:p-4">
                {teacher.rating === null ? (
                  <p className="text-center text-xs text-gray-500">
                    No ratings yet. Be the first to rate this tutor.
                  </p>
                ) : (
                  <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 sm:justify-start">
                    <div className="min-w-28 text-center sm:border-r sm:border-blue-100 sm:pr-8">
                      <div className="text-3xl font-bold leading-none text-[#15213D]">
                        {teacher.rating.toFixed(1)}
                      </div>
                      <div className="mt-1 flex justify-center gap-0.5" aria-hidden="true">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <BsStarFill
                            key={star}
                            className={`h-3.5 w-3.5 ${star <= Math.round(teacher.rating!) ? "text-amber-400" : "text-blue-100"}`}
                          />
                        ))}
                      </div>
                      <p className="mt-1 text-[10px] text-gray-500">
                        {teacher.reviewCount} rating{teacher.reviewCount === 1 ? "" : "s"}
                      </p>
                    </div>
                    <p className="max-w-xs text-[11px] leading-5 text-gray-600">
                      Ratings are shared by students and families in the TutorNear community.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 flex flex-col gap-2.5">
                {commentsLoading ? (
                  <div role="status" className="animate-pulse space-y-2">
                    <div className="h-20 rounded-xl bg-gray-100" />
                    <div className="h-20 rounded-xl bg-gray-100" />
                  </div>
                ) : commentsError ? (
                  <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                    {commentsError}
                  </p>
                ) : comments.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-gray-200 px-3 py-5 text-center text-xs text-gray-500">
                    No community comments yet.
                  </p>
                ) : (
                  comments.slice(0, 2).map((item) => {
                    const author = item.commented_by?.name || item.created_by?.name || "Student";
                    return (
                      <article key={item.id} className="rounded-xl bg-[#F0F5FF] p-3 sm:p-4">
                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[10px] font-semibold text-white">
                            {author.trim().slice(0, 1).toUpperCase() || "S"}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[11px] font-semibold text-gray-900">{author}</p>
                            <p className="text-[10px] text-gray-500">
                              {new Date(item.created_t).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                          {item.is_edited && (
                            <span className="rounded bg-white/80 px-1.5 py-0.5 text-[9px] text-gray-500">
                              Edited
                            </span>
                          )}
                        </div>
                        <p className="mt-2 whitespace-pre-wrap text-xs italic leading-relaxed text-gray-700">
                          “{item.comment}”
                        </p>
                      </article>
                    );
                  })
                )}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#E7EFFF] p-3">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#E8621A]">
                    <AiOutlineMessage className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="text-xs font-semibold text-gray-900">Community Comments</h3>
                    <p className="text-[10px] text-gray-500">Read or share a comment about this tutor.</p>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => setShowComments(true)}
                    className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-[10px] font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    Add a comment
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowComments(true)}
                    className="rounded-lg bg-[#E8621A] px-3 py-2 text-[10px] font-semibold text-white transition-colors hover:bg-orange-700"
                  >
                    View all comments
                  </button>
                </div>
              </div>
            </section>

            {showComments && (
              <div
                className="fixed inset-0 z-[190] flex items-center justify-center bg-slate-900/60 p-3 backdrop-blur-sm sm:p-6"
                onClick={(event) => {
                  if (event.target === event.currentTarget) setShowComments(false);
                }}
              >
                <section
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="teacher-comments-title"
                  className="flex max-h-[88vh] w-full max-w-md flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl"
                >
                  <div className="flex shrink-0 items-center justify-between gap-3 border-b border-gray-100 px-5 py-3.5">
                    <div>
                      <div>
                        <h2 id="teacher-comments-title" className="text-sm font-semibold text-gray-900">Comments</h2>
                        <p className="mt-0.5 text-[10px] text-gray-500">{teacher.name}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowComments(false)}
                      aria-label="Close comments"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                    >
                      <AiOutlineClose className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
                    <div className="sr-only" aria-live="polite">
                      {commentsLoading ? "Loading comments" : `${comments.length} comments shown`}
                    </div>

                {commentsLoading ? (
                  <div role="status" aria-label="Loading comments" className="space-y-3">
                    {[0, 1].map((item) => (
                      <div key={item} className="flex animate-pulse gap-3 rounded-xl border border-gray-100 p-4">
                        <div className="h-10 w-10 shrink-0 rounded-full bg-gray-200" />
                        <div className="flex-1 space-y-2 py-1">
                          <div className="h-3 w-1/4 rounded bg-gray-200" />
                          <div className="h-3 w-full rounded bg-gray-100" />
                          <div className="h-3 w-2/3 rounded bg-gray-100" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : commentsError ? (
                  <p role="alert" className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {commentsError}
                  </p>
                ) : comments.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-gray-200 px-4 py-8 text-center">
                    <AiOutlineMessage className="mx-auto h-5 w-5 text-gray-400" />
                    <p className="mt-2 text-sm font-medium text-gray-700">No comments yet</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    {comments.map((item) => {
                      const author = item.commented_by?.name || item.created_by?.name || "Student";

                      return (
                        <article key={item.id} className="rounded-xl border border-[#EDF0F5] bg-[#FAFBFD] p-3">
                          <div className="flex items-start gap-2.5">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[11px] font-semibold text-blue-800">
                              {author.trim().slice(0, 1).toUpperCase() || "S"}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                <span className="text-[11px] font-semibold text-gray-900">{author}</span>
                                <span className="text-gray-300" aria-hidden="true">·</span>
                                <time className="text-[10px] text-gray-400" dateTime={item.created_t}>
                                  {new Date(item.created_t).toLocaleDateString(undefined, {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </time>
                                {item.is_edited && (
                                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-medium text-gray-500">Edited</span>
                                )}
                                {item.is_editable && editingCommentId !== item.id && (
                                  <button
                                    type="button"
                                    onClick={() => startEditingComment(item)}
                                    className="ml-auto rounded-md px-1.5 py-0.5 text-[10px] font-medium text-blue-700 transition-colors hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                                  >
                                    Edit
                                  </button>
                                )}
                              </div>
                              {item.parent !== null && (
                                <p className="mt-2 text-xs font-medium text-gray-500">Reply to comment #{item.parent}</p>
                              )}
                              {editingCommentId === item.id ? (
                                <div className="mt-3 rounded-lg bg-gray-50 p-3">
                                  <textarea
                                    aria-label="Edit comment"
                                    value={editCommentDraft}
                                    onChange={(event) => setEditCommentDraft(event.target.value)}
                                    rows={3}
                                    className="w-full resize-y rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm leading-6 text-gray-800 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                                  />
                                  {editCommentError && (
                                    <p role="alert" className="mt-2 text-sm text-red-600">{editCommentError}</p>
                                  )}
                                  <div className="mt-3 flex justify-end gap-2">
                                    <button
                                      type="button"
                                      onClick={cancelEditingComment}
                                      disabled={savingComment}
                                      className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateComment(item.id)}
                                      disabled={!editCommentDraft.trim() || savingComment}
                                      className="rounded-lg px-3 py-2 text-xs font-semibold text-white transition-opacity disabled:opacity-50"
                                      style={{ background: ORANGE }}
                                    >
                                      {savingComment ? "Saving…" : "Save changes"}
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <p className="mt-2 whitespace-pre-wrap text-[11px] leading-5 text-gray-700">{item.comment}</p>
                              )}
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}

                {comments.length > 0 && !commentsLoading && !commentsError && (
                  <nav aria-label="Comments pagination" className="mt-3 border-t border-gray-100 pt-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCommentPageChange(commentsPage - 1)}
                        disabled={commentsPage <= 1 || changingCommentPage}
                        className="inline-flex h-7 items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 text-[10px] font-medium text-gray-600 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 disabled:cursor-not-allowed disabled:text-gray-400 disabled:opacity-60"
                      >
                        <AiOutlineLeft className="h-3.5 w-3.5" aria-hidden="true" />
                        Previous
                      </button>
                      <div className="min-w-20 text-center" aria-live="polite">
                        <p className="text-[10px] text-gray-600">
                          Page <span className="font-semibold text-gray-900">{commentsPage}</span>
                        </p>
                        {changingCommentPage && <p className="mt-0.5 text-xs text-gray-500">Loading…</p>}
                        {commentPageError && (
                          <p role="alert" className="mt-1 text-xs text-red-600">{commentPageError}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCommentPageChange(commentsPage + 1)}
                        disabled={!commentsHaveMore || changingCommentPage}
                        className="inline-flex h-7 items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 text-[10px] font-medium text-gray-600 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 disabled:cursor-not-allowed disabled:text-gray-400 disabled:opacity-60"
                      >
                        Next
                        <AiOutlineRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </nav>
                )}
                  </div>

                  <form onSubmit={handleSubmitComment} className="shrink-0 border-t border-gray-100 bg-white px-5 py-3.5">
                    <label htmlFor="teacher-comment" className="mb-2 block text-[10px] font-semibold uppercase tracking-wide text-gray-800">
                      Add a comment
                    </label>
                    <div>
                      <textarea
                        id="teacher-comment"
                        value={commentDraft}
                        onChange={(event) => setCommentDraft(event.target.value)}
                        placeholder="Write your comment"
                        rows={3}
                        className="min-h-16 w-full resize-y rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-[11px] leading-5 text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                      />
                    </div>
                    <div className="mt-2 flex justify-end">
                      <button
                        type="submit"
                        disabled={!commentDraft.trim() || submittingComment}
                        className="flex h-8 shrink-0 items-center gap-2 rounded-lg px-4 text-[11px] font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        style={{ background: ORANGE }}
                      >
                        {submittingComment ? "Posting…" : "Post"}
                      </button>
                    </div>
                    {commentSubmitError && (
                      <p role="alert" className="mt-2 text-sm text-red-600">{commentSubmitError}</p>
                    )}
                  </form>
                </section>
              </div>
            )}

          </div>

          {/* ── RIGHT: sticky sidebar ── */}
          <aside className="hidden lg:block min-w-0">
            <div className="sticky top-20 flex flex-col gap-4">
              <AboutContactCard
                about={teacher.about}
                onInquiry={() => openContact("inquiry")}
                onDemo={() => openContact("demo")}
              />
              <MoreProfilesSidebar
                currentId={teacher.id}
                teachers={recommendedTeachers}
                error={recommendationsError}
              />

              {/* Quick links card */}
              <div className="rounded-xl border border-[#E6EBF2] bg-white p-4 shadow-sm">
                <h3 className="mb-3 text-[10px] font-bold uppercase tracking-wide text-gray-500">Quick Links</h3>
                <div className="flex flex-col gap-1">
                  {[
                    { label: "Browse all tutors", href: "/student", emoji: "🔍" },
                    { label: "Online tutors", href: "/student", emoji: "💻" },
                  ].map((l) => (
                    <Link
                      key={l.label}
                      href={l.href}
                      className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-xs text-gray-600 transition-all hover:bg-gray-50 hover:text-blue-600"
                    >
                      <span>{l.emoji}</span>
                      {l.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </aside>

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
