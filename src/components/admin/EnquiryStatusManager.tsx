"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import BackLink from "@/components/common/BackLink";
import Input from "@/components/ui/Input";
import EnquiryStatusBadge from "@/components/admin/EnquiryStatusBadge";
import enquiryService, { type EnquiryStatus } from "@/services/enquiry.service";
import { getRole, subscribeToRoleChanges } from "@/utils/auth";
import { notifySuccess } from "@/lib/notifications";

export default function EnquiryStatusManager() {
  const role = useSyncExternalStore(subscribeToRoleChanges, getRole, () => null);
  const isAdmin = role === "admin";
  const [records, setRecords] = useState<EnquiryStatus[]>([]);
  const [page, setPage] = useState(1);
  const [moreRecords, setMoreRecords] = useState(false);
  const [revision, setRevision] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<EnquiryStatus | null>(null);
  const [name, setName] = useState("");
  const [active, setActive] = useState(true);
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setLoadError("");
      try {
        const result = await enquiryService.getStatuses(page, 10, false, controller.signal);
        if (!controller.signal.aborted) { setRecords(result.records); setMoreRecords(result.moreRecords); }
      } catch (error) {
        if (!controller.signal.aborted) setLoadError(error instanceof Error ? error.message : "Unable to load statuses.");
      } finally { if (!controller.signal.aborted) setLoading(false); }
    }
    void load();
    return () => controller.abort();
  }, [page, revision]);

  async function mutate(operation: () => Promise<void>, message: string, resetForm = false) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true); setError("");
    try {
      await operation();
      notifySuccess(message, "enquiry-status-save");
      if (resetForm) { setEditing(null); setName(""); setActive(true); }
      setRevision((value) => value + 1);
    } catch (error) { setError(error instanceof Error ? error.message : "Unable to save the status."); }
    finally { lock.current = false; setBusy(false); }
  }

  function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void mutate(
      () => editing
        ? enquiryService.updateStatus(editing.id, { name, ...(isAdmin ? { is_active: active } : {}) })
        : enquiryService.createStatus(name, isAdmin ? active : undefined),
      editing ? "Status updated." : "Status created.", true,
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <BackLink href="/admin/dashboard">Admin dashboard</BackLink>
      <div className="my-6 flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-2xl font-bold text-brand-navy">Enquiry Statuses</h1><p className="mt-2 text-sm text-gray-500">Create and rename statuses for your enquiry workflow.</p></div>
        <Link href="/admin/enquiries" className="text-sm font-semibold text-brand-orange hover:underline">View enquiries →</Link>
      </div>
      <form onSubmit={save} className="mb-6 rounded-2xl border border-gray-200 bg-white p-5">
        <h2 className="mb-4 font-semibold text-brand-navy">{editing ? "Edit status" : "New status"}</h2>
        <fieldset disabled={busy} className="flex flex-wrap items-end gap-4">
          <div className="min-w-48 flex-1"><Input id="enquiry-status-name" label="Status name" value={name} onChange={(event) => setName(event.target.value)} required maxLength={20} placeholder="e.g. In Progress" /></div>
          {isAdmin && <label className="flex items-center gap-2 py-3 text-sm"><input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} />Active</label>}
          <button type="submit" className="rounded-lg bg-brand-orange px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Saving…" : editing ? "Save changes" : "Create status"}</button>
          {editing && <button type="button" onClick={() => { setEditing(null); setName(""); setActive(true); }} className="px-3 py-2.5 text-sm text-gray-600">Cancel</button>}
        </fieldset>
        {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
      </form>
      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white" aria-busy={loading}>
        <div className="flex items-center justify-between border-b border-gray-100 p-5"><h2 className="font-semibold text-brand-navy">All statuses</h2><button type="button" disabled={loading || busy} onClick={() => setRevision((value) => value + 1)} className="text-sm font-medium text-brand-orange disabled:opacity-50">Refresh</button></div>
        {loadError ? <p role="alert" className="p-5 text-sm text-red-600">{loadError}</p> : loading ? <p role="status" className="p-8 text-sm text-gray-500">Loading statuses…</p> : records.length === 0 ? <p className="p-8 text-sm text-gray-500">No statuses yet. Create one above.</p> : (
          <ul className="divide-y divide-gray-100">
            {records.map((status) => <li key={status.id} className="flex flex-wrap items-center justify-between gap-3 p-5">
              <EnquiryStatusBadge status={status} />
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="text-xs text-gray-400">{status.is_active ? "Active" : "Inactive"}</span>
                <button type="button" disabled={busy} onClick={() => { setEditing(status); setName(status.name); setActive(status.is_active); setError(""); document.getElementById("enquiry-status-name")?.focus(); }} className="font-medium text-brand-orange disabled:opacity-50">Rename</button>
                {isAdmin && <button type="button" disabled={busy || editing !== null} onClick={() => void mutate(
                  () => status.is_active ? enquiryService.deactivateStatus(status.id) : enquiryService.updateStatus(status.id, { is_active: true }),
                  status.is_active ? "Status deactivated." : "Status reactivated.",
                )} className="font-medium text-gray-600 disabled:opacity-50">{status.is_active ? "Deactivate" : "Reactivate"}</button>}
              </div>
            </li>)}
          </ul>
        )}
        {!loadError && <nav aria-label="Status pages" className="flex items-center justify-between border-t border-gray-100 p-5 text-sm"><button type="button" disabled={loading || busy || page <= 1} onClick={() => setPage(page - 1)} className="disabled:opacity-40">Previous</button><span>Page {page}</span><button type="button" disabled={loading || busy || !moreRecords} onClick={() => setPage(page + 1)} className="disabled:opacity-40">Next</button></nav>}
      </section>
      {isAdmin && <p className="mt-4 text-xs text-gray-500">Deactivating a status preserves existing enquiries. Reactivate it to make it available for selection again.</p>}
    </main>
  );
}
