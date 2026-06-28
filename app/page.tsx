"use client";

/**
 * Content-rich guest homepage (Naukri-style) — same navy/red palette:
 *  Navy:    #15213D   Red: #C0392B   Peach: #FBE7E0   Lavender: #EEF1FB
 */

import React, { useState } from "react";
import Link from "next/link";
import {
  AiOutlineSearch,
  AiOutlineEnvironment,
  AiOutlineCalendar,
  AiOutlineBook,
} from "react-icons/ai";
import { BsStarFill, BsHeart, BsChevronDown, BsChevronUp } from "react-icons/bs";
import {
  FaRulerCombined,
  FaFlask,
  FaLanguage,
  FaLaptopCode,
  FaMusic,
  FaPalette,
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaRupeeSign,
  FaClock,
  FaUserCheck,
} from "react-icons/fa";

const NAVY = "#15213D";
const RED = "#C0392B";

/* ─── Data ─────────────────────────────────────── */
const SUBJECTS = [
  { icon: <FaRulerCombined />, name: "Mathematics" },
  { icon: <FaFlask />,         name: "Science" },
  { icon: <FaLanguage />,      name: "Languages" },
  { icon: <FaLaptopCode />,    name: "Coding" },
  { icon: <FaMusic />,         name: "Music" },
  { icon: <FaPalette />,       name: "Fine Arts" },
];

const TRENDING_SEARCHES = [
  "JEE Physics", "Class 10 Maths", "Spoken English", "Python for Kids",
  "NEET Biology", "Guitar Classes", "GMAT Prep", "French Language",
];

const CITIES = [
  { name: "Kanpur",     count: "1,240 tutors" },
  { name: "Lucknow",    count: "980 tutors" },
  { name: "Varanasi",   count: "760 tutors" },
  { name: "Delhi NCR",  count: "2,100 tutors" },
  { name: "Mumbai",     count: "1,850 tutors" },
  { name: "Bangalore",  count: "1,620 tutors" },
  { name: "Pune",       count: "890 tutors" },
  { name: "Online",     count: "3,400 tutors" },
];

const TUTORS = [
  { initials: "SJ", name: "Sarah Jenkins",   role: "Mathematics Expert",  exp: "8+ years exp",  rating: 4.9, desc: "Helping students master calculus and linear algebra with simplified, practical methods.", featured: false },
  { initials: "AR", name: "Dr. Alex Rivera", role: "Physics & Chemistry", exp: "12+ years exp", rating: 5.0, desc: "Former researcher specializing in making complex scientific theories accessible for all.", featured: true },
  { initials: "MK", name: "Mila Kuznetsov",  role: "Modern Languages",    exp: "6+ years exp",  rating: 4.8, desc: "Polyglot tutor specializing in conversational French and Spanish using real-world practice.", featured: false },
  { initials: "RV", name: "Rahul Verma",     role: "Physics",             exp: "5+ years exp",  rating: 4.6, desc: "NEET & Class 12 physics mentor focused on building strong conceptual foundations.", featured: false },
  { initials: "AG", name: "Anjali Gupta",    role: "Chemistry",           exp: "7+ years exp",  rating: 4.7, desc: "Organic chemistry specialist with a track record of JEE Advanced toppers.", featured: false },
  { initials: "VR", name: "Vikram Rathi",    role: "Computer Science",    exp: "4+ years exp",  rating: 4.8, desc: "Full-stack developer teaching DSA, Python, and web development from scratch.", featured: false },
  { initials: "NJ", name: "Neha Joshi",      role: "Biology",             exp: "9+ years exp",  rating: 4.9, desc: "NEET biology expert known for simplifying genetics and human physiology.", featured: false },
  { initials: "AM", name: "Arjun Mehta",     role: "Economics",           exp: "6+ years exp",  rating: 4.5, desc: "Makes micro and macroeconomics intuitive with real-life Indian market examples.", featured: false },
  { initials: "PN", name: "Pooja Nair",      role: "Hindi Literature",    exp: "10+ years exp", rating: 4.7, desc: "Specializes in CBSE and ICSE Hindi literature and grammar fundamentals.", featured: false },
  { initials: "KM", name: "Karan Malhotra",  role: "History",             exp: "5+ years exp",  rating: 4.6, desc: "Storytelling-driven history lessons for Class 9-12 and competitive exams.", featured: false },
  { initials: "DI", name: "Divya Iyer",      role: "Fine Arts",           exp: "8+ years exp",  rating: 4.8, desc: "Watercolor and sketching coach for beginners and portfolio-building students.", featured: false },
  { initials: "SK", name: "Sameer Khan",     role: "Music — Guitar",      exp: "11+ years exp", rating: 4.9, desc: "Trains beginners to performance-level acoustic and electric guitar players.", featured: false },
];

