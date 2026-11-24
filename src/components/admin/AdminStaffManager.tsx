"use client";

import { notifySuccess } from "@/lib/notifications";

import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { AiOutlinePlus, AiOutlineReload, AiOutlineTeam } from "react-icons/ai";
import BackLink from "@/components/common/BackLink";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import PasswordInput from "@/components/auth/PasswordInput";
import staffService, {
  StaffApiError,
  StaffFieldErrors,
  StaffPage,
  StaffRegistrationRequest,
} from "@/services/staff.service";

const emptyForm: StaffRegistrationRequest = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  password: "",
};
const staffSchema = z.object({
  first_name: z.string().trim().min(2, "Enter at least 2 characters."),
  last_name: z.string().trim().min(2, "Enter at least 2 characters."),
  email: z.string().trim().email("Enter a valid email address."),
  phone: z
    .string()
    .trim()
    .regex(/^\d{10}$/, "Enter a 10-digit phone number."),
  password: z
    .string()
    .min(8, "Use at least 8 characters.")
    .regex(/[A-Z]/, "Include an uppercase letter.")
    .regex(/[0-9]/, "Include a number."),
});

function CreateStaffForm({ onCreated, onCancel }: { onCreated: () => void; onCancel: () => void }) {
  const [values, setValues] = useState(emptyForm);
  const [errors, setErrors] = useState<StaffFieldErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const inFlight = useRef(false);
  const firstName = useRef<HTMLInputElement>(null);
  useEffect(() => {
    firstName.current?.focus();
  }, []);

  function change(field: keyof StaffRegistrationRequest, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setSubmitError("");
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return;
    const parsed = staffSchema.safeParse(values);
    if (!parsed.success) {
      const next: StaffFieldErrors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof StaffRegistrationRequest;
        if (!next[field]) next[field] = issue.message;
      }
      setErrors(next);
      const first = Object.keys(next)[0];
      if (first) event.currentTarget.querySelector<HTMLInputElement>(`[name="${first}"]`)?.focus();
      return;
    }
    inFlight.current = true;
    setSubmitting(true);
    setErrors({});
    setSubmitError("");
    try {
      await staffService.register(parsed.data);
      setValues(emptyForm);
      onCreated();
    } catch (error) {
      if (error instanceof StaffApiError) setErrors(error.fieldErrors);
      setSubmitError(error instanceof Error ? error.message : "Unable to create staff account.");
    } finally {
      inFlight.current = false;
      setSubmitting(false);
    }
  }

  return (
    <section
      className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6"
      aria-labelledby="create-staff-title"
    >
      <h2 id="create-staff-title" className="text-lg font-semibold text-brand-navy">
        Add staff member
      </h2>
      <p className="mt-1 text-sm text-gray-500">Create an account for a new member of your team.</p>
      <form onSubmit={submit} noValidate className="mt-5">
        <fieldset disabled={submitting} className="grid gap-4 sm:grid-cols-2">
          <legend className="sr-only">Staff account details</legend>
          <Input
            ref={firstName}
            id="staff-first-name"
            name="first_name"
            label="First name"
            autoComplete="given-name"
            value={values.first_name}
            onChange={(event) => change("first_name", event.target.value)}
            error={errors.first_name}
            required
          />
          <Input
            id="staff-last-name"
            name="last_name"
            label="Last name"
            autoComplete="family-name"
            value={values.last_name}
            onChange={(event) => change("last_name", event.target.value)}
            error={errors.last_name}
            required
          />
          <Input
            id="staff-email"
            name="email"
            label="Email address"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(event) => change("email", event.target.value)}
            error={errors.email}
            required
          />
          <Input
            id="staff-phone"
            name="phone"
            label="Phone number"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            value={values.phone}
            onChange={(event) => change("phone", event.target.value)}
            error={errors.phone}
            required
          />
          <div className="sm:col-span-2">
            <PasswordInput
              id="staff-password"
              name="password"
              label="Password"
              aria-label="Password"
              autoComplete="new-password"
              showStrength
              value={values.password}
              onChange={(event) => change("password", event.target.value)}
              error={errors.password}
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              At least 8 characters, including an uppercase letter and a number.
            </p>
          </div>
        </fieldset>
        {submitError && (
          <p
            role="alert"
            className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {submitError}
          </p>
        )}
        <div className="mt-5 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-60"
          >
            Cancel
          </button>
          <div className="w-full sm:w-44">
            <Button type="submit" loading={submitting} loadingText="Creating...">
              Create staff account
            </Button>
          </div>
        </div>
      </form>
    </section>
  );
}

