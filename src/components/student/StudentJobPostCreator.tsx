"use client";

import { useRef, useState } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import studentService from "@/services/student.service";

export default function StudentJobPostCreator({
  onCreated,
}: {
  onCreated: () => void;
}) {
  const [formOpen, setFormOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [banner, setBanner] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!banner) {
      setSubmitError("Please select a banner image.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);
    try {
      await studentService.createPost({
        title: title.trim(),
        banner,
        description,
      });
      setTitle("");
      setDescription("");
      setBanner(null);
      formRef.current?.reset();
      setFormOpen(false);
      setSubmitSuccess("Your job post was created.");
      onCreated();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Unable to create job post. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="shrink-0">
      <button
        type="button"
        onClick={() => {
          setFormOpen((open) => !open);
          setSubmitError(null);
          setSubmitSuccess(null);
        }}
        aria-expanded={formOpen}
        className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        style={{ background: "#E8621A" }}
      >
        <AiOutlinePlus className="h-4 w-4" />
        Create job post
      </button>

      {submitSuccess && (
        <p role="status" className="mt-3 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700">
          {submitSuccess}
        </p>
      )}

      {formOpen && (
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="mt-4 grid gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:grid-cols-2"
        >
          <div>
            <label htmlFor="job-post-title" className="mb-1.5 block text-sm font-medium text-gray-700">
              Job title <span className="text-red-500">*</span>
            </label>
            <input
              id="job-post-title"
              name="title"
              type="text"
              required
              maxLength={200}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Looking for a mathematics tutor"
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition-colors focus:border-orange-400"
            />
          </div>
          <div>
            <label htmlFor="job-post-banner" className="mb-1.5 block text-sm font-medium text-gray-700">
              Banner image <span className="text-red-500">*</span>
            </label>
            <input
              id="job-post-banner"
              name="banner"
              type="file"
              accept="image/*"
              required
              onChange={(event) => setBanner(event.target.files?.[0] ?? null)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-orange-50 file:px-3 file:py-1.5 file:font-medium file:text-orange-700"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="job-post-description" className="mb-1.5 block text-sm font-medium text-gray-700">
              Description <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <textarea
              id="job-post-description"
              name="description"
              rows={3}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Add details about the subject, level, or schedule"
              className="w-full resize-y rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition-colors focus:border-orange-400"
            />
          </div>
          {submitError && (
            <p role="alert" className="text-sm text-red-600 sm:col-span-2">{submitError}</p>
          )}
          <div className="flex justify-end gap-2 sm:col-span-2">
            <button
              type="button"
              onClick={() => {
                setFormOpen(false);
                setSubmitError(null);
              }}
              disabled={submitting}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              style={{ background: "#E8621A" }}
            >
              {submitting ? "Posting…" : "Post job"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