const TESTIMONIALS = [
  { initials: "SV", name: "Sunita Verma", role: "Parent, Kanpur",  rating: 5, quote: "We found a physics tutor within a day of signing up. My son's grades improved within a month of starting sessions." },
  { initials: "RS", name: "Rohit Sharma", role: "Maths Tutor",      rating: 5, quote: "Managing my students and getting paid on time has never been this simple. TutorNear handles the admin so I can focus on teaching." },
  { initials: "AR2", name: "Ananya Roy",  role: "Student, Delhi",  rating: 4.5, quote: "Found an amazing French tutor online. The booking process was smooth and the demo class convinced me right away." },
];

const FAQS = [
  { q: "Is TutorNear free to use for students?", a: "Yes, browsing tutor profiles, comparing rates, and booking a free demo class is completely free for students and parents." },
  { q: "How are tutors verified on the platform?", a: "Every tutor goes through ID verification, qualification checks, and a short screening interview before their profile goes live." },
  { q: "Can I switch tutors if I'm not satisfied?", a: "Absolutely. You can book a demo with multiple tutors and switch anytime — there's no lock-in period." },
  { q: "How do I become a tutor on TutorNear?", a: "Click \"Apply to Teach\", complete your profile and verification, and you can start accepting students within 48 hours." },
  { q: "Do you offer both online and offline tutoring?", a: "Yes, you can filter tutors by online, in-person (home/center), or hybrid availability based on your preference." },
];

const STEPS = [
  { icon: <AiOutlineSearch className="w-5 h-5" />, title: "1. Search", desc: "Browse our curated list of expert tutors based on your subject, level, and location preferences." },
  { icon: <AiOutlineCalendar className="w-5 h-5" />, title: "2. Book", desc: "Check schedules, read reviews, and book a session that fits your busy lifestyle instantly." },
  { icon: <AiOutlineBook className="w-5 h-5" />, title: "3. Start Learning", desc: "Connect in-person or online and begin achieving your academic and personal learning goals." },
];

const FOOTER_COLUMNS = [
  { title: "STUDENTS", links: ["Find a Tutor", "Learning Resources", "Scholarship Program", "Pricing & Plans"] },
  { title: "TUTORS",   links: ["Apply to Teach", "Teaching Guide", "Tutor Dashboard", "Payout FAQ"] },
  { title: "SUPPORT",  links: ["Help Center", "Privacy Policy", "Terms of Service", "Contact Us"] },
];

/* ─── Sub-components ─────────────────────────────── */
function TutorCard({ t }: { t: typeof TUTORS[0] }) {
  return (
    <div
      className={`rounded-2xl overflow-hidden bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-lg
        ${t.featured ? "border-2 shadow-md" : "border border-gray-100"}`}
      style={t.featured ? { borderColor: RED } : undefined}
    >
      <div
        className="relative h-32 flex items-center justify-center"
        style={
          t.featured
            ? { background: `linear-gradient(135deg, ${RED}, #8E2A1F)` }
            : { background: "linear-gradient(135deg, #FBE7E0, #F6D6CB)" }
        }
      >
        {t.featured && (
          <span
            className="absolute top-3 left-3 flex items-center gap-1 text-[11px] font-semibold text-white px-2.5 py-1 rounded-full"
            style={{ background: "rgba(0,0,0,0.18)" }}
          >
            <BsHeart className="w-3 h-3" /> MOST LOVED
          </span>
        )}
        <span className="absolute top-3 right-3 flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-white" style={{ color: NAVY }}>
          <BsStarFill className="w-3 h-3" style={{ color: "#F2B705" }} /> {t.rating}
        </span>
        <div
          className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-sm font-bold"
          style={t.featured ? { border: `2px solid ${RED}`, color: RED } : { color: NAVY, border: "2px solid white" }}
        >
          {t.initials}
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-sm font-bold" style={{ color: NAVY }}>{t.name}</h3>
        <p className="text-[11px] font-semibold uppercase tracking-wide mt-1" style={{ color: RED }}>
          {t.role} · {t.exp}
        </p>
        <p className="text-xs text-gray-500 mt-2.5 leading-relaxed line-clamp-2">{t.desc}</p>
        <hr className="my-3 border-gray-100" />
        <button
          className="w-full py-2 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: t.featured ? RED : NAVY }}
        >
          View Profile
        </button>
      </div>
    </div>
  );
}

