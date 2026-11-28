"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { AiOutlineDownload, AiOutlineReload, AiOutlineSafetyCertificate, AiOutlineSearch } from "react-icons/ai";
import BackLink from "@/components/common/BackLink";
import Select from "@/components/ui/Select";
import { getApiErrorMessage } from "@/lib/api-error";
import { notifySuccess } from "@/lib/notifications";
import {
  buildMentorVerificationParams,
  type MentorVerificationSearchField,
  type MentorVerificationStatus,
} from "@/lib/mentor-verification";
import mentorService, { type MentorDirectoryEntry } from "@/services/mentor.service";
import { formatExperience, getInitials } from "@/utils/teacherDisplay";

function errorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) return getApiErrorMessage(error.response?.data) || fallback;
  return error instanceof Error ? error.message : fallback;
}

function teacherName(teacher: MentorDirectoryEntry): string {
  return [teacher.first_name, teacher.last_name].filter(Boolean).join(" ") || teacher.email || "Teacher";
}

const secondaryButton = "inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50";

export default function AdminTeacherVerification() {
  const [query, setQuery] = useState({
    status: "pending" as MentorVerificationStatus,
    searchField: "first_name" as MentorVerificationSearchField,
    search: "",
    page: 1,
  });
  const [searchField, setSearchField] = useState<MentorVerificationSearchField>("first_name");
  const [searchInput, setSearchInput] = useState("");
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState<{ profiles: MentorDirectoryEntry[]; moreRecords: boolean }>({
    profiles: [], moreRecords: false,
  });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const saving = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setLoadError("");
      try {
        const params = buildMentorVerificationParams(query);
        const nextResult = await mentorService.getDirectoryPage(params, controller.signal);
        if (!controller.signal.aborted) setResult(nextResult);
      } catch (error) {
        if (!controller.signal.aborted) setLoadError(errorMessage(error, "Unable to load teachers. Please try again."));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [query, revision]);

  function search(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextQuery = { ...query, searchField, search: searchInput.trim(), page: 1 };
    try {
      buildMentorVerificationParams(nextQuery);
      setActionError("");
      setQuery(nextQuery);
    } catch (error) {
      setActionError(errorMessage(error, "Please check your search."));
    }
  }

  async function updateVerification(teacher: MentorDirectoryEntry) {
    if (saving.current || !teacher.profile) return;
    saving.current = true;
    setSavingId(teacher.id);
    setActionError("");
    const isVerified = teacher.profile.is_verified !== true;
    try {
      await mentorService.setVerification(teacher.id, isVerified);
      notifySuccess(
        isVerified ? `${teacherName(teacher)} verified.` : `Verification removed for ${teacherName(teacher)}.`,
        "mentor-verification",
      );
      // PATCH returns only a status message; fetch the authoritative list again.
      setQuery((current) => ({ ...current, page: 1 }));
      setRevision((value) => value + 1);
    } catch (error) {
      setActionError(errorMessage(error, "Unable to update teacher verification."));
    } finally {
      saving.current = false;
      setSavingId(null);
    }
  }

  async function downloadDocument(teacher: MentorDirectoryEntry) {
    if (downloadingId !== null) return;
    setDownloadingId(teacher.id);
    setActionError("");
    try {
      const blob = await mentorService.downloadIdentityDocument(teacher.id);
      const extension = { "application/pdf": "pdf", "image/png": "png", "image/jpeg": "jpg" }[blob.type] || "bin";
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `teacher-${teacher.id}-identity.${extension}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      setActionError(errorMessage(error, "Unable to download the identity document."));
    } finally {
      setDownloadingId(null);
    }
  }

  const disabled = loading || savingId !== null;

  return (
    <main className="text-gray-900">
      <div className="mx-auto max-w-7xl px-4 pt-3 sm:px-6 lg:px-8">
        <BackLink href="/admin/dashboard">Admin dashboard</BackLink>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-brand-orange">ADMINISTRATION</p>
            <h1 className="mt-1 text-2xl font-bold text-brand-navy sm:text-3xl">Teacher Verification</h1>
            <p className="mt-2 max-w-2xl text-sm text-gray-500">
              Review profiles and identity documents. Verified teachers appear in the tutor directory; removing verification hides them.
            </p>
          </div>
          <button type="button" onClick={() => setRevision((value) => value + 1)} disabled={disabled} className={secondaryButton}>
            <AiOutlineReload className={loading ? "animate-spin" : ""} aria-hidden="true" /> Refresh
          </button>
        </div>

        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-gray-100 p-5 lg:flex-row">
            <Select
              aria-label="Teacher verification status"
              value={query.status}
              onValueChange={(value) => {
                setActionError("");
                setQuery((current) => ({ ...current, status: value as MentorVerificationStatus, page: 1 }));
              }}
              options={[
                { value: "pending", label: "Pending verification" },
                { value: "verified", label: "Verified teachers" },
                { value: "all", label: "All teachers" },
              ]}
              disabled={savingId !== null}
              className="lg:w-56 lg:shrink-0"
            />
            <form onSubmit={search} className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row">
              <Select
                aria-label="Teacher search field"
                value={searchField}
                onValueChange={(value) => setSearchField(value as MentorVerificationSearchField)}
                options={[
                  { value: "first_name", label: "First name" },
                  { value: "last_name", label: "Last name" },
                  { value: "email", label: "Email" },
                ]}
                disabled={savingId !== null}
                className="sm:w-40 sm:shrink-0"
              />
              <input
                type="search"
                aria-label="Search teachers"
                placeholder={`Search by ${searchField.replace("_", " ")}...`}
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                disabled={savingId !== null}
                className="min-w-0 flex-1 rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400"
              />
              <button type="submit" disabled={savingId !== null} className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-orange px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50">
                <AiOutlineSearch aria-hidden="true" /> Search
              </button>
              {query.search && (
                <button
                  type="button"
                  disabled={savingId !== null}
                  onClick={() => {
                    setSearchInput("");
                    setActionError("");
                    setQuery((current) => ({ ...current, search: "", page: 1 }));
                  }}
                  className={secondaryButton}
                >Clear</button>
              )}
            </form>
          </div>

          {actionError && <p role="alert" className="m-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{actionError}</p>}

          <div aria-busy={loading}>
            {loadError ? (
              <div role="alert" className="m-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <p>{loadError}</p>
                <button type="button" onClick={() => setRevision((value) => value + 1)} className="mt-2 font-semibold underline">Try again</button>
              </div>
            ) : loading ? (
              <div role="status" aria-label="Loading teachers" className="space-y-3 p-5">
                {[1, 2, 3].map((id) => <div key={id} className="h-28 animate-pulse rounded-xl bg-gray-100" />)}
              </div>
            ) : result.profiles.length === 0 ? (
              <div className="px-5 py-16 text-center text-sm text-gray-500">
                <AiOutlineSafetyCertificate className="mx-auto mb-3 h-9 w-9 text-gray-300" aria-hidden="true" />
                No teachers found. Try a different status or search.
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {result.profiles.map((teacher) => {
                  const profile = teacher.profile;
                  const name = teacherName(teacher);
                  const verified = profile?.is_verified === true;
                  return (
                    <article key={teacher.id} className="p-5">
                      <div className="flex flex-col justify-between gap-4 sm:flex-row">
                        <div className="flex min-w-0 items-start gap-3">
                          <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-navy text-sm font-bold text-white">{getInitials(name)}</span>
                          <div className="min-w-0">
                            <h2 className="break-words font-semibold text-brand-navy">{name}</h2>
                            <p className="mt-1 break-all text-sm text-gray-500">{teacher.email || "Email unavailable"}</p>
                            {teacher.phone && <a href={`tel:${teacher.phone}`} className="mt-1 inline-block text-sm text-gray-600 hover:text-brand-orange">{teacher.phone}</a>}
                            <p className="mt-1 text-xs text-gray-500">
                              {[profile?.expertise, profile?.city, profile?.state].filter(Boolean).join(" · ") || "Profile details not added"}
                            </p>
                          </div>
                        </div>
                        <div className="flex shrink-0 flex-wrap items-center gap-3 sm:justify-end">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${verified ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                            {!profile ? "No profile" : verified ? "Verified" : "Pending"}
                          </span>
                          <button
                            type="button"
                            aria-label={`${verified ? "Remove verification for" : "Verify"} ${name}`}
                            disabled={savingId !== null || !profile}
                            onClick={() => void updateVerification(teacher)}
                            className={verified ? secondaryButton : "inline-flex items-center justify-center gap-2 rounded-lg bg-brand-orange px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"}
                          >
                            {savingId === teacher.id && <AiOutlineReload className="animate-spin" aria-hidden="true" />}
                            {savingId === teacher.id ? "Saving…" : verified ? "Remove verification" : "Verify teacher"}
                          </button>
                        </div>
                      </div>
                      {profile ? (
                        <details className="mt-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
                          <summary className="cursor-pointer text-sm font-semibold text-brand-navy">Review profile for {name}</summary>
                          <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
                            <div><dt className="font-medium text-gray-700">Experience</dt><dd className="mt-1 text-gray-500">{formatExperience(profile.total_expierence_in_years)}</dd></div>
                            <div><dt className="font-medium text-gray-700">Location</dt><dd className="mt-1 text-gray-500">{[profile.city, profile.state, profile.country].filter(Boolean).join(", ") || "Not provided"}</dd></div>
                            <div><dt className="font-medium text-gray-700">Courses</dt><dd className="mt-1 text-gray-500">{profile.courses_can_teach?.map((course) => course.name).join(", ") || "Not provided"}</dd></div>
                            <div><dt className="font-medium text-gray-700">Qualifications</dt><dd className="mt-1 text-gray-500">{profile.highest_qualification?.map((item) => item.name).join(", ") || "Not provided"}</dd></div>
                            <div className="sm:col-span-2"><dt className="font-medium text-gray-700">About</dt><dd className="mt-1 whitespace-pre-wrap break-words text-gray-500">{profile.about || "Not provided"}</dd></div>
                          </dl>
                          <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-gray-200 pt-4">
                            <p className="text-sm text-gray-600">ID proof: {profile.identity_verification_name?.name || "Document type not provided"}</p>
                            {profile.identity_verification ? (
                              <button type="button" onClick={() => void downloadDocument(teacher)} disabled={downloadingId !== null} className={secondaryButton}>
                                {downloadingId === teacher.id ? <AiOutlineReload className="animate-spin" aria-hidden="true" /> : <AiOutlineDownload aria-hidden="true" />}
                                {downloadingId === teacher.id ? "Downloading…" : "Download ID proof"}
                              </button>
                            ) : <p className="text-sm text-amber-700">No identity document uploaded.</p>}
                          </div>
                        </details>
                      ) : <p className="mt-3 text-sm text-gray-500">This teacher needs to create a profile before verification.</p>}
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          {!loadError && (query.page > 1 || result.moreRecords || result.profiles.length > 0) && (
            <nav aria-label="Teacher pages" className="flex items-center justify-between gap-3 border-t border-gray-100 px-5 py-4">
              <button type="button" onClick={() => setQuery((current) => ({ ...current, page: current.page - 1 }))} disabled={disabled || query.page <= 1} className={secondaryButton}>Previous</button>
              <p role="status" className="text-center text-sm text-gray-500">Page {query.page}{!loading && ` · ${result.profiles.length} teachers`}</p>
              <button type="button" onClick={() => setQuery((current) => ({ ...current, page: current.page + 1 }))} disabled={disabled || !result.moreRecords} className={secondaryButton}>Next</button>
            </nav>
          )}
        </section>
      </div>
    </main>
  );
}
