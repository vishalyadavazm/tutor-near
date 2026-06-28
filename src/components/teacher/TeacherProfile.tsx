"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  AiOutlineUser,
  AiOutlineCamera,
  AiOutlinePhone,
  AiOutlineMail,
  AiOutlineEnvironment,
  AiOutlineCheckCircle,
  AiOutlineCloseCircle,
  AiOutlinePlus,
  AiOutlineDelete,
  AiOutlineSave,
  AiOutlineArrowLeft,
} from "react-icons/ai";
import {
  BsStarFill,
  BsStar,
  BsShieldCheck,
  BsLightbulb,
  BsCurrencyRupee,
} from "react-icons/bs";
import { FiBookOpen, FiZap, FiChevronRight } from "react-icons/fi";
import { MdOutlineVideoCall, MdOutlineSchool, MdOutlineWork } from "react-icons/md";
import AuthService from "@/services/auth.service";

const NAVY = "#15213D";
const ORANGE = "#E8621A";
const ORANGE_BG = "#FFF3EC";
const ORANGE_BORDER = "#F8C9A8";
const NAVY_BG = "#EEF0F6";
const MUTED = "#9FA9C4";

const ALL_SUBJECTS = [
  "Mathematics", "Physics", "Chemistry", "Biology", "English", "Hindi",
  "History", "Geography", "Computer Science", "Economics", "Accountancy",
  "Business Studies", "Political Science", "Sociology", "Psychology",
  "Music", "Drawing / Art", "Physical Education",
];

const ALL_LEVELS = [
  "Class 1–5", "Class 6–8", "Class 9–10", "Class 11–12",
  "JEE Mains", "JEE Advanced", "NEET", "UPSC", "IELTS / TOEFL",
  "Beginner", "Intermediate", "Advanced",
];

const ALL_LANGUAGES = ["Hindi", "English", "Urdu", "Sanskrit", "Other"];

const TEACHING_MODES = ["Online", "Offline", "Both"] as const;

type TeachingMode = (typeof TEACHING_MODES)[number];

interface Qualification {
  id: number;
  degree: string;
  institution: string;
  year: string;
}

/* ─── Section card wrapper ─────────────────────────── */
function SectionCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
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
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

