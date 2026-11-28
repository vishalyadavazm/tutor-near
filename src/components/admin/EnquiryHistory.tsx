"use client";

import { useEffect, useId, useRef, useState } from "react";
import DatePicker from "@/components/ui/DatePicker";
import enquiryService, { type EnquiryId, type EnquiryHistoryRecord } from "@/services/enquiry.service";
import { notifySuccess } from "@/lib/notifications";
import { parseCalendarDate } from "@/lib/calendar";

const inputClass = "mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-400";

function dateTime(value?: string) {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export default function EnquiryHistory({ enquiryId }: { enquiryId: EnquiryId }) {
  const formId = useId();
  const [entries, setEntries] = useState<EnquiryHistoryRecord[]>([]);
  const [page, setPage] = useState(1);
  const [moreRecords, setMoreRecords] = useState(false);
  const [revision, setRevision] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState("");
  const [remarks, setRemarks] = useState("");
  const [nextDate, setNextDate] = useState("");
  const [editing, setEditing] = useState<EnquiryHistoryRecord | null>(null);
  const [editRemarks, setEditRemarks] = useState("");
  const [editDate, setEditDate] = useState("");
  const [pendingDelete, setPendingDelete] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true); setLoadError("");
      try {
        const result = await enquiryService.getHistory(enquiryId, page, controller.signal);
        if (!controller.signal.aborted) { setEntries(result.records); setMoreRecords(result.moreRecords); }
      } catch (error) {
        if (!controller.signal.aborted) setLoadError(error instanceof Error ? error.message : "Unable to load history.");
      } finally { if (!controller.signal.aborted) setLoading(false); }
    }
    void load();
    return () => controller.abort();
  }, [enquiryId, page, revision]);

  async function mutate(operation: () => Promise<void>, message: string, onSuccess?: () => void) {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError("");
    try {
      await operation();
      notifySuccess(message, "enquiry-history-save");
      onSuccess?.(); setPendingDelete(null); setPage(1); setRevision((value) => value + 1);
    } catch (error) { setError(error instanceof Error ? error.message : "Unable to save history."); }
    finally { lock.current = false; setBusy(false); }
  }

  function add(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (nextDate && !parseCalendarDate(nextDate)) { setError("Choose a valid follow-up date."); return; }
    void mutate(() => enquiryService.addHistory(enquiryId, { remarks, ...(nextDate ? { next_date: nextDate } : {}) }), "Remark added.", () => { setRemarks(""); setNextDate(""); });
  }

  function saveEdit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    if (editDate && !parseCalendarDate(editDate)) { setError("Choose a valid follow-up date."); return; }
    void mutate(() => enquiryService.updateHistory(editing, { remarks: editRemarks, next_date: editDate || null }), "Remark updated.", () => setEditing(null));
  }

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="mb-5 flex items-center justify-between gap-3"><div><h2 className="text-lg font-semibold text-brand-navy">History &amp; follow-ups</h2><p className="mt-1 text-sm text-gray-500">Remarks and assignment activity, in chronological order.</p></div><button type="button" disabled={loading || busy} onClick={() => setRevision((value) => value + 1)} className="text-sm font-semibold text-brand-orange disabled:opacity-50">Refresh</button></div>
      <form onSubmit={add} className="mb-6 rounded-xl bg-gray-50 p-4">
        <fieldset disabled={busy} className="grid gap-3 sm:grid-cols-[1fr_12rem]">
          <label className="text-sm font-medium text-gray-700">New remark<textarea value={remarks} onChange={(event) => setRemarks(event.target.value)} required rows={3} className={inputClass} placeholder="Add an update about this enquiry..." /></label>
          <div>
            <label htmlFor={`${formId}-new-date`} className="text-sm font-medium text-gray-700">Follow-up date (optional)</label>
            <div className="mt-1">
              <DatePicker
                id={`${formId}-new-date`}
                name="next_date"
                label="Follow-up date"
                value={nextDate}
                onValueChange={setNextDate}
                disabled={busy}
              />
            </div>
            <button type="submit" className="mt-3 w-full rounded-lg bg-brand-orange px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Saving…" : "Add remark"}</button>
          </div>
        </fieldset>
      </form>
      {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <div aria-busy={loading}>
        {loadError ? <p role="alert" className="text-sm text-red-600">{loadError} Use Refresh to retry.</p> : loading ? <p role="status" className="py-5 text-sm text-gray-500">Loading history…</p> : entries.length === 0 ? <p className="py-5 text-sm text-gray-500">No history yet.</p> : (
          <ol className="space-y-4 border-l-2 border-orange-100 pl-5">
            {entries.map((entry) => <li key={entry.id} className="relative rounded-xl border border-gray-100 p-4">
              <span aria-hidden="true" className="absolute -left-7 top-5 h-3 w-3 rounded-full bg-brand-orange" />
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${entry.action === "assigned" ? "bg-blue-50 text-blue-700" : "bg-orange-50 text-orange-700"}`}>{entry.action === "assigned" ? "Assignment" : "Remark"}</span><span className="text-xs text-gray-500">{dateTime(entry.created_t)}</span></div>
              {editing?.id === entry.id ? (
                <form onSubmit={saveEdit}>
                  <fieldset disabled={busy} className="space-y-3">
                    <label className="block text-sm font-medium">Edit remark<textarea required rows={3} value={editRemarks} onChange={(event) => setEditRemarks(event.target.value)} className={inputClass} /></label>
                    <div>
                      <label htmlFor={`${formId}-edit-date`} className="block text-sm font-medium">Follow-up date</label>
                      <div className="mt-1">
                        <DatePicker
                          id={`${formId}-edit-date`}
                          name="next_date"
                          label="Follow-up date"
                          value={editDate}
                          onValueChange={setEditDate}
                          disabled={busy}
                        />
                      </div>
                    </div>
                    <div className="flex gap-3"><button type="submit" className="rounded-lg bg-brand-orange px-4 py-2 text-sm font-semibold text-white">Save changes</button><button type="button" onClick={() => setEditing(null)} className="px-3 py-2 text-sm text-gray-600">Cancel</button></div>
                  </fieldset>
                </form>
              ) : <>
                <p className="whitespace-pre-wrap break-words text-sm text-gray-700">{entry.remarks}</p>
                {entry.action === "assigned" && <p className="mt-2 break-words text-xs text-gray-500">{entry.assigned_from?.name ? `From ${entry.assigned_from.name} → ` : "Assigned to "}{entry.assigned_to?.name || "Unspecified"}{entry.reason && ` · Reason: ${entry.reason}`}</p>}
                {entry.next_date && <p className="mt-2 text-sm font-medium text-brand-orange">Follow-up: {parseCalendarDate(entry.next_date)?.toLocaleDateString() || entry.next_date}</p>}
                {entry.created_by?.name && <p className="mt-2 break-all text-xs text-gray-400">Added by {entry.created_by.name}</p>}
                {entry.action === "remark" && <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                  <button type="button" disabled={busy || editing !== null} onClick={() => { setEditing(entry); setEditRemarks(entry.remarks); setEditDate(entry.next_date || ""); setPendingDelete(null); }} className="font-medium text-brand-orange disabled:opacity-50">Edit</button>
                  {pendingDelete === entry.id ? <><span className="text-gray-600">Delete this remark?</span><button type="button" disabled={busy} onClick={() => void mutate(() => enquiryService.deleteHistory(entry), "Remark deleted.")} className="font-semibold text-red-600 disabled:opacity-50">Confirm delete</button><button type="button" disabled={busy} onClick={() => setPendingDelete(null)}>Cancel</button></> : <button type="button" disabled={busy || editing !== null} onClick={() => setPendingDelete(entry.id)} className="text-red-600 disabled:opacity-50">Delete</button>}
                </div>}
              </>}
            </li>)}
          </ol>
        )}
      </div>
      {!loadError && (page > 1 || moreRecords) && <nav aria-label="History pages" className="mt-5 flex items-center justify-between text-sm"><button type="button" disabled={loading || busy || page <= 1} onClick={() => { setPage(page - 1); setEditing(null); }} className="disabled:opacity-40">Previous</button><span>Page {page}</span><button type="button" disabled={loading || busy || !moreRecords} onClick={() => { setPage(page + 1); setEditing(null); }} className="disabled:opacity-40">Next</button></nav>}
    </section>
  );
}
