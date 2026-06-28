"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  AiOutlineSearch,
  AiOutlineEnvironment,
  AiOutlineBell,
  AiOutlineCheckCircle,
  AiOutlineClose,
  AiOutlineFilter,
} from "react-icons/ai";
import {
  BsStarFill,
  BsStar,
  BsHeart,
  BsHeartFill,
  BsShieldCheck,
  BsFunnel,
} from "react-icons/bs";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { MdOutlineVideoCall, MdOutlineLocationOn } from "react-icons/md";
import AuthService from "@/services/auth.service";
import ContactModal from "@/components/shared/ContactModal";

const NAVY = "#15213D";
const ORANGE = "#E8621A";
const ORANGE_BG = "#FFF3EC";
const ORANGE_BORDER = "#F8C9A8";

/* ─── Mock teachers ─────────────────────────────── */
const TEACHERS = [
  {
    id: 1, initials: "PS", name: "Priya Sharma",
    subjects: ["Mathematics", "Physics"],
    levels: ["Class 11–12", "JEE Mains", "JEE Advanced"],
    expYears: 8, experience: "8 years",
    mode: "Both", city: "Varanasi", area: "Lanka",
    rate: 600, rating: 4.9, reviews: 84, verified: true, available: true,
    bio: "Dedicated mathematics and physics teacher with 8+ years helping students crack JEE. My approach focuses on conceptual clarity and systematic problem-solving shortcuts tailored to each student's learning style.",
    languages: ["Hindi", "English"],
    tags: ["JEE Advanced", "Calculus", "Mechanics", "Algebra"],
    bg: "#DBEAFE", color: "#1D4ED8", active: 1,
  },
  {
    id: 2, initials: "RK", name: "Rahul Kumar",
    subjects: ["Physics", "Chemistry"],
    levels: ["Class 11–12", "JEE Mains", "NEET"],
    expYears: 5, experience: "5 years",
    mode: "Both", city: "Varanasi", area: "Sigra",
    rate: 500, rating: 4.6, reviews: 61, verified: true, available: true,
    bio: "Physics and Chemistry expert with 5 years coaching JEE and NEET aspirants. Known for making complex concepts simple through real-world analogies and lots of practice problems.",
    languages: ["Hindi", "English"],
    tags: ["NEET", "JEE Mains", "Organic Chemistry", "Electrostatics"],
    bg: "#D1FAE5", color: "#065F46", active: 2,
  },
  {
    id: 3, initials: "AM", name: "Anjali Mishra",
    subjects: ["English"],
    levels: ["Class 9–10", "Class 11–12", "IELTS / TOEFL"],
    expYears: 10, experience: "10 years",
    mode: "Online", city: "Online", area: "",
    rate: 750, rating: 5.0, reviews: 102, verified: true, available: false,
    bio: "English communication and grammar specialist with 10 years of experience. Expert in IELTS preparation, creative writing, and board exam scoring. Helped 500+ students improve their English fluency.",
    languages: ["English", "Hindi"],
    tags: ["IELTS", "Grammar", "Writing", "Board Exams"],
    bg: "#FAE8FF", color: "#86198F", active: 5,
  },
  {
    id: 4, initials: "VS", name: "Vikram Singh",
    subjects: ["Chemistry"],
    levels: ["Class 11–12", "JEE Advanced", "NEET"],
    expYears: 6, experience: "6 years",
    mode: "Offline", city: "Varanasi", area: "Assi",
    rate: 550, rating: 4.7, reviews: 48, verified: true, available: true,
    bio: "Chemistry teacher specialising in Organic Chemistry and Physical Chemistry for JEE Advanced and NEET. My mnemonic-based teaching makes difficult reactions easy to remember and apply.",
    languages: ["Hindi"],
    tags: ["Organic Chemistry", "JEE Advanced", "NEET", "Reaction Mechanisms"],
    bg: "#FEF9C3", color: "#92400E", active: 3,
  },
  {
    id: 5, initials: "NV", name: "Neha Verma",
    subjects: ["Biology"],
    levels: ["Class 9–10", "Class 11–12", "NEET"],
    expYears: 4, experience: "4 years",
    mode: "Both", city: "Varanasi", area: "Orderly Bazar",
    rate: 450, rating: 4.5, reviews: 29, verified: false, available: true,
    bio: "Biology teacher with 4 years of experience and a special focus on NEET preparation. Strong command over Botany and Zoology with diagram-based teaching that simplifies complex biological processes.",
    languages: ["Hindi", "English"],
    tags: ["NEET", "Botany", "Zoology", "Class 12"],
    bg: "#ECFDF5", color: "#047857", active: 7,
  },
  {
    id: 6, initials: "AJ", name: "Amit Joshi",
    subjects: ["Computer Science"],
    levels: ["Class 11–12", "Beginner", "Intermediate", "Advanced"],
    expYears: 7, experience: "7 years",
    mode: "Online", city: "Online", area: "",
    rate: 800, rating: 4.8, reviews: 67, verified: true, available: true,
    bio: "Software engineer turned educator with 7 years teaching Computer Science. Covers Python, C++, Data Structures, CBSE CS, and competitive programming. Practical, project-based learning approach.",
    languages: ["Hindi", "English"],
    tags: ["Python", "C++", "Data Structures", "CBSE CS"],
    bg: "#E0F2FE", color: "#0369A1", active: 1,
  },
  {
    id: 7, initials: "SY", name: "Sunita Yadav",
    subjects: ["Mathematics", "Physics"],
    levels: ["Class 6–8", "Class 9–10", "Class 11–12", "JEE Mains"],
    expYears: 12, experience: "12 years",
    mode: "Both", city: "Varanasi", area: "Bhelupur",
    rate: 700, rating: 4.9, reviews: 118, verified: true, available: true,
    bio: "Veteran Maths and Physics teacher with 12 years of classroom and home-tutoring experience. Expert at building strong fundamentals from Class 6 to JEE Mains level. Ranked among top-rated tutors in Varanasi.",
    languages: ["Hindi", "English"],
    tags: ["Trigonometry", "Mechanics", "JEE Mains", "CBSE"],
    bg: "#F3E8FF", color: "#7E22CE", active: 0,
  },
  {
    id: 8, initials: "DG", name: "Deepak Gupta",
    subjects: ["History", "Geography"],
    levels: ["Class 6–8", "Class 9–10", "Class 11–12"],
    expYears: 9, experience: "9 years",
    mode: "Offline", city: "Varanasi", area: "Mahmoorganj",
    rate: 400, rating: 4.4, reviews: 35, verified: false, available: false,
    bio: "Experienced History and Geography teacher with 9 years of preparing students for CBSE and State Board exams. Uses maps, timelines, and storytelling to make social sciences interesting and memorable.",
    languages: ["Hindi"],
    tags: ["CBSE", "Board Exams", "Map Work", "Modern History"],
    bg: "#FEF3C7", color: "#B45309", active: 14,
  },
  {
    id: 9, initials: "KP", name: "Kavita Pandey",
    subjects: ["English", "Hindi"],
    levels: ["Class 6–8", "Class 9–10", "Class 11–12"],
    expYears: 6, experience: "6 years",
    mode: "Both", city: "Lucknow", area: "Hazratganj",
    rate: 500, rating: 4.6, reviews: 52, verified: true, available: true,
    bio: "Bilingual English and Hindi teacher from Lucknow with 6 years of experience in language teaching, grammar, and literature. Specialises in essay writing, comprehension, and board exam preparation.",
    languages: ["Hindi", "English", "Urdu"],
    tags: ["Grammar", "Literature", "Board Exams", "Essay Writing"],
    bg: "#FCE7F3", color: "#9D174D", active: 4,
  },
  {
    id: 10, initials: "RS", name: "Ranjit Singh",
    subjects: ["Mathematics"],
    levels: ["Class 1–5", "Class 6–8", "Class 9–10"],
    expYears: 3, experience: "3 years",
    mode: "Offline", city: "Varanasi", area: "Sarnath",
    rate: 350, rating: 4.2, reviews: 18, verified: false, available: true,
    bio: "Young and enthusiastic maths teacher with 3 years experience working with students from Class 1 to 10. Passionate about making maths fun through games, puzzles, and real-life examples.",
    languages: ["Hindi"],
    tags: ["Basic Maths", "Class 9-10", "Mensuration", "Algebra"],
    bg: "#DBEAFE", color: "#1E40AF", active: 2,
  },
  {
    id: 11, initials: "MD", name: "Meera Dubey",
    subjects: ["Music"],
    levels: ["Beginner", "Intermediate", "Advanced"],
    expYears: 8, experience: "8 years",
    mode: "Online", city: "Online", area: "",
    rate: 600, rating: 4.7, reviews: 43, verified: true, available: true,
    bio: "Classical and contemporary music teacher with 8 years of experience. Teaches Hindustani vocal, keyboard, and guitar. Formal training from Banaras Hindu University. Students of all age groups welcome.",
    languages: ["Hindi", "English"],
    tags: ["Hindustani Vocal", "Guitar", "Keyboard", "BHU Trained"],
    bg: "#FDE68A", color: "#92400E", active: 6,
  },
  {
    id: 12, initials: "AT", name: "Arun Tiwari",
    subjects: ["Economics", "Accountancy"],
    levels: ["Class 11–12", "Beginner"],
    expYears: 5, experience: "5 years",
    mode: "Both", city: "Varanasi", area: "Nadesar",
    rate: 450, rating: 4.5, reviews: 31, verified: true, available: false,
    bio: "Commerce stream specialist with 5 years teaching Economics and Accountancy for Class 11-12 and CA Foundation. Strong focus on conceptual understanding and scoring in board exams.",
    languages: ["Hindi", "English"],
    tags: ["Micro Economics", "Accountancy", "CA Foundation", "Board Exams"],
    bg: "#D1FAE5", color: "#065F46", active: 9,
  },
];

