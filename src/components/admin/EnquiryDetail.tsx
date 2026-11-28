"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import BackLink from "@/components/common/BackLink";
import Select from "@/components/ui/Select";
import EnquiryStatusBadge from "@/components/admin/EnquiryStatusBadge";
import EnquiryEditor from "@/components/admin/EnquiryEditor";
import EnquiryHistory from "@/components/admin/EnquiryHistory";
import enquiryService, { type EnquiryRecord, type EnquiryStatus } from "@/services/enquiry.service";
import staffService, { type StaffRecord } from "@/services/staff.service";
import { getRole, subscribeToRoleChanges } from "@/utils/auth";
import { notifySuccess } from "@/lib/notifications";

function Assignment({ enquiry, onSaved }: { enquiry: EnquiryRecord; onSaved: () => void }) {
  const [staff, setStaff] = useState<StaffRecord[]>([]);
  const [staffId, setStaffId] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [revision, setRevision] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const lock = useRef(false);
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true); setLoadError("");
      try { const result = await staffService.getActive(controller.signal); if (!controller.signal.aborted) setStaff(result); }
      catch (error) { if (!controller.signal.aborted) setLoadError(error instanceof Error ? error.message : "Unable to load staff."); }
      finally { if (!controller.signal.aborted) setLoading(false); }
    }
    void load(); return () => controller.abort();
  }, [revision]);
  async function assign(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lock.current) return;
    if (!staffId) { setError("Select an active staff member."); return; }
    lock.current = true; setSaving(true); setError("");
    try { await enquiryService.assign(enquiry.id, staffId, reason); notifySuccess("Enquiry assigned.", "enquiry-assign"); onSaved(); }
    catch (error) { setError(error instanceof Error ? error.message : "Unable to assign enquiry."); }
    finally { lock.current = false; setSaving(false); }
  }
  return <form onSubmit={assign} className="rounded-2xl border border-gray-200 bg-white p-5">
    <h2 className="font-semibold text-brand-navy">Assignment</h2><p className="mt-2 break-words text-sm text-gray-500">Assigned to: {enquiry.assigned_to?.name || "Not assigned"}</p>
    {loadError && <p role="alert" className="mt-3 text-sm text-red-600">{loadError} <button type="button" onClick={() => setRevision((value) => value + 1)} className="underline">Try again</button></p>}
    <fieldset disabled={loading || saving || !!loadError} className="mt-4 space-y-3">
      <Select aria-label="Assign to active staff" value={staffId} onValueChange={setStaffId} options={[{ value: "", label: loading ? "Loading staff…" : "Select active staff" }, ...staff.filter((member) => member.id !== undefined).map((member) => ({ value: String(member.id), label: [member.first_name, member.last_name].filter(Boolean).join(" ") + ` (${member.email})` }))]} disabled={loading || saving || !!loadError} />
      {!loading && !loadError && staff.length === 0 && <p className="text-sm text-gray-500">No active staff available. Add staff from the dashboard.</p>}
      <label className="block text-sm font-medium text-gray-700">Assignment reason (optional)<textarea value={reason} onChange={(event) => setReason(event.target.value)} rows={2} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" /></label>
      <button type="submit" disabled={staff.length === 0} className="rounded-lg bg-brand-orange px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Assigning…" : enquiry.assigned_to ? "Reassign enquiry" : "Assign enquiry"}</button>
    </fieldset>
    {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
  </form>;
}