function FaqItem({ q, a, isOpen, onClick }: { q: string; a: string; isOpen: boolean; onClick: () => void }) {
  return (
    <div className="border border-gray-100 rounded-xl bg-white overflow-hidden">
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <span className="text-sm font-semibold" style={{ color: NAVY }}>{q}</span>
        {isOpen ? <BsChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <BsChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
      </button>
      {isOpen && (
        <div className="px-5 pb-4 text-sm text-gray-500 leading-relaxed">{a}</div>
      )}
    </div>
  );
}

/* ─── Main Page ───────────────────────────────────── */
export default function HomeGuestPage() {
  const [subject, setSubject] = useState("");
  const [location, setLocation] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "Inter, sans-serif" }}>

      {/* ── Navbar ── */}
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold" style={{ color: NAVY }}>
            TutorNear
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <span className="cursor-pointer" style={{ color: RED }}>Find Tutors</span>
            <span className="text-gray-600 hover:text-gray-900 cursor-pointer transition-colors">Become a Teacher</span>
            <span className="text-gray-600 hover:text-gray-900 cursor-pointer transition-colors">How it works</span>
          </div>
          <div className="flex items-center gap-5">
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Login</Link>
            <Link href="/register" className="px-5 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90" style={{ background: RED }}>
              Register
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="px-6 pt-16 pb-8 text-center" style={{ background: "#F7F7FA" }}>
        <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight" style={{ color: NAVY }}>
          Unlock Your Potential with the
        </h1>
        <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-8" style={{ color: RED }}>
          Perfect Tutor
        </h1>

        <div className="bg-white rounded-full border border-gray-200 flex items-stretch max-w-2xl mx-auto shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 flex-1 px-5 py-3 border-r border-gray-100">
            <AiOutlineBook className="w-4 h-4 text-gray-400 shrink-0" />
            <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject (e.g. Physics)" className="bg-transparent outline-none text-sm text-gray-900 placeholder:text-gray-400 w-full" />
          </div>
          <div className="flex items-center gap-2 flex-1 px-5 py-3">
            <AiOutlineEnvironment className="w-4 h-4 text-gray-400 shrink-0" />
            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)}
              placeholder="Location or Online" className="bg-transparent outline-none text-sm text-gray-900 placeholder:text-gray-400 w-full" />
          </div>
          <button className="px-7 text-sm font-semibold text-white transition-opacity hover:opacity-90 shrink-0" style={{ background: RED }}>
            Search
          </button>
        </div>
      </section>

      {/* ── Trending searches ── */}
      <section className="px-6 pb-14" style={{ background: "#F7F7FA" }}>
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-2.5 flex-wrap">
          <span className="text-xs font-semibold text-gray-400 mr-1">Trending:</span>
          {TRENDING_SEARCHES.map((s) => (
            <span
              key={s}
              className="text-xs font-medium px-3.5 py-1.5 rounded-full bg-white border border-gray-200 text-gray-600 cursor-pointer
                hover:border-[#C0392B] hover:text-[#C0392B] transition-colors"
            >
              {s}
            </span>
          ))}
        </div>
      </section>

      {/* ── Stats bar ── */}
      <div className="py-10 px-6" style={{ background: NAVY }}>
        <div className="max-w-4xl mx-auto flex items-center justify-center divide-x divide-white/15 text-center">
          <div className="px-8 sm:px-14">
            <div className="text-3xl font-extrabold text-white">10,000+</div>
            <div className="text-xs font-medium tracking-wider mt-1" style={{ color: "#9FA9C4" }}>VERIFIED TUTORS</div>
          </div>
          <div className="px-8 sm:px-14">
            <div className="text-3xl font-extrabold text-white">50+</div>
            <div className="text-xs font-medium tracking-wider mt-1" style={{ color: "#9FA9C4" }}>SUBJECTS COVERED</div>
          </div>
          <div className="px-8 sm:px-14">
            <div className="text-3xl font-extrabold text-white flex items-center justify-center gap-1.5">
              4.9 <BsStarFill className="w-4 h-4" style={{ color: "#F2B705" }} />
            </div>
            <div className="text-xs font-medium tracking-wider mt-1" style={{ color: "#9FA9C4" }}>AVERAGE RATING</div>
          </div>
        </div>
      </div>

      {/* ── Explore Popular Subjects ── */}
      <section className="max-w-6xl mx-auto px-6 py-16 text-center">
        <h2 className="text-2xl font-bold" style={{ color: NAVY }}>Explore Popular Subjects</h2>
        <div className="w-10 h-1 rounded-full mx-auto mt-3 mb-10" style={{ background: RED }} />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {SUBJECTS.map((s) => (
            <div key={s.name} className="bg-white border border-gray-100 rounded-2xl py-8 px-3 cursor-pointer hover:-translate-y-1 hover:shadow-md transition-all duration-200">
              <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center text-lg" style={{ background: "#FBE7E0", color: RED }}>
                {s.icon}
              </div>
              <div className="text-sm font-medium text-gray-700">{s.name}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Browse by City ── */}
      <section className="py-16 px-6" style={{ background: "#F7F7FA" }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-center" style={{ color: NAVY }}>Browse Tutors by City</h2>
          <p className="text-sm text-gray-500 text-center mt-2 mb-10">Find tutors actively teaching in your city, or learn online from anywhere.</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {CITIES.map((c) => (
              <div key={c.name} className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-3 cursor-pointer hover:-translate-y-1 hover:shadow-md transition-all duration-200">
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "#FBE7E0", color: RED }}>
                  <AiOutlineEnvironment className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold" style={{ color: NAVY }}>{c.name}</div>
                  <div className="text-xs text-gray-400">{c.count}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Top Rated Tutors (full grid) ── */}
      <section className="py-16 px-6" style={{ background: "#EEF1FB" }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-10 flex-wrap gap-2">
            <div>
              <h2 className="text-2xl font-bold" style={{ color: NAVY }}>Top Rated Tutors</h2>
              <p className="text-sm text-gray-500 mt-1">Learn from the best in the field</p>
            </div>
            <a className="text-sm font-semibold cursor-pointer hover:underline" style={{ color: RED }}>View all tutors →</a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {TUTORS.map((t) => <TutorCard key={t.name} t={t} />)}
          </div>
        </div>
      </section>

      {/* ── Become a Tutor banner ── */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="rounded-3xl px-8 sm:px-12 py-10 flex flex-col lg:flex-row items-center justify-between gap-8" style={{ background: NAVY }}>
          <div className="text-center lg:text-left">
            <h3 className="text-2xl font-bold text-white">Share your knowledge. Earn on your schedule.</h3>
            <p className="text-sm mt-2 max-w-md mx-auto lg:mx-0" style={{ color: "#9FA9C4" }}>
              Join 8,200+ educators already teaching on TutorNear. Set your own hours, your own rates, and get matched with students near you.
            </p>
            <div className="flex items-center justify-center lg:justify-start gap-6 mt-5 flex-wrap">
              <span className="flex items-center gap-1.5 text-sm text-white"><FaRupeeSign className="w-3.5 h-3.5" style={{ color: "#F2B705" }} />₹25,000+ avg. monthly earning</span>
              <span className="flex items-center gap-1.5 text-sm text-white"><FaClock className="w-3.5 h-3.5" style={{ color: "#F2B705" }} />Flexible hours</span>
              <span className="flex items-center gap-1.5 text-sm text-white"><FaUserCheck className="w-3.5 h-3.5" style={{ color: "#F2B705" }} />Free to join</span>
            </div>
          </div>
          <button className="px-6 py-3 rounded-lg text-sm font-semibold shrink-0 transition-opacity hover:opacity-90" style={{ background: RED, color: "white" }}>
            Apply to Teach
          </button>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-center" style={{ color: NAVY }}>What Our Community Says</h2>
        <p className="text-sm text-gray-500 text-center mt-2 mb-10">Real stories from students, parents, and tutors.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="bg-white border border-gray-100 rounded-2xl p-6">
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <BsStarFill key={i} className="w-3.5 h-3.5" style={{ color: i < Math.round(t.rating) ? "#F2B705" : "#E5E7EB" }} />
                ))}
              </div>
              <p className="text-sm text-gray-600 leading-relaxed mb-5">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "#FBE7E0", color: RED }}>
                  {t.initials}
                </div>
                <div>
                  <div className="text-sm font-semibold" style={{ color: NAVY }}>{t.name}</div>
                  <div className="text-xs text-gray-400">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Start Your Learning Journey ── */}
      <section className="max-w-5xl mx-auto px-6 py-16 text-center" style={{ background: "#F7F7FA" }}>
        <h2 className="text-2xl font-bold" style={{ color: NAVY }}>Start Your Learning Journey</h2>
        <p className="text-sm text-gray-500 mt-2 mb-14">Three simple steps to connect with your perfect academic match.</p>
        <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-10">
          <div className="hidden sm:block absolute top-7 left-[16%] right-[16%] h-px border-t border-dashed border-gray-300" />
          {STEPS.map((s) => (
            <div key={s.title} className="relative z-10 flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-white border-2 flex items-center justify-center mb-4" style={{ borderColor: RED, color: RED }}>
                {s.icon}
              </div>
              <h3 className="text-base font-bold mb-1.5" style={{ color: NAVY }}>{s.title}</h3>
              <p className="text-sm text-gray-500 max-w-[220px] leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQs ── */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-center" style={{ color: NAVY }}>Frequently Asked Questions</h2>
        <p className="text-sm text-gray-500 text-center mt-2 mb-10">Everything you need to know before getting started.</p>
        <div className="flex flex-col gap-3">
          {FAQS.map((f, i) => (
            <FaqItem key={f.q} q={f.q} a={f.a} isOpen={openFaq === i} onClick={() => setOpenFaq(openFaq === i ? null : i)} />
          ))}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="rounded-3xl px-8 sm:px-12 py-10 flex flex-col sm:flex-row items-center justify-between gap-6" style={{ background: RED }}>
          <div className="text-center sm:text-left">
            <h3 className="text-2xl font-bold text-white">Ready to reach your goals?</h3>
            <p className="text-white/85 text-sm mt-2 max-w-md">Join 50,000+ students already learning with TutorNear. Start your free trial session today.</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-white" style={{ color: RED }}>Find a Tutor</button>
            <button className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white border border-white/50 hover:bg-white/10 transition-colors">How it Works</button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="px-6 pt-14 pb-8" style={{ background: NAVY }}>
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <h4 className="text-lg font-bold text-white mb-3">TutorNear</h4>
            <p className="text-sm leading-relaxed" style={{ color: "#9FA9C4" }}>
              Connecting ambitious students with world-class educators since 2024. Your future starts with the right guidance.
            </p>
            <div className="flex items-center gap-3 mt-5">
              {[FaFacebookF, FaTwitter, FaLinkedinIn].map((Icon, i) => (
                <span key={i} className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer text-xs transition-colors" style={{ background: "rgba(255,255,255,0.08)", color: "#C7CEE3" }}>
                  <Icon />
                </span>
              ))}
            </div>
          </div>
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <h5 className="text-xs font-semibold tracking-wider mb-4" style={{ color: "#7C88AC" }}>{col.title}</h5>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l} className="text-sm cursor-pointer hover:text-white transition-colors" style={{ color: "#9FA9C4" }}>{l}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <hr className="my-8 border-white/10 max-w-6xl mx-auto" />
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-2 text-xs" style={{ color: "#7C88AC" }}>
          <span>© {new Date().getFullYear()} TutorNear. All rights reserved.</span>
          <span className="flex gap-5">
            <span className="cursor-pointer hover:text-white transition-colors">Cookie Policy</span>
            <span className="cursor-pointer hover:text-white transition-colors">Accessibility</span>
          </span>
        </div>
      </footer>
    </div>
  );
}