const SUBJECT_OPTIONS = [
  "Mathematics", "Physics", "Chemistry", "Biology", "English", "Hindi",
  "History", "Geography", "Computer Science", "Economics", "Accountancy", "Music",
];
const CITY_OPTIONS = ["Varanasi", "Lucknow", "Online"];
const EXP_BUCKETS = [
  { label: "0–2 years", min: 0, max: 2 },
  { label: "3–5 years", min: 3, max: 5 },
  { label: "6–10 years", min: 6, max: 10 },
  { label: "10+ years", min: 11, max: 99 },
];

/* ─── Sub-components ────────────────────────────── */

function Stars({ rating, size = "sm" }: { rating: number; size?: "sm" | "xs" }) {
  const cls = size === "xs" ? "w-2.5 h-2.5" : "w-3.5 h-3.5";
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) =>
        i <= Math.floor(rating) ? (
          <BsStarFill key={i} className={`${cls} text-amber-400`} />
        ) : (
          <BsStar key={i} className={`${cls} text-gray-200`} />
        ),
      )}
    </span>
  );
}

function ModeBadge({ mode }: { mode: string }) {
  if (mode === "Online")
    return (
      <span className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-700">
        <MdOutlineVideoCall className="w-3.5 h-3.5" /> Online
      </span>
    );
  if (mode === "Offline")
    return (
      <span className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
        <MdOutlineLocationOn className="w-3.5 h-3.5" /> Offline
      </span>
    );
  return (
    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">
      Online + Offline
    </span>
  );
}

function FilterSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 py-4">
      <button
        className="flex items-center justify-between w-full text-sm font-semibold text-gray-800 mb-3"
        onClick={() => setOpen((o) => !o)}
      >
        {title}
        {open ? <FiChevronUp className="w-4 h-4 text-gray-400" /> : <FiChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {open && children}
    </div>
  );
}

function CheckboxFilter({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer py-1 group">
      <div
        className="w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all"
        style={checked ? { background: ORANGE, borderColor: ORANGE } : { borderColor: "#D1D5DB" }}
      >
        {checked && (
          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 12 12">
            <path d="M10 3L5 8.5 2 5.5" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span className="text-sm text-gray-600 group-hover:text-gray-900">{label}</span>
    </label>
  );
}

function TeacherCard({
  t,
  saved,
  onSave,
  onContact,
}: {
  t: (typeof TEACHERS)[0];
  saved: boolean;
  onSave: () => void;
  onContact: () => void;
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 hover:border-orange-200 hover:shadow-md transition-all duration-200">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold shrink-0"
          style={{ background: t.bg, color: t.color }}
        >
          {t.initials}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Row 1: Name + save + price */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-semibold text-gray-900">{t.name}</h3>
                {t.verified && (
                  <span className="flex items-center gap-1 text-xs font-medium text-green-700">
                    <BsShieldCheck className="w-3.5 h-3.5 text-green-500" /> Verified
                  </span>
                )}
                {t.available && (
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{ background: ORANGE_BG, color: ORANGE }}
                  >
                    Available now
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-500 mt-0.5 truncate">
                {t.subjects.join(" · ")} &nbsp;·&nbsp; {t.experience} exp
              </div>
            </div>

            <div className="flex items-start gap-2 shrink-0">
              <button
                onClick={onSave}
                className="p-2 rounded-xl border border-gray-200 text-gray-400 hover:border-red-200 hover:text-red-500 transition-all"
              >
                {saved ? (
                  <BsHeartFill className="w-4 h-4 text-red-500" />
                ) : (
                  <BsHeart className="w-4 h-4" />
                )}
              </button>
              <div className="text-right">
                <div className="text-lg font-bold" style={{ color: ORANGE }}>
                  ₹{t.rate}/hr
                </div>
                <div className="text-xs text-gray-400">per session</div>
              </div>
            </div>
          </div>

          {/* Row 2: Rating + location + mode */}
          <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-2">
            <div className="flex items-center gap-1.5">
              <Stars rating={t.rating} />
              <span className="text-sm font-semibold text-gray-800">{t.rating}</span>
              <span className="text-xs text-gray-400">({t.reviews} reviews)</span>
            </div>
            <span className="text-gray-200 hidden sm:block">|</span>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <AiOutlineEnvironment className="w-3.5 h-3.5" />
              {t.mode === "Online" ? "Online only" : `${t.city}${t.area ? ` · ${t.area}` : ""}`}
            </div>
            <span className="text-gray-200 hidden sm:block">|</span>
            <ModeBadge mode={t.mode} />
          </div>

          {/* Row 3: Bio */}
          <p className="text-sm text-gray-500 mt-2.5 line-clamp-2 leading-relaxed">{t.bio}</p>

          {/* Row 4: Tags */}
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {t.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs bg-gray-50 text-gray-500 px-2.5 py-1 rounded-full border border-gray-100"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Row 5: Languages + activity + CTAs */}
          <div className="flex items-center justify-between mt-3.5 pt-3.5 border-t border-gray-100 flex-wrap gap-2">
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span>🗣 {t.languages.join(", ")}</span>
              <span>· Active {t.active === 0 ? "today" : `${t.active}d ago`}</span>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/teacher/${t.id}`}
                className="px-4 py-1.5 text-sm font-medium rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all"
              >
                View Profile
              </Link>
              <button
                onClick={onContact}
                className="px-4 py-1.5 text-sm font-semibold rounded-xl text-white transition-all hover:opacity-90"
                style={{ background: ORANGE }}
              >
                Contact
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main component ─────────────────────────────── */
export default function StudentHome() {
  const [searchText, setSearchText] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [subjectFilters, setSubjectFilters] = useState<string[]>([]);
  const [modeFilters, setModeFilters] = useState<string[]>([]);
  const [expBucket, setExpBucket] = useState("");
  const [maxRate, setMaxRate] = useState(2000);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("relevant");
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [contactTeacher, setContactTeacher] = useState<(typeof TEACHERS)[0] | null>(null);

  function toggleSubject(s: string) {
    setSubjectFilters((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  }
  function toggleMode(m: string) {
    setModeFilters((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m],
    );
  }
  function toggleSave(id: number) {
    setSavedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }
  function clearFilters() {
    setSubjectFilters([]);
    setModeFilters([]);
    setExpBucket("");
    setMaxRate(2000);
    setMinRating(0);
    setCityFilter("all");
  }

  const activeFilterCount =
    subjectFilters.length +
    modeFilters.length +
    (expBucket ? 1 : 0) +
    (maxRate < 2000 ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    (cityFilter !== "all" ? 1 : 0);

  const results = useMemo(() => {
    const bucket = EXP_BUCKETS.find((b) => b.label === expBucket);
    let list = TEACHERS.filter((t) => {
      if (
        searchText &&
        !t.name.toLowerCase().includes(searchText.toLowerCase()) &&
        !t.subjects.some((s) => s.toLowerCase().includes(searchText.toLowerCase())) &&
        !t.tags.some((g) => g.toLowerCase().includes(searchText.toLowerCase()))
      )
        return false;
      if (cityFilter !== "all") {
        if (cityFilter === "Online" && t.mode === "Offline") return false;
        if (cityFilter !== "Online" && t.city !== cityFilter && t.mode !== "Online") return false;
      }
      if (subjectFilters.length > 0 && !t.subjects.some((s) => subjectFilters.includes(s)))
        return false;
      if (
        modeFilters.length > 0 &&
        !modeFilters.some((m) => t.mode === m || t.mode === "Both")
      )
        return false;
      if (bucket && (t.expYears < bucket.min || t.expYears > bucket.max)) return false;
      if (t.rate > maxRate) return false;
      if (t.rating < minRating) return false;
      return true;
    });

    switch (sortBy) {
      case "rating":
        list = [...list].sort((a, b) => b.rating - a.rating);
        break;
      case "price_asc":
        list = [...list].sort((a, b) => a.rate - b.rate);
        break;
      case "price_desc":
        list = [...list].sort((a, b) => b.rate - a.rate);
        break;
      case "exp":
        list = [...list].sort((a, b) => b.expYears - a.expYears);
        break;
      default:
        break;
    }
    return list;
  }, [searchText, cityFilter, subjectFilters, modeFilters, expBucket, maxRate, minRating, sortBy]);

  const filterPanel = (
    <div className="flex flex-col">
      {/* Filter header */}
      <div className="flex items-center justify-between mb-1 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <BsFunnel className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-semibold text-gray-800">Filters</span>
          {activeFilterCount > 0 && (
            <span
              className="text-xs font-bold px-1.5 py-0.5 rounded-full text-white"
              style={{ background: ORANGE }}
            >
              {activeFilterCount}
            </span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="text-xs font-medium hover:underline"
            style={{ color: ORANGE }}
          >
            Clear all
          </button>
        )}
      </div>

      {/* Subject */}
      <FilterSection title="Subject">
        <div className="flex flex-col">
          {SUBJECT_OPTIONS.map((s) => (
            <CheckboxFilter
              key={s}
              label={s}
              checked={subjectFilters.includes(s)}
              onChange={() => toggleSubject(s)}
            />
          ))}
        </div>
      </FilterSection>

      {/* Teaching mode */}
      <FilterSection title="Teaching Mode">
        <div className="flex flex-col">
          {["Online", "Offline", "Both"].map((m) => (
            <CheckboxFilter
              key={m}
              label={m === "Both" ? "Online + Offline" : m}
              checked={modeFilters.includes(m)}
              onChange={() => toggleMode(m)}
            />
          ))}
        </div>
      </FilterSection>

      {/* Experience */}
      <FilterSection title="Experience">
        <div className="flex flex-col gap-1">
          {EXP_BUCKETS.map((b) => (
            <label key={b.label} className="flex items-center gap-2.5 cursor-pointer py-1">
              <div
                className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0"
                style={
                  expBucket === b.label
                    ? { borderColor: ORANGE }
                    : { borderColor: "#D1D5DB" }
                }
              >
                {expBucket === b.label && (
                  <div className="w-2 h-2 rounded-full" style={{ background: ORANGE }} />
                )}
              </div>
              <span className="text-sm text-gray-600">{b.label}</span>
            </label>
          ))}
          {expBucket && (
            <button
              onClick={() => setExpBucket("")}
              className="text-xs mt-1 text-left hover:underline"
              style={{ color: ORANGE }}
            >
              Clear
            </button>
          )}
        </div>
      </FilterSection>

      {/* Hourly rate */}
      <FilterSection title="Hourly Rate (₹)">
        <div>
          <input
            type="range"
            min={200}
            max={2000}
            step={50}
            value={maxRate}
            onChange={(e) => setMaxRate(Number(e.target.value))}
            className="w-full accent-orange-500"
            style={{ accentColor: ORANGE }}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>₹200</span>
            <span className="font-semibold" style={{ color: ORANGE }}>
              Up to ₹{maxRate}
            </span>
            <span>₹2000</span>
          </div>
        </div>
      </FilterSection>

      {/* Rating */}
      <FilterSection title="Minimum Rating">
        <div className="flex flex-col gap-1">
          {[
            { label: "4★ & above", val: 4 },
            { label: "3★ & above", val: 3 },
            { label: "Any rating", val: 0 },
          ].map((r) => (
            <label key={r.label} className="flex items-center gap-2.5 cursor-pointer py-1">
              <div
                className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0"
                style={
                  minRating === r.val
                    ? { borderColor: ORANGE }
                    : { borderColor: "#D1D5DB" }
                }
              >
                {minRating === r.val && (
                  <div className="w-2 h-2 rounded-full" style={{ background: ORANGE }} />
                )}
              </div>
              <span className="text-sm text-gray-600">{r.label}</span>
            </label>
          ))}
        </div>
      </FilterSection>
    </div>
  );

  const ct = contactTeacher;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      {/* ── Topbar ── */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-5 h-16 flex items-center gap-4">
          {/* Logo */}
          <Link href="/student" className="flex items-center gap-2.5 shrink-0">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: NAVY }}
            >
              <svg className="w-4 h-4" fill="white" viewBox="0 0 24 24">
                <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
              </svg>
            </div>
            <span className="text-base font-semibold hidden sm:block" style={{ color: NAVY }}>
              TutorNear
            </span>
          </Link>

          {/* Inline search */}
          <div className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 max-w-xl hover:border-orange-300 focus-within:border-orange-400 transition-colors">
            <AiOutlineSearch className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search by subject, teacher name, or skill…"
              className="bg-transparent outline-none text-sm text-gray-900 placeholder:text-gray-400 w-full"
            />
            {searchText && (
              <button onClick={() => setSearchText("")} className="text-gray-400 hover:text-gray-600">
                <AiOutlineClose className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* City */}
          <div className="hidden md:flex items-center gap-1.5 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 bg-white hover:border-orange-300 transition-colors">
            <AiOutlineEnvironment className="w-4 h-4 text-gray-400 shrink-0" />
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="bg-transparent outline-none cursor-pointer"
            >
              <option value="all">All cities</option>
              {CITY_OPTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2 ml-auto">
            <button className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
              <AiOutlineBell className="w-4.5 h-4.5" />
            </button>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
              style={{ background: NAVY }}
            >
              S
            </div>
            <button
              onClick={() => AuthService.logout()}
              className="hidden sm:flex px-3 py-2 rounded-xl text-xs font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 border border-gray-200 transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero search bar ── */}
      <div className="border-b border-gray-100 bg-white">
        <div className="max-w-[1400px] mx-auto px-5 py-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-lg font-bold" style={{ color: NAVY }}>
                Find Your Perfect Tutor
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {results.length} teachers available
                {cityFilter !== "all" ? ` in ${cityFilter}` : ""}
                {subjectFilters.length > 0 ? ` · ${subjectFilters.join(", ")}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Mobile filter button */}
              <button
                onClick={() => setMobileFiltersOpen((o) => !o)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 lg:hidden transition-all"
              >
                <AiOutlineFilter className="w-4 h-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span
                    className="w-4 h-4 text-[10px] font-bold rounded-full text-white flex items-center justify-center"
                    style={{ background: ORANGE }}
                  >
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 hidden sm:block">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none bg-white hover:border-orange-300 transition-colors cursor-pointer"
                >
                  <option value="relevant">Most Relevant</option>
                  <option value="rating">Highest Rated</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="exp">Most Experienced</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-[1400px] mx-auto px-5 py-6 flex gap-6 items-start">

        {/* ── Filter sidebar (desktop) ── */}
        <aside className="hidden lg:block w-60 shrink-0 sticky top-24 self-start bg-white border border-gray-100 rounded-2xl p-4">
          {filterPanel}
        </aside>

        {/* ── Mobile filter drawer ── */}
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setMobileFiltersOpen(false)}
            />
            <div className="absolute right-0 top-0 bottom-0 w-72 bg-white overflow-y-auto p-5 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-base font-semibold" style={{ color: NAVY }}>Filters</span>
                <button onClick={() => setMobileFiltersOpen(false)}>
                  <AiOutlineClose className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              {filterPanel}
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="mt-4 w-full py-3 rounded-xl text-sm font-semibold text-white"
                style={{ background: ORANGE }}
              >
                Show {results.length} results
              </button>
            </div>
          </div>
        )}

        {/* ── Teacher listing ── */}
        <div className="flex-1 min-w-0 flex flex-col gap-3">
          {results.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center">
              <div className="text-4xl mb-3">🔍</div>
              <div className="text-base font-semibold text-gray-700 mb-1">No tutors found</div>
              <div className="text-sm text-gray-400">
                Try adjusting your filters or search terms
              </div>
              <button
                onClick={clearFilters}
                className="mt-4 px-5 py-2 rounded-xl text-sm font-semibold text-white"
                style={{ background: ORANGE }}
              >
                Clear all filters
              </button>
            </div>
          ) : (
            results.map((t) => (
              <TeacherCard
                key={t.id}
                t={t}
                saved={savedIds.has(t.id)}
                onSave={() => toggleSave(t.id)}
                onContact={() => setContactTeacher(t)}
              />
            ))
          )}

          {/* Pagination hint */}
          {results.length > 0 && (
            <div className="text-center py-4 text-sm text-gray-400">
              Showing {results.length} of {TEACHERS.length} teachers
            </div>
          )}
        </div>
      </div>

      {ct && (
        <ContactModal
          teacher={{
            id: ct.id,
            initials: ct.initials,
            name: ct.name,
            subjects: ct.subjects,
            rating: ct.rating,
            reviews: ct.reviews,
            rate: ct.rate,
            verified: ct.verified,
            bg: ct.bg,
            color: ct.color,
            mode: ct.mode,
            tagline: `${ct.subjects.join(", ")} · ${ct.city}`,
          }}
          defaultType="inquiry"
          onClose={() => setContactTeacher(null)}
        />
      )}
    </div>
  );
}
