"use client";

/**
 * Updated to match the homepage palette:
 *   Navy: #15213D   Red: #C0392B   Peach: #FBE7E0   Gold: #F2B705   Muted label: #9FA9C4
 */

import React from "react";
import Link from "next/link";

const NAVY = "#15213D";
const RED = "#C0392B";
const MUTED = "#9FA9C4";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      {/* ── Left: Branding Panel ── */}
      <div
        className="hidden lg:flex lg:w-[45%] xl:w-[42%] flex-col justify-between relative overflow-hidden px-12 py-10"
        style={{ background: `linear-gradient(160deg, #1B2A4D 0%, ${NAVY} 55%, #0F1830 100%)` }}
      >
        {/* Decorative blobs */}
        <div className="absolute top-[-80px] right-[-80px] w-72 h-72 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute bottom-[-60px] left-[-60px] w-80 h-80 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-white/[0.03] pointer-events-none" />

        {/* Logo — same plain text mark as the homepage navbar */}
        <div className="relative z-10">
          <Link href="/" className="text-xl font-bold tracking-tight text-white w-fit">
            TutorNear
          </Link>
        </div>

        {/* Hero copy */}
        <div className="relative z-10 flex flex-col gap-8">
          {/* Illustration placeholder */}
          <div className="w-full max-w-sm mx-auto">
            <div className="relative">
              {/* Teacher discovery illustration */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-2xl">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">Priya Sharma</p>
                    <p className="text-xs" style={{ color: MUTED }}>Mathematics · 8 yrs exp</p>
                    <div className="flex items-center gap-1 mt-1">
                      {[1,2,3,4,5].map(i => (
                        <svg key={i} className="w-3 h-3" style={{ fill: "#F2B705" }} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                      ))}
                      <span className="text-xs ml-1" style={{ color: MUTED }}>4.9</span>
                    </div>
                  </div>
                  <div className="ml-auto">
                    <span className="bg-green-400/20 text-green-300 text-xs font-medium px-2.5 py-1 rounded-full border border-green-400/30">Available</span>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {["Algebra", "Calculus", "JEE Prep"].map(t => (
                    <span key={t} className="text-xs bg-white/15 text-white/90 px-2.5 py-1 rounded-full">{t}</span>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between text-xs" style={{ color: MUTED }}>
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    Kanpur, UP · 2.1 km
                  </span>
                  <span>₹600/hr</span>
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -top-4 -right-4 bg-white rounded-xl px-3 py-2 shadow-xl flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-semibold text-gray-700">1,200+ tutors nearby</span>
              </div>
            </div>
          </div>

          {/* Main heading */}
          <div>
            <h1 className="text-white text-3xl xl:text-4xl font-bold leading-tight tracking-tight">
              Find the Best Teachers<br />
              <span style={{ color: RED }}>Near You</span>
            </h1>
            <p className="mt-3 text-base leading-relaxed max-w-xs" style={{ color: MUTED }}>
              Connect with trusted, verified tutors for every subject — from JEE prep to creative arts.
            </p>
          </div>

          {/* Stats row */}
          <div className="flex gap-6">
            {[
              { value: "50K+", label: "Students" },
              { value: "8K+", label: "Teachers" },
              { value: "200+", label: "Subjects" },
            ].map(s => (
              <div key={s.label}>
                <p className="text-white text-xl font-bold">{s.value}</p>
                <p className="text-xs mt-0.5" style={{ color: MUTED }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="relative z-10 text-xs" style={{ color: `${MUTED}99` }}>
          © {new Date().getFullYear()} TutorNear · Trusted by families across India
        </p>
      </div>

      {/* ── Right: Auth Card ── */}
      <div className="flex-1 flex flex-col">
        {/* Mobile top bar — matches home page navbar exactly */}
        <div className="lg:hidden flex items-center justify-between px-5 h-16 border-b border-gray-100">
          <Link href="/" className="text-lg font-bold" style={{ color: NAVY }}>
            TutorNear
          </Link>
          <div className="flex items-center gap-5">
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Login
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: RED }}
            >
              Register
            </Link>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-4 py-8 sm:px-8">
          <div className="w-full max-w-[460px]">{children}</div>
        </div>
      </div>
    </div>
  );
}