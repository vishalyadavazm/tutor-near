"use client";

import { useState, useEffect, useRef } from "react";
import { AiOutlineClose, AiOutlinePhone, AiOutlineUser, AiOutlineMail } from "react-icons/ai";
import { BsShieldCheck, BsStarFill, BsCheckCircleFill } from "react-icons/bs";

const NAVY = "#15213D";
const ORANGE = "#E8621A";

const SUBJECTS = [
  "Mathematics", "Physics", "Chemistry", "Biology",
  "English", "Hindi", "History", "Geography",
  "Computer Science", "Economics", "Accountancy", "Music",
];

const GRADES = [
  "Class 1 – 5 (Primary)",
  "Class 6 – 8 (Middle)",
  "Class 9 – 10 (Secondary)",
  "Class 11 – 12 (Sr. Secondary)",
  "JEE / NEET Aspirant",
  "IELTS / TOEFL",
  "Graduation Level",
  "Other",
];

type InquiryType = "inquiry" | "demo" | "message";

interface Teacher {
  id: number;
  initials: string;
  name: string;
  tagline?: string;
  subjects: string[];
  rating: number;
  reviews: number;
  rate: number;
  verified: boolean;
  bg: string;
  color: string;
  mode?: string;
}

interface Props {
  teacher: Teacher;
  defaultType?: InquiryType;
  onClose: () => void;
}

const TAB_CONFIG: { key: InquiryType; label: string; emoji: string; cta: string }[] = [
  { key: "inquiry", label: "Send Inquiry", emoji: "📩", cta: "Send Inquiry" },
  { key: "demo",    label: "Book Demo",    emoji: "📅", cta: "Book Free Demo" },
  { key: "message", label: "Message",      emoji: "💬", cta: "Send Message" },
];

