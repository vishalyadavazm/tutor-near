"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AiOutlineUser,
  AiOutlineCamera,
  AiOutlineMail,
  AiOutlineEnvironment,
  AiOutlineCheckCircle,
  AiOutlineSave,
  AiOutlineArrowLeft,
  AiOutlineCalendar,
} from "react-icons/ai";
import {
  BsStarFill,
  BsStar,
  BsShieldCheck,
  BsLightbulb,
} from "react-icons/bs";
import { FiBookOpen, FiZap } from "react-icons/fi";
import { MdOutlineSchool, MdOutlineWork } from "react-icons/md";
import AuthService from "@/services/auth.service";
import mentorService, {
  CourseOption,
  QualificationOption,
  DocumentNameOption,
  MentorProfileRecord,
} from "@/services/mentor.service";

const NAVY = "#15213D";
const ORANGE = "#E8621A";
const ORANGE_BG = "#FFF3EC";
const ORANGE_BORDER = "#F8C9A8";
const NAVY_BG = "#EEF0F6";

const GENDERS = ["Male", "Female", "Other"];

/* ─── Section card wrapper ─────────────────────────── */
function SectionCard({
  icon,
  title,
  optional,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: ORANGE_BG, color: ORANGE }}
        >
          {icon}
        </div>
        <h2 className="text-sm font-semibold" style={{ color: NAVY }}>
          {title}
        </h2>
        {optional && (
          <span
            className="ml-auto text-[10px] font-medium px-2 py-0.5 rounded-full"
            style={{ background: NAVY_BG, color: "#6B7280" }}
          >
            Optional
          </span>
        )}
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

/* ─── Multi-select tags for id-based options ────────── */
function IdTagSelector({
  label,
  options,
  selected,
  onToggle,
  loading,
  emptyText,
}: {
  label?: string;
  options: { id: number; label: string }[];
  selected: number[];
  onToggle: (id: number) => void;
  loading?: boolean;
  emptyText?: string;
}) {
  return (
    <div>
      {label && (
        <div className="text-xs font-medium text-gray-700 mb-2">{label}</div>
      )}
      {loading ? (
        <p className="text-xs text-gray-400">Loading options…</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {options.map((opt) => {
            const on = selected.includes(opt.id);
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onToggle(opt.id)}
                className="px-3 py-1.5 rounded-xl text-xs font-medium border transition-all duration-150"
                style={
                  on
                    ? { background: ORANGE_BG, color: ORANGE, borderColor: ORANGE_BORDER }
                    : { background: "#F9FAFB", color: "#6B7280", borderColor: "#E5E7EB" }
                }
              >
                {on ? "✓ " : ""}{opt.label}
              </button>
            );
          })}
          {options.length === 0 && (
            <span className="text-xs text-gray-300 italic">{emptyText ?? "No options available"}</span>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Input field helper ────────────────────────────── */
function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-gray-700">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-gray-400">{hint}</p>}
    </div>
  );
}

const inputCls =
  "w-full px-3.5 py-2.5 text-sm text-gray-900 border border-gray-200 rounded-xl outline-none bg-white placeholder:text-gray-400 hover:border-gray-300 focus:border-orange-400 focus:ring-2 transition-all";

const inputFocusStyle = { "--tw-ring-color": `${ORANGE}30` } as React.CSSProperties;

/* ─── Completion helper ─────────────────────────────── */
function calcCompletion(f: {
  hasPhoto: boolean;
  gender: string;
  dob: string;
  totalExperience: string;
  expertise: string;
  about: string;
  tempAddress: string;
  permanentAddress: string;
  city: string;
  stateName: string;
  country: string;
  courseIds: number[];
  qualificationIds: number[];
}): { pct: number; items: { label: string; done: boolean }[] } {
  const items = [
    { label: "Profile photo", done: f.hasPhoto },
    { label: "Gender & date of birth", done: !!f.gender && !!f.dob },
    { label: "About / Bio (30+ chars)", done: f.about.trim().length > 30 },
    { label: "Expertise", done: !!f.expertise.trim() },
    { label: "Courses you teach", done: f.courseIds.length > 0 },
    { label: "Years of experience", done: !!f.totalExperience.trim() },
    { label: "Highest qualification", done: f.qualificationIds.length > 0 },
    { label: "Temporary & permanent address", done: !!f.tempAddress.trim() && !!f.permanentAddress.trim() },
    { label: "City, state & country", done: !!f.city.trim() && !!f.stateName.trim() && !!f.country.trim() },
  ];
  const done = items.filter((i) => i.done).length;
  return { pct: Math.round((done / items.length) * 100), items };
}

/* ─── Stars ─────────────────────────────────────────── */
function Stars({ n }: { n: number }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) =>
        i <= n ? (
          <BsStarFill key={i} className="w-2.5 h-2.5 text-amber-400" />
        ) : (
          <BsStar key={i} className="w-2.5 h-2.5 text-gray-200" />
        ),
      )}
    </span>
  );
}

