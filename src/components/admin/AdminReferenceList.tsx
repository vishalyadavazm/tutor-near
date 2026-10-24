"use client";

import Link from "next/link";
import BackLink from "@/components/common/BackLink";
import { useEffect, useState } from "react";
import { AiOutlineBook, AiOutlineReload, AiOutlineSafetyCertificate } from "react-icons/ai";
import mentorService, {
  CourseOption,
  QualificationOption,
} from "@/services/mentor.service";

type ReferenceType = "courses" | "qualifications";
type ReferenceRecord = CourseOption | QualificationOption;

const NAVY = "#15213D";
const ORANGE = "#E8621A";

interface Props {
  type: ReferenceType;
}

export default function AdminReferenceList({ type }: Props) {
  const [records, setRecords] = useState<ReferenceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const isCourses = type === "courses";
  const title = isCourses ? "Courses" : "Qualifications";

  useEffect(() => {
    let cancelled = false;

    async function loadRecords() {
      setLoading(true);
      setError(null);
      try {
        const result = isCourses
          ? await mentorService.getCourses()
          : await mentorService.getQualifications();
        if (!cancelled) setRecords(result);
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : `Unable to load ${title.toLowerCase()}.`);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadRecords();
    return () => {
      cancelled = true;
    };
  }, [isCourses, refreshKey, title]);

  return (
    <main className="min-h-screen bg-[#F5F7FB] text-gray-900">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="text-lg font-extrabold tracking-tight" style={{ color: NAVY }}>
            Tutor<span style={{ color: ORANGE }}>Near</span>
            <span className="ml-2 text-sm font-medium text-gray-500">Admin</span>
          </Link>
          <span className="ml-auto rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
            {title} management
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 pt-3 sm:px-6 lg:px-8">
        <BackLink href="/admin/dashboard">Admin dashboard</BackLink>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold" style={{ color: ORANGE }}>ADMINISTRATION</p>
            <h1 className="mt-1 text-2xl font-bold sm:text-3xl" style={{ color: NAVY }}>
              {title}
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              View {title.toLowerCase()} configured for TutorNear.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setRefreshKey((current) => current + 1)}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <AiOutlineReload className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
              {isCourses
                ? <AiOutlineBook className="h-5 w-5" />
                : <AiOutlineSafetyCertificate className="h-5 w-5" />}
            </span>
            <div>
              <h2 className="font-semibold" style={{ color: NAVY }}>All {title.toLowerCase()}</h2>
              <p className="text-xs text-gray-500">
                {loading ? "Loading…" : `${records.length} ${title.toLowerCase()}`}
              </p>
            </div>
          </div>

          {error ? (
            <div className="m-5 rounded-xl border border-red-200 bg-red-50 p-4" role="alert">
              <p className="font-semibold text-red-800">Could not load {title.toLowerCase()}</p>
              <p className="mt-1 text-sm text-red-700">{error}</p>
              <button
                type="button"
                onClick={() => setRefreshKey((current) => current + 1)}
                className="mt-3 text-sm font-semibold text-red-800 underline"
              >
                Try again
              </button>
            </div>
          ) : loading ? (
            <div className="space-y-3 p-5" aria-label={`Loading ${title.toLowerCase()}`}>
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-14 animate-pulse rounded-xl bg-gray-100" />
              ))}
            </div>
          ) : records.length === 0 ? (
            <div className="px-5 py-16 text-center text-sm text-gray-500">
              No {title.toLowerCase()} found.
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {records.map((record) => (
                <li key={record.id} className="flex items-center justify-between gap-4 px-5 py-4">
                  <span className="font-medium text-gray-800">
                    {"name" in record ? record.name : record.degree_name}
                  </span>
                  <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500">
                    #{record.id}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