function StatusControl({ enquiry, onSaved }: { enquiry: EnquiryRecord; onSaved: () => void }) {
  const [statuses, setStatuses] = useState<EnquiryStatus[]>([]);
  const [statusId, setStatusId] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [revision, setRevision] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const lock = useRef(false);
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true); setLoadError("");
      try { const result = await enquiryService.getActiveStatuses(controller.signal); if (!controller.signal.aborted) setStatuses(result); }
      catch (error) { if (!controller.signal.aborted) setLoadError(error instanceof Error ? error.message : "Unable to load statuses."); }
      finally { if (!controller.signal.aborted) setLoading(false); }
    }
    void load(); return () => controller.abort();
  }, [revision]);
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (lock.current) return;
    if (!statusId) { setError("Select an active status."); return; }
    lock.current = true; setSaving(true); setError("");
    try { await enquiryService.update(enquiry.id, { status: Number(statusId) }); notifySuccess("Enquiry status updated.", "enquiry-status"); onSaved(); }
    catch (error) { setError(error instanceof Error ? error.message : "Unable to update status."); }
    finally { lock.current = false; setSaving(false); }
  }
  return <form onSubmit={save} className="rounded-2xl border border-gray-200 bg-white p-5">
    <h2 className="mb-3 font-semibold text-brand-navy">Update status</h2><EnquiryStatusBadge status={enquiry.status} />
    <p className="my-3 text-xs text-gray-500">Use a Closed status when the enquiry is resolved.</p>
    {loadError && <p role="alert" className="mb-3 text-sm text-red-600">{loadError} <button type="button" onClick={() => setRevision((value) => value + 1)} className="underline">Try again</button></p>}
    <Select aria-label="New enquiry status" value={statusId} onValueChange={setStatusId} options={[{ value: "", label: loading ? "Loading statuses…" : "Select active status" }, ...statuses.map((status) => ({ value: String(status.id), label: status.name }))]} disabled={loading || saving || !!loadError} />
    {!loading && !loadError && statuses.length === 0 && <p className="mt-2 text-sm text-gray-500">Create an active status in Enquiry Statuses first.</p>}
    <button type="submit" disabled={loading || saving || !statusId || !!loadError} className="mt-3 rounded-lg bg-brand-orange px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Saving…" : "Update status"}</button>
    {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
  </form>;
}

export default function EnquiryDetail({ enquiryId }: { enquiryId: number }) {
  const role = useSyncExternalStore(subscribeToRoleChanges, getRole, () => null);
  const [enquiry, setEnquiry] = useState<EnquiryRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  const [editing, setEditing] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true); setError("");
      try { const result = await enquiryService.getById(enquiryId, controller.signal); if (!controller.signal.aborted) setEnquiry(result); }
      catch (error) { if (!controller.signal.aborted) setError(error instanceof Error ? error.message : "Unable to load enquiry."); }
      finally { if (!controller.signal.aborted) setLoading(false); }
    }
    void load(); return () => controller.abort();
  }, [enquiryId, revision]);
  function refresh() { setEditing(false); setRevision((value) => value + 1); }
  return <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
    <BackLink href="/admin/enquiries">Enquiries</BackLink>
    {error ? <div role="alert" className="mt-6 rounded-xl bg-red-50 p-5 text-sm text-red-700">{error} <button type="button" onClick={refresh} className="underline">Try again</button></div> : loading ? <p role="status" className="py-10 text-sm text-gray-500">Loading enquiry…</p> : enquiry && <>
      <div className="my-6 flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-bold text-brand-navy">Enquiry #{enquiry.id}</h1><p className="mt-2 text-sm text-gray-500">{enquiry.mentor?.name ? `Mentor: ${enquiry.mentor.name}` : "Mentor unavailable"}</p></div><div className="flex items-center gap-3"><EnquiryStatusBadge status={enquiry.status} /><button type="button" onClick={() => setEditing((value) => !value)} className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold">{editing ? "Cancel editing" : "Edit enquiry"}</button></div></div>
      <div className="space-y-6">
        {editing ? <EnquiryEditor enquiry={enquiry} onSaved={refresh} onCancel={() => setEditing(false)} /> : <section className="rounded-2xl border border-gray-200 bg-white p-5"><h2 className="mb-4 text-lg font-semibold text-brand-navy">Contact &amp; enquiry details</h2><dl className="grid gap-4 text-sm sm:grid-cols-2">
          {[ ["Name", enquiry.name], ["Enquirer type", enquiry.enquirer_type], ["Phone", enquiry.phone], ["Email", enquiry.email], ["Class of interest", enquiry.class_of_interest], ["Subject of interest", enquiry.subject_of_interest], ["Assigned to", enquiry.assigned_to?.name], ["Created", enquiry.created_t ? new Date(enquiry.created_t).toLocaleString() : ""] ].map(([label, value]) => <div key={label}><dt className="font-medium text-gray-700">{label}</dt><dd className="mt-1 break-words text-gray-500">{value || "Not provided"}</dd></div>)}
          <div className="sm:col-span-2"><dt className="font-medium text-gray-700">Message</dt><dd className="mt-1 whitespace-pre-wrap break-words text-gray-500">{enquiry.message}</dd></div>
        </dl></section>}
        {!editing && <div className="grid items-start gap-6 md:grid-cols-2"><StatusControl enquiry={enquiry} onSaved={refresh} />{role === "admin" && <Assignment enquiry={enquiry} onSaved={refresh} />}</div>}
        <EnquiryHistory key={`${enquiry.id}-${revision}`} enquiryId={enquiry.id} />
      </div>
    </>}
  </main>;
}