export default function ContactModal({ teacher, defaultType = "inquiry", onClose }: Props) {
  const [tab, setTab] = useState<InquiryType>(defaultType);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [name, setName]           = useState("");
  const [phone, setPhone]         = useState("");
  const [email, setEmail]         = useState("");
  const [subject, setSubject]     = useState(teacher.subjects[0] ?? "");
  const [grade, setGrade]         = useState("");
  const [modeP, setModeP]         = useState<"Online" | "Offline" | "Both">("Both");
  const [message, setMessage]     = useState("");
  const [errors, setErrors]       = useState<Record<string, string>>({});

  const overlayRef = useRef<HTMLDivElement>(null);

  /* close on Escape */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  /* lock body scroll */
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  function validate() {
    const errs: Record<string, string> = {};
    if (!name.trim())  errs.name  = "Name is required";
    if (!phone.trim()) errs.phone = "Phone is required";
    else if (!/^\d{10}$/.test(phone.replace(/\s/g, ""))) errs.phone = "Enter a valid 10-digit number";
    if (tab !== "message" && !grade) errs.grade = "Please select a grade";
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSubmitted(true);
  }

  const activeCfg = TAB_CONFIG.find((c) => c.key === tab)!;

  return (
    /* Overlay */
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(10,22,40,0.65)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      {/* Panel */}
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
        style={{ maxHeight: "90vh" }}
      >
        {/* Colored header strip */}
        <div
          className="px-6 pt-5 pb-4"
          style={{ background: `linear-gradient(135deg, ${NAVY} 0%, #1A2F5E 100%)` }}
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all"
          >
            <AiOutlineClose className="w-4 h-4" />
          </button>

          {/* Teacher mini-card */}
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-base font-black shrink-0 shadow-lg"
              style={{ background: teacher.bg, color: teacher.color }}
            >
              {teacher.initials}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-white font-bold text-sm">{teacher.name}</span>
                {teacher.verified && <BsShieldCheck className="w-4 h-4 text-blue-300 shrink-0" />}
              </div>
              <p className="text-blue-200 text-xs truncate mt-0.5">
                {teacher.tagline ?? teacher.subjects.join(", ")}
              </p>
              <div className="flex items-center gap-1 mt-1">
                {[1,2,3,4,5].map((i) => (
                  <BsStarFill key={i} className={`w-3 h-3 ${i <= Math.floor(teacher.rating) ? "text-amber-400" : "text-white/20"}`} />
                ))}
                <span className="text-amber-300 text-xs font-semibold ml-1">{teacher.rating}</span>
                <span className="text-blue-300 text-xs">({teacher.reviews} reviews)</span>
                <span className="ml-2 text-xs font-bold" style={{ color: "#FB923C" }}>₹{teacher.rate}/hr</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4 bg-white/10 rounded-xl p-1">
            {TAB_CONFIG.map((cfg) => (
              <button
                key={cfg.key}
                onClick={() => setTab(cfg.key)}
                className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                  tab === cfg.key
                    ? "bg-white text-gray-900 shadow"
                    : "text-white/70 hover:text-white"
                }`}
              >
                <span>{cfg.emoji}</span>
                <span className="hidden sm:inline">{cfg.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Success state */}
        {submitted ? (
          <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <BsCheckCircleFill className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {tab === "demo" ? "Demo Booked!" : tab === "message" ? "Message Sent!" : "Inquiry Sent!"}
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              {teacher.name} will get back to you shortly. You can expect a response within 2–4 hours.
            </p>
            <button
              onClick={onClose}
              className="mt-6 px-8 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ background: ORANGE }}
            >
              Done
            </button>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="overflow-y-auto" style={{ maxHeight: "calc(90vh - 168px)" }}>
            <div className="px-6 py-5 flex flex-col gap-4">

              {/* Name */}
              <Field
                label="Your Name"
                required
                error={errors.name}
                icon={<AiOutlineUser className="w-4 h-4" />}
              >
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className={fieldCls(!!errors.name)}
                />
              </Field>

              {/* Phone */}
              <Field
                label="Phone Number"
                required
                error={errors.phone}
                icon={<AiOutlinePhone className="w-4 h-4" />}
              >
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  className={fieldCls(!!errors.phone)}
                />
              </Field>

              {/* Email */}
              <Field
                label="Email (optional)"
                icon={<AiOutlineMail className="w-4 h-4" />}
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={fieldCls(false)}
                />
              </Field>

              {/* Subject + Grade — side by side */}
              <div className="grid grid-cols-2 gap-3">
                <Field label="Subject" required>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className={selectCls(false)}
                  >
                    {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </Field>

                {tab !== "message" && (
                  <Field label="Grade / Class" required error={errors.grade}>
                    <select
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className={selectCls(!!errors.grade)}
                    >
                      <option value="">Select grade</option>
                      {GRADES.map((g) => <option key={g}>{g}</option>)}
                    </select>
                  </Field>
                )}
              </div>

              {/* Mode preference */}
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-2">
                  Preferred Mode
                </label>
                <div className="flex gap-2">
                  {(["Online", "Offline", "Both"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setModeP(m)}
                      className={`flex-1 py-2 rounded-xl border text-xs font-semibold transition-all ${
                        modeP === m
                          ? "border-orange-400 text-orange-700 bg-orange-50"
                          : "border-gray-200 text-gray-500 hover:border-gray-300"
                      }`}
                    >
                      {m === "Online" ? "💻 Online" : m === "Offline" ? "🏠 Offline" : "🔄 Both"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <Field label={tab === "message" ? "Message" : "Additional Message (optional)"}>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    tab === "demo"
                      ? "Mention preferred timings, days, or any specific topic you'd like covered…"
                      : tab === "message"
                      ? "Write your message here…"
                      : "Tell the teacher about your child's current level, goals, or any challenges…"
                  }
                  rows={3}
                  className="w-full px-3 py-2.5 text-sm text-gray-900 border border-gray-200 rounded-xl outline-none resize-none placeholder:text-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                />
              </Field>

              {/* Privacy note */}
              <p className="text-[11px] text-gray-400 -mt-1">
                Your contact details are shared only with {teacher.name}. TutorNear will not share them with third parties.
              </p>
            </div>

            {/* Submit footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ background: ORANGE }}
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Sending…
                  </>
                ) : (
                  `${activeCfg.emoji} ${activeCfg.cta}`
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

/* ── Helpers ─────────────────────────────────────── */

function fieldCls(hasError: boolean) {
  return `w-full pl-9 pr-3 py-2.5 text-sm text-gray-900 border rounded-xl outline-none placeholder:text-gray-400 transition-all ${
    hasError
      ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-2 focus:ring-red-100"
      : "border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
  }`;
}

function selectCls(hasError: boolean) {
  return `w-full px-3 py-2.5 text-sm text-gray-900 border rounded-xl outline-none cursor-pointer transition-all bg-white ${
    hasError
      ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
      : "border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
  }`;
}

function Field({
  label, required, error, icon, children,
}: {
  label: string; required?: boolean; error?: string; icon?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-700 block mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {icon ? (
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            {icon}
          </span>
          {children}
        </div>
      ) : children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
