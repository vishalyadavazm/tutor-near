"use client";

import BackLink from "@/components/common/BackLink";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  AiOutlineBook,
  AiOutlineDelete,
  AiOutlineEdit,
  AiOutlinePlus,
  AiOutlineReload,
  AiOutlineSafetyCertificate,
} from "react-icons/ai";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { notifySuccess } from "@/lib/notifications";
import { getRole, subscribeToRoleChanges } from "@/utils/auth";
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
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ReferenceRecord | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [degreeName, setDegreeName] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const inFlight = useRef(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const isCourses = type === "courses";
  const title = isCourses ? "Courses" : "Qualifications";
  const role = useSyncExternalStore(subscribeToRoleChanges, getRole, () => null);
  const canAdd = role === "admin";

  useEffect(() => {
    if (showCreateForm) nameRef.current?.focus();
  }, [showCreateForm]);

  useEffect(() => {
    if (!pendingDelete) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && deletingId === null) setPendingDelete(null);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [pendingDelete, deletingId]);

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

  function resetForm() {
    setName("");
    setDescription("");
    setDegreeName("");
    setFieldError("");
    setSubmitError("");
    setEditingId(null);
  }

  function cancelCreate() {
    if (submitting) return;
    resetForm();
    setShowCreateForm(false);
  }

  async function submitCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return;

    if (isCourses) {
      if (!name.trim()) {
        setFieldError("Enter a course name.");
        nameRef.current?.focus();
        return;
      }
      if (name.trim().length > 100) {
        setFieldError("Course name must be 100 characters or fewer.");
        nameRef.current?.focus();
        return;
      }
      if (!description.trim()) {
        setFieldError("Enter a course description.");
        event.currentTarget.querySelector<HTMLTextAreaElement>("#course-description")?.focus();
        return;
      }
    } else {
      if (!degreeName.trim()) {
        setFieldError("Enter a qualification name.");
        nameRef.current?.focus();
        return;
      }
      if (degreeName.trim().length > 100) {
        setFieldError("Qualification name must be 100 characters or fewer.");
        nameRef.current?.focus();
        return;
      }
    }

    inFlight.current = true;
    setSubmitting(true);
    setFieldError("");
    setSubmitError("");
    const isEditing = editingId !== null;
    try {
      if (isCourses) {
        const coursePayload = {
          name: name.trim(),
          description: description.trim(),
        };
        if (editingId !== null) {
          await mentorService.updateCourse(editingId, coursePayload);
        } else {
          await mentorService.createCourse(coursePayload);
        }
      } else {
        const qualificationPayload = {
          degree_name: degreeName.trim(),
        };
        if (editingId !== null) {
          await mentorService.updateQualification(editingId, qualificationPayload);
        } else {
          await mentorService.createQualification(qualificationPayload);
        }
      }
      resetForm();
      setShowCreateForm(false);
      notifySuccess(
        `${isCourses ? "Course" : "Qualification"} ${isEditing ? "updated" : "created"} successfully.`,
        `admin-${type}-${isEditing ? "update" : "create"}`,
      );
      setRefreshKey((current) => current + 1);
    } catch (submitCreateError) {
      setSubmitError(
        submitCreateError instanceof Error
          ? submitCreateError.message
          : `Unable to create ${title.toLowerCase()}.`,
      );
    } finally {
      inFlight.current = false;
      setSubmitting(false);
    }
  }

  function startEdit(record: ReferenceRecord) {
    resetForm();
    setEditingId(record.id);
    if ("name" in record) {
      setName(record.name);
      setDescription(record.description ?? "");
    } else {
      setDegreeName(record.degree_name);
    }
    setShowCreateForm(true);
  }

  async function deleteRecord(record: ReferenceRecord) {
    setDeletingId(record.id);
    setPendingDelete(null);
    setSubmitError("");
    try {
      if (isCourses) {
        await mentorService.deleteCourse(record.id);
      } else {
        await mentorService.deleteQualification(record.id);
      }
      notifySuccess(
        `${isCourses ? "Course" : "Qualification"} deleted successfully.`,
        `admin-${type}-delete`,
      );
      setRefreshKey((current) => current + 1);
    } catch (deleteError) {
      setSubmitError(
        deleteError instanceof Error
          ? deleteError.message
          : `Unable to delete ${title.toLowerCase()}.`,
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="bg-[#F5F7FB] text-gray-900">

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
              {canAdd ? "Add and view" : "View"} {title.toLowerCase()} configured for TutorNear.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {canAdd && (
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowCreateForm(true);
                }}
                disabled={showCreateForm}
                className="inline-flex items-center gap-2 rounded-lg bg-brand-orange px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <AiOutlinePlus />
                Add {isCourses ? "course" : "qualification"}
              </button>
            )}
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
        </div>

        {showCreateForm && canAdd && (
          <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-semibold text-brand-navy">
              {editingId !== null ? "Edit" : "Add"} {isCourses ? "course" : "qualification"}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {isCourses
                ? `${editingId !== null ? "Update" : "Create"} a course that tutors can select in their profiles.`
                : `${editingId !== null ? "Update" : "Create"} a qualification that tutors can select in their profiles.`}
            </p>
            <form onSubmit={submitCreate} noValidate className="mt-5">
              <fieldset disabled={submitting} className="grid gap-4">
                {isCourses ? (
                  <>
                    <Input
                      ref={nameRef}
                      id="course-name"
                      name="name"
                      label="Course name"
                      placeholder="e.g. Class 10 Mathematics"
                      value={name}
                      onChange={(event) => {
                        setName(event.target.value);
                        setFieldError("");
                        setSubmitError("");
                      }}
                      error={fieldError && fieldError.toLowerCase().includes("course") && fieldError.toLowerCase().includes("name") ? fieldError : undefined}
                      maxLength={100}
                      required
                    />
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="course-description" className="text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <textarea
                        id="course-description"
                        name="description"
                        value={description}
                        onChange={(event) => {
                          setDescription(event.target.value);
                          setFieldError("");
                          setSubmitError("");
                        }}
                        placeholder="Describe the course or class"
                        rows={3}
                        required
                        className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 hover:border-gray-300 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20"
                      />
                    </div>
                  </>
                ) : (
                  <Input
                    ref={nameRef}
                    id="qualification-name"
                    name="degree_name"
                    label="Qualification name"
                    placeholder="e.g. Bachelor of Science"
                    value={degreeName}
                    onChange={(event) => {
                      setDegreeName(event.target.value);
                      setFieldError("");
                      setSubmitError("");
                    }}
                    error={fieldError || undefined}
                    maxLength={100}
                    required
                  />
                )}
              </fieldset>
              {submitError && (
                <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {submitError}
                </p>
              )}
              {isCourses && fieldError && (
                <p role="alert" className="mt-2 text-sm text-red-600">{fieldError}</p>
              )}
              <div className="mt-5 flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  onClick={cancelCreate}
                  disabled={submitting}
                  className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-60"
                >
                  Cancel
                </button>
                <Button
                  type="submit"
                  loading={submitting}
                  loadingText={editingId !== null ? "Saving..." : "Creating..."}
                  className="w-full sm:w-auto sm:px-6"
                >
                  {editingId !== null ? "Save changes" : `Create ${isCourses ? "course" : "qualification"}`}
                </Button>
              </div>
            </form>
          </section>
        )}

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

          {!showCreateForm && submitError && (
            <p role="alert" className="m-5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {submitError}
            </p>
          )}

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
                  <div className="min-w-0">
                    <span className="block break-words font-medium text-gray-800">
                      {"name" in record ? record.name : record.degree_name}
                    </span>
                    {"name" in record && record.description && (
                      <span className="mt-1 block break-words text-xs text-gray-500">
                        {record.description}
                      </span>
                    )}
                  </div>
                  {canAdd && (
                    <div className="flex shrink-0 items-center gap-1">
                      <span className="mr-2 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500">
                        #{record.id}
                      </span>
                      <button
                        type="button"
                        onClick={() => startEdit(record)}
                        disabled={showCreateForm || deletingId === record.id}
                        aria-label={`Edit ${"name" in record ? record.name : record.degree_name}`}
                        title="Edit"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <AiOutlineEdit className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setPendingDelete(record)}
                        disabled={showCreateForm || deletingId === record.id}
                        aria-label={`Delete ${"name" in record ? record.name : record.degree_name}`}
                        title="Delete"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deletingId === record.id
                          ? <AiOutlineReload className="h-4 w-4 animate-spin" />
                          : <AiOutlineDelete className="h-4 w-4" />}
                      </button>
                    </div>
                  )}
                  {!canAdd && (
                    <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500">
                      #{record.id}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
      {pendingDelete && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#15213D]/50 px-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && deletingId === null) setPendingDelete(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-reference-dialog-title"
            aria-describedby="delete-reference-dialog-description"
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
              <AiOutlineDelete className="h-6 w-6" />
            </div>
            <h2
              id="delete-reference-dialog-title"
              className="mt-4 text-center text-lg font-bold text-brand-navy"
            >
              Delete {isCourses ? "course" : "qualification"}?
            </h2>
            <p
              id="delete-reference-dialog-description"
              className="mt-2 text-center text-sm text-gray-500"
            >
              Are you sure you want to delete &ldquo;{
                "name" in pendingDelete ? pendingDelete.name : pendingDelete.degree_name
              }&rdquo;? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                autoFocus
                onClick={() => setPendingDelete(null)}
                disabled={deletingId !== null}
                className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void deleteRecord(pendingDelete)}
                disabled={deletingId !== null}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deletingId !== null && <AiOutlineReload className="h-4 w-4 animate-spin" />}
                {deletingId !== null ? "Deleting..." : "Yes, delete"}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
