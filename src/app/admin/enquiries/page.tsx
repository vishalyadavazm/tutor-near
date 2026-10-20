"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AiOutlineClockCircle,
  AiOutlineInbox,
  AiOutlineLeft,
  AiOutlinePhone,
  AiOutlineReload,
  AiOutlineRight,
  AiOutlineUser,
} from "react-icons/ai";
import enquiryService, { EnquiryRecord } from "@/services/enquiry.service";

const NAVY = "#15213D";
const ORANGE = "#E8621A";

function formatCreatedAt(value?: string): string {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<EnquiryRecord[]>([]);
  const [page, setPage] = useState(1);
  const [moreRecords, setMoreRecords] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadEnquiries() {
      setLoading(true);
      setError(null);
      try {
        const result = await enquiryService.getAll(page);
        if (cancelled) return;
        setEnquiries(result.enquiries);
        setPage(result.page);
        setMoreRecords(result.moreRecords);
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load enquiries.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadEnquiries();
    return () => {
      cancelled = true;
    };
  }, [page, refreshKey]);

  function changePage(nextPage: number) {
    setPage(nextPage);
  }

  return (
    <main className="min-h-screen bg-[#F5F7FB] text-gray-900">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-lg font-extrabold tracking-tight" style={{ color: NAVY }}>
            Tutor<span style={{ color: ORANGE }}>Near</span>
            <span className="ml-2 text-sm font-medium text-gray-500">Admin</span>
          </Link>
          <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
            Enquiry management
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold" style={{ color: ORANGE }}>ADMINISTRATION</p>
            <h1 className="mt-1 text-2xl font-bold sm:text-3xl" style={{ color: NAVY }}>
              Enquiries
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              View enquiries submitted by students and other visitors.
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
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                <AiOutlineInbox className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-semibold" style={{ color: NAVY }}>All enquiries</h2>
                <p className="text-xs text-gray-500">Page {page}</p>
              </div>
            </div>
            <span className="text-sm text-gray-500">
              {loading ? "Loading…" : `${enquiries.length} on this page`}
            </span>
          </div>

          {error ? (
            <div className="m-5 rounded-xl border border-red-200 bg-red-50 p-4" role="alert">
              <p className="font-semibold text-red-800">Could not load enquiries</p>
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
            <div className="space-y-3 p-5" aria-label="Loading enquiries">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-24 animate-pulse rounded-xl bg-gray-100" />
              ))}
            </div>
          ) : enquiries.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <AiOutlineInbox className="mx-auto h-10 w-10 text-gray-300" />
              <h3 className="mt-3 font-semibold text-gray-800">No enquiries found</h3>
              <p className="mt-1 text-sm text-gray-500">New enquiries will appear here.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {enquiries.map((enquiry) => (
                <article key={enquiry.id} className="px-5 py-5 transition-colors hover:bg-gray-50/70">
                  <div className="flex flex-col justify-between gap-4 sm:flex-row">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{enquiry.name}</h3>
                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium capitalize text-blue-700">
                          {enquiry.enquirer_type}
                        </span>
                      </div>
                      <a
                        href={`tel:${enquiry.phone}`}
                        className="mt-2 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-orange-700"
                      >
                        <AiOutlinePhone className="text-gray-400" />
                        {enquiry.phone}
                      </a>
                    </div>
                    <p className="inline-flex shrink-0 items-center gap-1.5 text-xs text-gray-500">
                      <AiOutlineClockCircle />
                      {formatCreatedAt(enquiry.created_t ?? enquiry.created_at)}
                    </p>
                  </div>
                  <div className="mt-4 rounded-xl bg-gray-50 px-4 py-3">
                    <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      <AiOutlineUser />
                      Message
                    </p>
                    <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-gray-700">
                      {enquiry.message}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}

          {!error && !loading && (page > 1 || moreRecords) && (
            <div className="flex items-center justify-between border-t border-gray-100 px-5 py-4">
              <button
                type="button"
                onClick={() => changePage(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <AiOutlineLeft />
                Previous
              </button>
              <span className="text-sm text-gray-500">Page {page}</span>
              <button
                type="button"
                onClick={() => changePage(page + 1)}
                disabled={!moreRecords}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <AiOutlineRight />
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
