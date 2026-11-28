"use client";

import { useEffect, useRef, useState } from "react";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import enquiryService, { type EnquiryRecord, type EnquiryPayload, type EnquiryStatus } from "@/services/enquiry.service";
import mentorService, { type MentorDirectoryEntry } from "@/services/mentor.service";
import { notifySuccess } from "@/lib/notifications";

export default function EnquiryEditor({ enquiry, onSaved, onCancel }: {
  enquiry?: EnquiryRecord;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    name: enquiry?.name || "", phone: enquiry?.phone || "", email: enquiry?.email || "",
    enquirer_type: enquiry?.enquirer_type === "parent" ? "parent" : "student",
    class_of_interest: enquiry?.class_of_interest || "", subject_of_interest: enquiry?.subject_of_interest || "",
    message: enquiry?.message || "", mentor: enquiry?.mentor ? String(enquiry.mentor.id) : "",
    status: enquiry?.status?.is_active ? String(enquiry.status.id) : "",
  });
  const [statuses, setStatuses] = useState<EnquiryStatus[]>([]);
  const [mentors, setMentors] = useState<MentorDirectoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [revision, setRevision] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const lock = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    async function loadMentors() {
      const records: MentorDirectoryEntry[] = [];
      for (let page = 1; ; page += 1) {
        const result = await mentorService.getDirectoryPage({ page, per_page: 200, sort: "first_name,last_name,id", filter: "is_verified:eq:true" }, controller.signal);
        records.push(...result.profiles);
        if (!result.moreRecords || result.profiles.length === 0) return records;
      }
    }
    async function load() {
      setLoading(true); setLoadError("");
      try {
        const [statusRecords, mentorRecords] = await Promise.all([enquiryService.getActiveStatuses(controller.signal), loadMentors()]);
        if (!controller.signal.aborted) { setStatuses(statusRecords); setMentors(mentorRecords); }
      } catch (error) {
        if (!controller.signal.aborted) setLoadError(error instanceof Error ? error.message : "Unable to load form options.");
      } finally { if (!controller.signal.aborted) setLoading(false); }
    }
    void load();
    return () => controller.abort();
  }, [revision]);

  function change(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lock.current) return;
    if (!form.name.trim() || !form.phone.trim() || !form.message.trim() || (!enquiry && !form.mentor)) {
      setError("Name, phone, message, and a verified mentor are required."); return;
    }
    lock.current = true; setSaving(true); setError("");
    const values = {
      name: form.name.trim(), phone: form.phone.trim(), email: form.email.trim(),
      enquirer_type: form.enquirer_type as "student" | "parent", message: form.message.trim(),
      class_of_interest: form.class_of_interest.trim(), subject_of_interest: form.subject_of_interest.trim(),
    };
    try {
      if (enquiry) {
        await enquiryService.update(enquiry.id, {
          ...values,
          ...(form.mentor && Number(form.mentor) !== enquiry.mentor?.id ? { mentor: Number(form.mentor) } : {}),
          ...(form.status && Number(form.status) !== enquiry.status?.id ? { status: Number(form.status) } : {}),
        });
      } else {
        const payload: EnquiryPayload = { ...values, mentor: Number(form.mentor), ...(form.status ? { status: Number(form.status) } : {}) };
        await enquiryService.create(payload);
      }
      notifySuccess(enquiry ? "Enquiry updated." : "Enquiry created.", "enquiry-save");
      onSaved();
    } catch (error) { setError(error instanceof Error ? error.message : "Unable to save enquiry."); }
    finally { lock.current = false; setSaving(false); }
  }

  const mentorOptions = mentors.map((mentor) => ({ value: String(mentor.id), label: [mentor.first_name, mentor.last_name].filter(Boolean).join(" ") || mentor.email || `Teacher #${mentor.id}` }));
  if (enquiry?.mentor && !mentorOptions.some((option) => option.value === String(enquiry.mentor?.id))) {
    mentorOptions.unshift({ value: String(enquiry.mentor.id), label: `${enquiry.mentor.name} (current mentor)` });
  }

  return (
    <form onSubmit={save} className="rounded-2xl border border-gray-200 bg-white p-5">
      <h2 className="mb-4 text-lg font-semibold text-brand-navy">{enquiry ? "Edit enquiry" : "New enquiry"}</h2>
      {loadError && <p role="alert" className="mb-4 text-sm text-red-600">{loadError} <button type="button" onClick={() => setRevision((value) => value + 1)} className="underline">Try again</button></p>}
      {loading && <p role="status" className="mb-4 text-sm text-gray-500">Loading mentors and statuses…</p>}
      <fieldset disabled={saving || loading || !!loadError} className="grid gap-4 sm:grid-cols-2">
        <Input id="enquiry-name" name="name" label="Name" value={form.name} onChange={change} maxLength={150} required />
        <Input id="enquiry-phone" name="phone" label="Phone" type="tel" value={form.phone} onChange={change} maxLength={20} required />
        <Input id="enquiry-email" name="email" label="Email (optional)" type="email" value={form.email} onChange={change} />
        <label className="text-sm font-medium text-gray-700">Enquirer type<Select aria-label="Enquirer type" value={form.enquirer_type} onValueChange={(value) => setForm((current) => ({ ...current, enquirer_type: value }))} options={[{ value: "student", label: "Student" }, { value: "parent", label: "Parent" }]} className="mt-1.5" disabled={saving || loading} /></label>
        <Input id="enquiry-class" name="class_of_interest" label="Class of interest" value={form.class_of_interest} onChange={change} />
        <Input id="enquiry-subject" name="subject_of_interest" label="Subject of interest" value={form.subject_of_interest} onChange={change} />
        <label className="text-sm font-medium text-gray-700">Mentor<Select aria-label="Enquiry mentor" value={form.mentor} onValueChange={(value) => setForm((current) => ({ ...current, mentor: value }))} options={[{ value: "", label: "Select a verified mentor", disabled: !!enquiry?.mentor }, ...mentorOptions]} className="mt-1.5" disabled={saving || loading || !!loadError} /></label>
        <label className="text-sm font-medium text-gray-700">Status<Select aria-label="Enquiry status" value={form.status} onValueChange={(value) => setForm((current) => ({ ...current, status: value }))} options={[{ value: "", label: enquiry ? "Keep current status" : "Default status" }, ...statuses.map((status) => ({ value: String(status.id), label: status.name }))]} className="mt-1.5" disabled={saving || loading || !!loadError} /></label>
        <label className="text-sm font-medium text-gray-700 sm:col-span-2">Message<textarea name="message" value={form.message} onChange={change} required rows={4} className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-orange-400" /></label>
        <div className="flex gap-3 sm:col-span-2"><button type="submit" className="rounded-lg bg-brand-orange px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Saving…" : enquiry ? "Save changes" : "Create enquiry"}</button><button type="button" onClick={onCancel} className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-600">Cancel</button></div>
      </fieldset>
      {error && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}
    </form>
  );
}
