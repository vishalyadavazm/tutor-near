"use client";

import { useEffect, useState } from "react";
import BackLink from "@/components/common/BackLink";
import EnquiryStatusBadge from "@/components/admin/EnquiryStatusBadge";
import enquiryService, { type EnquiryRecord } from "@/services/enquiry.service";

export default function MyEnquiries() {
  const [enquiries, setEnquiries] = useState<EnquiryRecord[]>([]);
  const [page, setPage] = useState(1);
  const [moreRecords, setMoreRecords] = useState(false);
  const [revision, setRevision] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true); setError("");
      try {
        // Ownership is enforced by the API; no user IDs or local filtering needed.
        const result = await enquiryService.getAll(page, 10, "-created_t,id", undefined, controller.signal);
        if (!controller.signal.aborted) { setEnquiries(result.enquiries); setMoreRecords(result.moreRecords); }
      } catch (error) { if (!controller.signal.aborted) setError(error instanceof Error ? error.message : "Unable to load your enquiries."); }
      finally { if (!controller.signal.aborted) setLoading(false); }
    }
    void load(); return () => controller.abort();
  }, [page, revision]);
  return <main className="min-h-screen bg-gray-50"><div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
    <BackLink href="/student">Find tutors</BackLink>
    <div className="my-6 flex items-center justify-between gap-3"><div><h1 className="text-2xl font-bold text-brand-navy">My enquiries</h1><p className="mt-2 text-sm text-gray-500">Track the enquiries you have sent to TutorNear.</p></div><button type="button" disabled={loading} onClick={() => setRevision((value) => value + 1)} className="text-sm font-semibold text-brand-orange disabled:opacity-50">Refresh</button></div>
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white" aria-busy={loading}>
      {error ? <p role="alert" className="p-6 text-sm text-red-600">{error} Use Refresh to retry.</p> : loading ? <p role="status" className="p-8 text-sm text-gray-500">Loading your enquiries…</p> : enquiries.length === 0 ? <p className="p-8 text-sm text-gray-500">No enquiries yet. Contact a tutor to get started.</p> : <div className="divide-y divide-gray-100">{enquiries.map((enquiry) => <article key={enquiry.id} className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-semibold text-brand-navy">{enquiry.mentor?.name || "Tutor enquiry"}</h2><p className="mt-1 text-xs text-gray-500">Enquiry #{enquiry.id}{enquiry.created_t ? ` · ${new Date(enquiry.created_t).toLocaleString()}` : ""}</p></div><EnquiryStatusBadge status={enquiry.status} /></div>
        <p className="mt-3 text-sm text-gray-500">{[enquiry.class_of_interest, enquiry.subject_of_interest].filter(Boolean).join(" · ")}</p>
        <p className="mt-3 whitespace-pre-wrap break-words text-sm text-gray-700">{enquiry.message}</p>
      </article>)}</div>}
      {!error && (page > 1 || moreRecords) && <nav aria-label="My enquiry pages" className="flex items-center justify-between border-t border-gray-100 p-5 text-sm"><button type="button" disabled={loading || page <= 1} onClick={() => setPage(page - 1)} className="disabled:opacity-40">Previous</button><span>Page {page}</span><button type="button" disabled={loading || !moreRecords} onClick={() => setPage(page + 1)} className="disabled:opacity-40">Next</button></nav>}
    </section>
  </div></main>;
}