export default function AdminStaffManager() {
  const [result, setResult] = useState<StaffPage>({ staff: [], moreRecords: false });
  const [page, setPage] = useState(1);
  const [refresh, setRefresh] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const addButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setError("");
      try {
        const staff = await staffService.getAll(page, 10, controller.signal);
        if (!controller.signal.aborted) setResult(staff);
      } catch (loadError) {
        if (!controller.signal.aborted)
          setError(loadError instanceof Error ? loadError.message : "Unable to load staff.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [page, refresh]);

  function closeForm() {
    setShowForm(false);
    requestAnimationFrame(() => addButton.current?.focus());
  }

  return (
    <main className="bg-[#F5F7FB] text-gray-900">
      <div className="mx-auto max-w-7xl px-4 pt-3 sm:px-6 lg:px-8">
        <BackLink href="/admin/dashboard">Admin dashboard</BackLink>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-brand-orange">ADMINISTRATION</p>
            <h1 className="mt-1 text-2xl font-bold text-brand-navy sm:text-3xl">Staff</h1>
            <p className="mt-2 text-sm text-gray-500">
              View staff accounts and add new team members.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setRefresh((current) => current + 1)}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 disabled:opacity-60"
            >
              <AiOutlineReload className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
            <button
              ref={addButton}
              type="button"
              onClick={() => {
                setShowForm(true);
              }}
              disabled={showForm}
              aria-expanded={showForm}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-orange px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
            >
              <AiOutlinePlus />
              Add staff
            </button>
          </div>
        </div>
        {showForm && (
          <CreateStaffForm
            onCancel={closeForm}
            onCreated={() => {
              closeForm();
              notifySuccess("Staff account created successfully.", "staff-create");
              setPage(1);
              setRefresh((current) => current + 1);
            }}
          />
        )}
        <section
          aria-labelledby="all-staff-title"
          className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
        >
          <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
              <AiOutlineTeam className="h-5 w-5" />
            </span>
            <div>
              <h2 id="all-staff-title" className="font-semibold text-brand-navy">
                All staff
              </h2>
              <p className="text-xs text-gray-500">
                {loading
                  ? "Loading staff..."
                  : error
                  ? "Staff unavailable"
                  : `${result.staff.length} staff member${
                      result.staff.length === 1 ? "" : "s"
                    } on this page`}
              </p>
            </div>
          </div>
          {loading ? (
            <div className="space-y-3 p-5" role="status" aria-label="Loading staff">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-16 animate-pulse rounded-xl bg-gray-100" />
              ))}
            </div>
          ) : error ? (
            <div
              role="alert"
              className="m-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              <p>{error}</p>
              <button
                type="button"
                className="mt-3 font-semibold underline"
                onClick={() => setRefresh((current) => current + 1)}
              >
                Try again
              </button>
            </div>
          ) : result.staff.length === 0 ? (
            <div className="px-5 py-14 text-center">
              <p className="font-semibold text-brand-navy">No staff accounts yet</p>
              <p className="mt-1 text-sm text-gray-500">
                Use Add staff to register your first team member.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {result.staff.map((member) => (
                <li
                  key={member.id ?? member.email}
                  className="grid gap-2 px-5 py-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_minmax(0,1fr)] sm:items-center sm:gap-4"
                >
                  <p className="min-w-0 break-words font-semibold text-brand-navy">
                    {[member.first_name, member.last_name].filter(Boolean).join(" ") ||
                      "Staff member"}
                  </p>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Email</p>
                    <a
                      href={`mailto:${member.email}`}
                      className="break-all text-sm text-gray-700 hover:text-brand-orange"
                    >
                      {member.email}
                    </a>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    {member.phone ? (
                      <a
                        href={`tel:${member.phone}`}
                        className="text-sm text-gray-700 hover:text-brand-orange"
                      >
                        {member.phone}
                      </a>
                    ) : (
                      <span className="text-sm text-gray-500">Not provided</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
          {(page > 1 || result.moreRecords) && (
            <nav
              aria-label="Staff pages"
              className="flex items-center justify-between gap-3 border-t border-gray-100 px-5 py-4 text-sm"
            >
              <button
                type="button"
                disabled={loading || page === 1}
                onClick={() => setPage((current) => current - 1)}
                className="rounded-lg border border-gray-200 px-3 py-2 disabled:opacity-50"
              >
                Previous
              </button>
              <span>Page {page}</span>
              <button
                type="button"
                disabled={loading || !result.moreRecords}
                onClick={() => setPage((current) => current + 1)}
                className="rounded-lg border border-gray-200 px-3 py-2 disabled:opacity-50"
              >
                Next
              </button>
            </nav>
          )}
        </section>
      </div>
    </main>
  );
}