/* ─── Tag input ─────────────────────────────────────── */
function TagSelector({
  label,
  available,
  selected,
  onToggle,
  color = ORANGE,
}: {
  label?: string;
  available: string[];
  selected: string[];
  onToggle: (item: string) => void;
  color?: string;
}) {
  return (
    <div>
      {label && (
        <div className="text-xs font-medium text-gray-700 mb-2">{label}</div>
      )}
      <div className="flex flex-wrap gap-2">
        {available.map((item) => {
          const on = selected.includes(item);
          return (
            <button
              key={item}
              type="button"
              onClick={() => onToggle(item)}
              className="px-3 py-1.5 rounded-xl text-xs font-medium border transition-all duration-150"
              style={
                on
                  ? { background: ORANGE_BG, color: ORANGE, borderColor: ORANGE_BORDER }
                  : { background: "#F9FAFB", color: "#6B7280", borderColor: "#E5E7EB" }
              }
            >
              {on ? "✓ " : ""}{item}
            </button>
          );
        })}
      </div>
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
function calcCompletion(fields: Record<string, unknown>): {
  pct: number;
  items: { label: string; done: boolean }[];
} {
  const items = [
    { label: "Profile photo", done: !!fields.photoUrl },
    { label: "About / Bio", done: (fields.bio as string)?.trim().length > 30 },
    { label: "Teaching subjects", done: (fields.subjects as string[])?.length > 0 },
    { label: "Years of experience", done: !!(fields.experience as string)?.trim() },
    { label: "Hourly rate", done: !!(fields.rate as string)?.trim() },
    { label: "Qualifications", done: (fields.qualifications as Qualification[])?.some((q) => q.degree.trim()) },
    { label: "City & location", done: !!(fields.city as string)?.trim() },
    { label: "Teaching mode", done: !!(fields.mode as string) },
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
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  /* Form state */
  const [photoUrl, setPhotoUrl] = useState<string>("");
  const [firstName, setFirstName] = useState("Teacher");
  const [lastName, setLastName] = useState("");
  const [tagline, setTagline] = useState("");
  const [phone, setPhone] = useState("");
  const [email] = useState("teacher@example.com");
  const [bio, setBio] = useState("");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [levels, setLevels] = useState<string[]>([]);
  const [experience, setExperience] = useState("");
  const [mode, setMode] = useState<TeachingMode | "">("");
  const [rate, setRate] = useState("");
  const [languages, setLanguages] = useState<string[]>(["Hindi", "English"]);
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [qualifications, setQualifications] = useState<Qualification[]>([
    { id: 1, degree: "", institution: "", year: "" },
  ]);

  /* Computed */
  const fields = { photoUrl, bio, subjects, experience, rate, qualifications, city, mode };
  const { pct, items: completionItems } = calcCompletion(fields);
  const initials = `${firstName[0] ?? "T"}${lastName[0] ?? ""}`.toUpperCase();

  function toggleTag(list: string[], item: string, setter: (v: string[]) => void) {
    setter(list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);
  }

  function addQualification() {
    setQualifications((prev) => [
      ...prev,
      { id: Date.now(), degree: "", institution: "", year: "" },
    ]);
  }

  function removeQualification(id: number) {
    setQualifications((prev) => prev.filter((q) => q.id !== id));
  }

  function updateQualification(id: number, key: keyof Qualification, val: string) {
    setQualifications((prev) =>
      prev.map((q) => (q.id === id ? { ...q, [key]: val } : q)),
    );
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPhotoUrl(url);
  }

  async function handleSave() {
    setSaving(true);
    /* Replace with real API call */
    await new Promise((r) => setTimeout(r, 1000));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
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
            {saved && (
              <span className="hidden sm:flex items-center gap-1.5 text-xs text-green-600 font-medium">
                <AiOutlineCheckCircle className="w-4 h-4" /> Saved!
              </span>
            )}
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
                  <p className="text-xs text-orange-500 mt-0.5 font-medium">
                    Teachers with photos get 3× more inquiries
                  </p>
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

              {/* Tagline */}
              <div className="mb-4">
                <Field
                  label="Professional Tagline"
                  hint="A short headline students see first (max 80 chars)"
                >
                  <input
                    className={inputCls}
                    style={inputFocusStyle}
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value.slice(0, 80))}
                    placeholder="e.g. Expert Maths Tutor · 8 yrs exp · JEE specialist"
                  />
                  <p className="text-[11px] text-gray-400 text-right -mt-1">
                    {tagline.length}/80
                  </p>
                </Field>
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-2 gap-4">
                <Field label="Phone Number">
                  <div className="flex">
                    <span className="flex items-center px-3 bg-gray-50 border border-r-0 border-gray-200 rounded-l-xl text-sm text-gray-500">
                      +91
                    </span>
                    <input
                      className="flex-1 px-3.5 py-2.5 text-sm text-gray-900 border border-gray-200 rounded-r-xl outline-none bg-white placeholder:text-gray-400 hover:border-gray-300 focus:border-orange-400 transition-all"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      placeholder="9876543210"
                    />
                  </div>
                </Field>
                <Field label="Email Address">
                  <div className="flex items-center px-3.5 py-2.5 text-sm text-gray-500 border border-gray-100 rounded-xl bg-gray-50">
                    <AiOutlineMail className="w-4 h-4 mr-2 shrink-0 text-gray-400" />
                    {email}
                    <span className="ml-auto flex items-center gap-1 text-green-600 text-xs font-medium">
                      <AiOutlineCheckCircle className="w-3.5 h-3.5" /> Verified
                    </span>
                  </div>
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
                  value={bio}
                  onChange={(e) => setBio(e.target.value.slice(0, 600))}
                  placeholder="e.g. I'm a passionate mathematics teacher with 8+ years of experience helping students from Class 9 to JEE Advanced. My teaching focuses on concept clarity and problem-solving shortcuts..."
                />
                <div className="flex justify-between">
                  <span className="text-[11px] text-gray-400">Minimum 30 characters</span>
                  <span
                    className="text-[11px] font-medium"
                    style={{ color: bio.length > 500 ? ORANGE : MUTED }}
                  >
                    {bio.length}/600
                  </span>
                </div>
              </Field>
            </SectionCard>

            {/* ── Teaching Details ── */}
            <SectionCard icon={<MdOutlineWork className="w-4 h-4" />} title="Teaching Details">

              {/* Subjects */}
              <div className="mb-5">
                <TagSelector
                  label="Subjects you teach *"
                  available={ALL_SUBJECTS}
                  selected={subjects}
                  onToggle={(s) => toggleTag(subjects, s, setSubjects)}
                />
              </div>

              {/* Levels */}
              <div className="mb-5 pb-5 border-b border-gray-100">
                <TagSelector
                  label="Student levels / boards"
                  available={ALL_LEVELS}
                  selected={levels}
                  onToggle={(l) => toggleTag(levels, l, setLevels)}
                />
              </div>

              {/* Experience + Rate row */}
              <div className="grid grid-cols-2 gap-4 mb-5">
                <Field label="Years of Experience" required>
                  <select
                    className={inputCls}
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                  >
                    <option value="">Select years</option>
                    {["< 1 year", "1–2 years", "3–5 years", "6–10 years", "10+ years"].map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Hourly Rate (₹)" required>
                  <div className="flex">
                    <span className="flex items-center px-3 bg-gray-50 border border-r-0 border-gray-200 rounded-l-xl text-sm text-gray-500">
                      ₹
                    </span>
                    <input
                      type="number"
                      min="0"
                      className="flex-1 px-3.5 py-2.5 text-sm text-gray-900 border border-gray-200 rounded-r-xl outline-none bg-white placeholder:text-gray-400 hover:border-gray-300 focus:border-orange-400 transition-all"
                      value={rate}
                      onChange={(e) => setRate(e.target.value)}
                      placeholder="e.g. 500"
                    />
                  </div>
                  <p className="text-[11px] text-gray-400">Per hour, per student</p>
                </Field>
              </div>

              {/* Teaching mode */}
              <div className="mb-5 pb-5 border-b border-gray-100">
                <div className="text-xs font-medium text-gray-700 mb-3">Teaching Mode *</div>
                <div className="flex gap-3">
                  {TEACHING_MODES.map((m) => (
                    <label
                      key={m}
                      className="flex items-center gap-2.5 flex-1 px-4 py-3 rounded-xl border cursor-pointer transition-all"
                      style={
                        mode === m
                          ? { background: ORANGE_BG, borderColor: ORANGE_BORDER }
                          : { borderColor: "#E5E7EB", background: "#FAFAFA" }
                      }
                    >
                      <input
                        type="radio"
                        name="mode"
                        value={m}
                        checked={mode === m}
                        onChange={() => setMode(m)}
                        className="shrink-0"
                        style={{ accentColor: ORANGE }}
                      />
                      <div>
                        <div
                          className="text-xs font-semibold"
                          style={{ color: mode === m ? ORANGE : "#374151" }}
                        >
                          {m}
                        </div>
                        <div className="text-[10px] text-gray-400">
                          {m === "Online" ? "Via video call" : m === "Offline" ? "At home / centre" : "Flexible"}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Languages */}
              <TagSelector
                label="Languages of instruction"
                available={ALL_LANGUAGES}
                selected={languages}
                onToggle={(l) => toggleTag(languages, l, setLanguages)}
              />
            </SectionCard>

            {/* ── Location ── */}
            <SectionCard icon={<AiOutlineEnvironment className="w-4 h-4" />} title="Location">
              <div className="grid grid-cols-2 gap-4">
                <Field label="City" required>
                  <select
                    className={inputCls}
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  >
                    <option value="">Select city</option>
                    {["Varanasi", "Lucknow", "Kanpur", "Prayagraj", "Agra", "Noida", "Delhi NCR", "Mumbai", "Pune", "Hyderabad", "Bangalore", "Chennai", "Other"].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Area / Locality" hint="Helps nearby students find you">
                  <input
                    className={inputCls}
                    style={inputFocusStyle}
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="e.g. Sigra, Lanka, Assi"
                  />
                </Field>
              </div>
            </SectionCard>

            {/* ── Qualifications ── */}
            <SectionCard icon={<MdOutlineSchool className="w-4 h-4" />} title="Qualifications & Education">
              <div className="flex flex-col gap-3">
                {qualifications.map((q, idx) => (
                  <div key={q.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Degree {idx + 1}
                      </span>
                      {qualifications.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeQualification(q.id)}
                          className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
                        >
                          <AiOutlineDelete className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <Field label="Degree / Certificate">
                        <input
                          className={inputCls}
                          style={inputFocusStyle}
                          value={q.degree}
                          onChange={(e) => updateQualification(q.id, "degree", e.target.value)}
                          placeholder="e.g. B.Sc. Mathematics"
                        />
                      </Field>
                      <Field label="Institution">
                        <input
                          className={inputCls}
                          style={inputFocusStyle}
                          value={q.institution}
                          onChange={(e) => updateQualification(q.id, "institution", e.target.value)}
                          placeholder="e.g. BHU, Varanasi"
                        />
                      </Field>
                      <Field label="Year of Passing">
                        <input
                          className={inputCls}
                          style={inputFocusStyle}
                          value={q.year}
                          onChange={(e) => updateQualification(q.id, "year", e.target.value.replace(/\D/g, "").slice(0, 4))}
                          placeholder="e.g. 2018"
                          maxLength={4}
                        />
                      </Field>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addQualification}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed text-sm font-medium transition-all hover:bg-gray-50"
                  style={{ borderColor: ORANGE_BORDER, color: ORANGE }}
                >
                  <AiOutlinePlus className="w-4 h-4" />
                  Add another degree
                </button>
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
                      {tagline || (subjects.length > 0 ? subjects.slice(0, 2).join(", ") : "Your subjects")}
                      {experience ? ` · ${experience}` : ""}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Stars n={0} />
                      <span className="text-xs text-gray-400">No reviews yet</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-2.5">
                  {subjects.slice(0, 3).map((s) => (
                    <span key={s} className="text-[10px] bg-gray-50 text-gray-500 px-2 py-0.5 rounded-full border border-gray-100">
                      {s}
                    </span>
                  ))}
                  {subjects.length === 0 && (
                    <span className="text-[10px] text-gray-300 italic">No subjects added</span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold" style={{ color: ORANGE }}>
                      {rate ? `₹${rate}/hr` : "₹—/hr"}
                    </div>
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
                  "Add your degree from a recognised university to get a verified badge",
                  "Set a competitive rate — check what similar tutors charge in your city",
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