/* ─── Main component ────────────────────────────────── */
export default function TeacherProfile() {
  const router = useRouter();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const idProofInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  /* Basic identity (display only — not part of the mentor profile payload) */
  const [photoUrl, setPhotoUrl] = useState<string>("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [firstName, setFirstName] = useState("Teacher");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("teacher@example.com");

  /* Existing profile fetched from the API, if the teacher already created one */
  const [existingProfile, setExistingProfile] = useState<MentorProfileRecord | null>(null);
  const [existingIdentityFileUrl, setExistingIdentityFileUrl] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  /* Mentor profile fields */
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [totalExperience, setTotalExperience] = useState("");
  const [expertise, setExpertise] = useState("");
  const [about, setAbout] = useState("");
  const [tempAddress, setTempAddress] = useState("");
  const [permanentAddress, setPermanentAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [country, setCountry] = useState("India");
  const [courseIds, setCourseIds] = useState<number[]>([]);
  const [qualificationIds, setQualificationIds] = useState<number[]>([]);

  /* Optional identity verification */
  const [identityFile, setIdentityFile] = useState<File | null>(null);
  const [identityDocId, setIdentityDocId] = useState<number | undefined>(undefined);

  /* Dropdown option lists fetched from the API */
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [qualificationOptions, setQualificationOptions] = useState<QualificationOption[]>([]);
  const [documentNames, setDocumentNames] = useState<DocumentNameOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [optionsError, setOptionsError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [coursesRes, qualificationsRes, documentNamesRes, profilesRes] = await Promise.all([
          mentorService.getCourses(),
          mentorService.getQualifications(),
          mentorService.getDocumentNames(),
          mentorService.getProfiles(),
        ]);
        if (cancelled) return;
        setCourses(coursesRes);
        setQualificationOptions(qualificationsRes);
        setDocumentNames(documentNamesRes);

        const existing = profilesRes[0] ?? null;
        setExistingProfile(existing);
        if (existing) {
          if (existing.user?.name) setEmail(existing.user.name);
          setGender(existing.gender || "");
          setDob(existing.date_of_birth || "");
          setTotalExperience(
            existing.total_expierence_in_years !== null ? String(existing.total_expierence_in_years) : "",
          );
          setExpertise(existing.expertise || "");
          setAbout(existing.about || "");
          setTempAddress(existing.temp_address || "");
          setPermanentAddress(existing.permanent_address || "");
          setCity(existing.city || "");
          setStateName(existing.state || "");
          setCountry(existing.country || "India");
          setCourseIds(existing.courses_can_teach.map((c) => c.id));
          setQualificationIds(existing.highest_qualification);
          setIdentityDocId(existing.identity_verification_name?.id);
          if (existing.profile_pic) setPhotoUrl(existing.profile_pic);
          if (existing.identity_verification) setExistingIdentityFileUrl(existing.identity_verification);
        }
      } catch {
        if (!cancelled) setOptionsError("Couldn't load form options. Please refresh the page.");
      } finally {
        if (!cancelled) {
          setLoadingOptions(false);
          setLoadingProfile(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  /* Computed */
  const hasExistingPhoto = !!existingProfile?.profile_pic;
  const { pct, items: completionItems } = calcCompletion({
    hasPhoto: !!photoFile || hasExistingPhoto,
    gender,
    dob,
    totalExperience,
    expertise,
    about,
    tempAddress,
    permanentAddress,
    city,
    stateName,
    country,
    courseIds,
    qualificationIds,
  });
  const initials = `${firstName[0] ?? "T"}${lastName[0] ?? ""}`.toUpperCase();
  const selectedCourseNames = courses.filter((c) => courseIds.includes(c.id)).map((c) => c.name);

  function toggleId(list: number[], id: number, setter: (v: number[]) => void) {
    setter(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoUrl(URL.createObjectURL(file));
  }

  function handleIdProofChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setIdentityFile(file);
  }

  async function handleSave() {
    setSaveError(null);

    if (!photoFile && !hasExistingPhoto) {
      setSaveError("Please upload a profile photo.");
      return;
    }
    if (
      !gender ||
      !dob ||
      !totalExperience.trim() ||
      !expertise.trim() ||
      about.trim().length <= 30 ||
      !tempAddress.trim() ||
      !permanentAddress.trim() ||
      !city.trim() ||
      !stateName.trim() ||
      !country.trim() ||
      courseIds.length === 0 ||
      qualificationIds.length === 0
    ) {
      setSaveError("Please fill in all required fields before saving.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        profile_pic: photoFile ?? undefined,
        gender,
        date_of_birth: dob,
        temp_address: tempAddress,
        permanent_address: permanentAddress,
        city,
        state: stateName,
        country,
        total_expierence_in_years: Number(totalExperience),
        expertise,
        about,
        courses_can_teach: courseIds,
        highest_qualification: qualificationIds,
        identity_verification: identityFile ?? undefined,
        identity_verification_name: identityDocId,
      };

      if (existingProfile) {
        await mentorService.updateProfile(payload);
      } else {
        await mentorService.createProfile(payload);
      }
      router.push("/dashboard");
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Unable to save profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      {/* ── Topbar ── */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-5 h-16 flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2.5 shrink-0">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: NAVY }}
            >
              <svg className="w-4 h-4" fill="white" viewBox="0 0 24 24">
                <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
              </svg>
            </div>
            <span className="text-base font-semibold" style={{ color: NAVY }}>
              TutorNear
            </span>
          </Link>

          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors ml-2"
          >
            <AiOutlineArrowLeft className="w-4 h-4" />
            Dashboard
          </Link>

          <div className="flex-1" />

          {/* Right */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60"
              style={{ background: ORANGE }}
            >
              {saving ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                    <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving…
                </>
              ) : (
                <>
                  <AiOutlineSave className="w-4 h-4" />
                  Save Profile
                </>
              )}
            </button>

            <button
              onClick={() => AuthService.logout()}
              className="hidden sm:flex px-3 py-2 rounded-xl text-xs font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 border border-gray-200 transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* ── Body ── */}
      <div className="max-w-[1400px] mx-auto px-5 py-6">

        {/* Page heading */}
        <div className="mb-6">
          <h1 className="text-xl font-bold" style={{ color: NAVY }}>My Profile</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            This is how students and parents will find you on TutorNear
          </p>
        </div>

        {loadingProfile && (
          <div className="mb-5 px-4 py-3 rounded-xl bg-blue-50 border border-blue-100 text-sm text-blue-600">
            Loading your profile…
          </div>
        )}

        {!loadingProfile && existingProfile && (
          <div className="mb-5 px-4 py-3 rounded-xl bg-blue-50 border border-blue-100 text-sm text-blue-700">
            This form has been pre-filled with your existing profile. You can update just the fields you want to change — your current photo is kept unless you choose a new one.
          </div>
        )}

        {(saveError || optionsError) && (
          <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">
            {saveError || optionsError}
          </div>
        )}

        <div className="flex gap-6 items-start">

          {/* ── Main form column ── */}
          <div className="flex-1 min-w-0 flex flex-col gap-5">

            {/* ── Photo & Basic Info ── */}
            <SectionCard icon={<AiOutlineUser className="w-4 h-4" />} title="Photo & Basic Info">
              {/* Photo upload */}
              <div className="flex items-center gap-5 mb-6 pb-5 border-b border-gray-100">
                <div className="relative shrink-0">
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt="Profile"
                      className="w-20 h-20 rounded-2xl object-cover border-2 border-orange-200"
                    />
                  ) : (
                    <div
                      className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-white"
                      style={{ background: NAVY }}
                    >
                      {initials}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-white transition-all hover:opacity-90"
                    style={{ background: ORANGE }}
                  >
                    <AiOutlineCamera className="w-3.5 h-3.5" />
                  </button>
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    className="text-sm font-semibold px-4 py-2 rounded-xl border transition-all hover:bg-gray-50"
                    style={{ color: ORANGE, borderColor: ORANGE_BORDER, background: ORANGE_BG }}
                  >
                    {photoUrl ? "Change photo" : "Upload photo"}
                  </button>
                  <p className="text-xs text-gray-400 mt-1.5">
                    JPG or PNG · Max 2 MB · Recommended 400×400
                  </p>
                  {hasExistingPhoto && !photoFile ? (
                    <p className="text-xs text-gray-400 mt-0.5">
                      This is your current photo. Choose a new file to replace it.
                    </p>
                  ) : (
                    <p className="text-xs text-orange-500 mt-0.5 font-medium">
                      Required to publish your profile
                    </p>
                  )}
                </div>
              </div>

              {/* Name row */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <Field label="First Name" required>
                  <input
                    className={inputCls}
                    style={inputFocusStyle}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. Priya"
                  />
                </Field>
                <Field label="Last Name">
                  <input
                    className={inputCls}
                    style={inputFocusStyle}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g. Sharma"
                  />
                </Field>
              </div>

              <Field label="Email Address">
                <div className="flex items-center px-3.5 py-2.5 text-sm text-gray-500 border border-gray-100 rounded-xl bg-gray-50">
                  <AiOutlineMail className="w-4 h-4 mr-2 shrink-0 text-gray-400" />
                  {email}
                  <span className="ml-auto flex items-center gap-1 text-green-600 text-xs font-medium">
                    <AiOutlineCheckCircle className="w-3.5 h-3.5" /> Verified
                  </span>
                </div>
              </Field>
            </SectionCard>

            {/* ── Personal & Experience Details ── */}
            <SectionCard icon={<AiOutlineCalendar className="w-4 h-4" />} title="Personal & Experience Details">
              <div className="grid grid-cols-3 gap-4">
                <Field label="Gender" required>
                  <select
                    className={inputCls}
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                  >
                    <option value="">Select gender</option>
                    {GENDERS.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Date of Birth" required>
                  <input
                    type="date"
                    className={inputCls}
                    style={inputFocusStyle}
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                  />
                </Field>
                <Field label="Years of Experience" required>
                  <input
                    type="number"
                    min="0"
                    className={inputCls}
                    style={inputFocusStyle}
                    value={totalExperience}
                    onChange={(e) => setTotalExperience(e.target.value)}
                    placeholder="e.g. 5"
                  />
                </Field>
              </div>
            </SectionCard>

            {/* ── About & Bio ── */}
            <SectionCard icon={<FiBookOpen className="w-4 h-4" />} title="About Me">
              <Field
                label="Bio / About"
                required
                hint="Write in first person. Describe your teaching approach, strengths, and what makes you unique."
              >
                <textarea
                  className={`${inputCls} resize-none`}
                  style={inputFocusStyle}
                  rows={5}
                  value={about}
                  onChange={(e) => setAbout(e.target.value.slice(0, 600))}
                  placeholder="e.g. I'm a passionate mathematics teacher with 8+ years of experience helping students from Class 9 to JEE Advanced. My teaching focuses on concept clarity and problem-solving shortcuts..."
                />
                <div className="flex justify-between">
                  <span className="text-[11px] text-gray-400">Minimum 30 characters</span>
                  <span
                    className="text-[11px] font-medium"
                    style={{ color: about.length > 500 ? ORANGE : "#9FA9C4" }}
                  >
                    {about.length}/600
                  </span>
                </div>
              </Field>
            </SectionCard>

            {/* ── Teaching Details ── */}
            <SectionCard icon={<MdOutlineWork className="w-4 h-4" />} title="Teaching Details">
              <div className="mb-5">
                <Field
                  label="Expertise"
                  required
                  hint="A short label for what you're known for, e.g. Teaching, JEE Coaching"
                >
                  <input
                    className={inputCls}
                    style={inputFocusStyle}
                    value={expertise}
                    onChange={(e) => setExpertise(e.target.value)}
                    placeholder="e.g. Teaching"
                  />
                </Field>
              </div>

              <IdTagSelector
                label="Courses you can teach *"
                options={courses.map((c) => ({ id: c.id, label: c.name }))}
                selected={courseIds}
                onToggle={(id) => toggleId(courseIds, id, setCourseIds)}
                loading={loadingOptions}
              />
            </SectionCard>

            {/* ── Location ── */}
            <SectionCard icon={<AiOutlineEnvironment className="w-4 h-4" />} title="Location">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <Field label="Temporary Address" required>
                  <input
                    className={inputCls}
                    style={inputFocusStyle}
                    value={tempAddress}
                    onChange={(e) => setTempAddress(e.target.value)}
                    placeholder="e.g. Delhi 6"
                  />
                </Field>
                <Field label="Permanent Address" required>
                  <input
                    className={inputCls}
                    style={inputFocusStyle}
                    value={permanentAddress}
                    onChange={(e) => setPermanentAddress(e.target.value)}
                    placeholder="e.g. Mumbai Bandra"
                  />
                </Field>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Field label="City" required>
                  <input
                    className={inputCls}
                    style={inputFocusStyle}
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Delhi"
                  />
                </Field>
                <Field label="State" required>
                  <input
                    className={inputCls}
                    style={inputFocusStyle}
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    placeholder="e.g. Delhi"
                  />
                </Field>
                <Field label="Country" required>
                  <input
                    className={inputCls}
                    style={inputFocusStyle}
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="e.g. India"
                  />
                </Field>
              </div>
            </SectionCard>

            {/* ── Qualifications ── */}
            <SectionCard icon={<MdOutlineSchool className="w-4 h-4" />} title="Qualifications & Education">
              <IdTagSelector
                label="Highest qualification *"
                options={qualificationOptions.map((q) => ({ id: q.id, label: q.degree_name }))}
                selected={qualificationIds}
                onToggle={(id) => toggleId(qualificationIds, id, setQualificationIds)}
                loading={loadingOptions}
              />
            </SectionCard>

            {/* ── Identity Verification (optional) ── */}
            <SectionCard icon={<BsShieldCheck className="w-4 h-4" />} title="Identity Verification" optional>
              <div className="grid grid-cols-2 gap-4">
                <Field label="ID Document Type">
                  <select
                    className={inputCls}
                    value={identityDocId ?? ""}
                    onChange={(e) => setIdentityDocId(e.target.value ? Number(e.target.value) : undefined)}
                  >
                    <option value="">Select document type</option>
                    {documentNames.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Upload ID Proof" hint="JPG, PNG or PDF">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => idProofInputRef.current?.click()}
                      className="text-sm font-medium px-3.5 py-2.5 rounded-xl border transition-all hover:bg-gray-50 text-gray-600 border-gray-200"
                    >
                      {identityFile ? "Change file" : "Choose file"}
                    </button>
                    {identityFile ? (
                      <span className="text-xs text-gray-500 truncate">{identityFile.name}</span>
                    ) : existingIdentityFileUrl ? (
                      <a
                        href={existingIdentityFileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline truncate"
                      >
                        View current file
                      </a>
                    ) : null}
                    <input
                      ref={idProofInputRef}
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={handleIdProofChange}
                    />
                  </div>
                </Field>
              </div>
            </SectionCard>

            {/* Bottom save */}
            <div className="flex justify-end gap-3 pb-8">
              <Link
                href="/dashboard"
                className="px-5 py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
              >
                Cancel
              </Link>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60"
                style={{ background: ORANGE }}
              >
                {saving ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                      <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Saving…
                  </>
                ) : (
                  <>
                    <AiOutlineSave className="w-4 h-4" />
                    Save Profile
                  </>
                )}
              </button>
            </div>
          </div>

          {/* ── Right sidebar ── */}
          <aside className="hidden xl:flex flex-col w-72 shrink-0 sticky top-24 self-start gap-4">

            {/* Profile completion */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: ORANGE_BG }}
                >
                  <FiZap className="w-3.5 h-3.5" style={{ color: ORANGE }} />
                </div>
                <h3 className="text-sm font-semibold" style={{ color: NAVY }}>
                  Profile Strength
                </h3>
              </div>

              {/* Progress ring */}
              <div className="flex flex-col items-center mb-4">
                <div className="relative">
                  <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#F3F4F6" strokeWidth="9" />
                    <circle
                      cx="50" cy="50" r="40" fill="none"
                      stroke={pct >= 80 ? "#16A34A" : pct >= 40 ? ORANGE : "#E5E7EB"}
                      strokeWidth="9" strokeLinecap="round"
                      strokeDasharray={`${(2 * Math.PI * 40 * pct) / 100} ${2 * Math.PI * 40}`}
                      style={{ transition: "stroke-dasharray 0.5s ease" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span
                      className="text-xl font-bold"
                      style={{ color: pct >= 80 ? "#16A34A" : NAVY }}
                    >
                      {pct}%
                    </span>
                    <span className="text-[10px] text-gray-400">complete</span>
                  </div>
                </div>
                <div className="text-xs text-center text-gray-500 mt-1">
                  {pct < 100
                    ? `${completionItems.filter((i) => !i.done).length} sections remaining`
                    : "Profile complete! 🎉"}
                </div>
              </div>

              {/* Checklist */}
              <div className="flex flex-col gap-2">
                {completionItems.map((item) => (
                  <div key={item.label} className="flex items-center gap-2.5">
                    {item.done ? (
                      <AiOutlineCheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-gray-200 shrink-0" />
                    )}
                    <span
                      className={`text-xs flex-1 ${
                        item.done ? "text-green-700 line-through" : "text-gray-600"
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Live preview */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Student Preview
              </div>
              <div className="border border-gray-100 rounded-xl p-3">
                <div className="flex items-start gap-3 mb-3">
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt="preview"
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                      style={{ background: NAVY }}
                    >
                      {initials}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-semibold text-gray-900 truncate">
                        {[firstName, lastName].filter(Boolean).join(" ") || "Your Name"}
                      </span>
                      <BsShieldCheck className="w-3.5 h-3.5 text-green-500 shrink-0" />
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {expertise || (selectedCourseNames.length > 0 ? selectedCourseNames.slice(0, 2).join(", ") : "Your expertise")}
                      {totalExperience ? ` · ${totalExperience} yrs` : ""}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Stars n={0} />
                      <span className="text-xs text-gray-400">No reviews yet</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-2.5">
                  {selectedCourseNames.slice(0, 3).map((s) => (
                    <span key={s} className="text-[10px] bg-gray-50 text-gray-500 px-2 py-0.5 rounded-full border border-gray-100">
                      {s}
                    </span>
                  ))}
                  {selectedCourseNames.length === 0 && (
                    <span className="text-[10px] text-gray-300 italic">No courses added</span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-gray-400 flex items-center gap-0.5">
                      <AiOutlineEnvironment className="w-3 h-3" />
                      {city || "Location not set"}
                    </div>
                  </div>
                  <button
                    className="px-2.5 py-1 text-xs font-medium rounded-lg border border-gray-200 text-gray-400 cursor-default"
                    disabled
                  >
                    Contact
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-gray-400 mt-2 text-center">
                This is how students see your card
              </p>
            </div>

            {/* Tips */}
            <div
              className="rounded-2xl p-5 border"
              style={{ background: NAVY, borderColor: NAVY }}
            >
              <div className="flex items-center gap-2 mb-3">
                <BsLightbulb className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-semibold text-white">Profile Tips</span>
              </div>
              <div className="flex flex-col gap-2.5">
                {[
                  "A clear bio with your teaching philosophy increases trust by 2×",
                  "Add your highest qualification to get a verified badge",
                  "Upload an ID proof so students know you're verified",
                ].map((tip, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span
                      className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5"
                      style={{ background: ORANGE, color: "white" }}
                    >
                      {i + 1}
                    </span>
                    <span className="text-xs text-gray-300 leading-relaxed">{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
