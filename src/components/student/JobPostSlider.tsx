"use client";

import { useEffect, useState } from "react";
import JobPostBanner from "@/components/student/JobPostBanner";
import type { StudentPost } from "@/services/student.service";

export default function JobPostSlider({
  posts,
  compact = false,
}: {
  posts: StudentPost[];
  compact?: boolean;
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (posts.length < 2) return;

    const intervalId = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % posts.length);
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [posts.length]);

  if (posts.length === 0) return null;

  const activePost = posts[activeIndex];

  function showPrevious() {
    setActiveIndex((index) => (index - 1 + posts.length) % posts.length);
  }

  function showNext() {
    setActiveIndex((index) => (index + 1) % posts.length);
  }

  const navigationButtonClassName =
    "flex items-center justify-center rounded-full text-lg font-semibold text-[#15213D] transition-colors " +
    (compact
      ? "h-8 w-8 border border-gray-200 bg-white hover:bg-gray-100"
      : "h-7 w-7 bg-white/90 shadow hover:bg-white");

  return (
    <div
      aria-label="Latest job posts"
      aria-roledescription="carousel"
      className="relative"
    >
      <JobPostBanner post={activePost} compact={compact} />

      {posts.length > 1 && (
        <div className={compact ? "mt-2 flex items-center justify-end gap-2" : "absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2"}>
          <button
            type="button"
            onClick={showPrevious}
            aria-label="Show previous job post"
            className={navigationButtonClassName}
          >
            ‹
          </button>
          {compact ? (
            <span className="min-w-10 text-center text-xs tabular-nums text-gray-500" aria-live="off">
              <span className="sr-only">Job post </span>
              {activeIndex + 1} / {posts.length}
            </span>
          ) : (
            <div className="flex items-center gap-2">
              {posts.map((post, index) => (
                <button
                  key={post.id}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Show job post ${index + 1}: ${post.title}`}
                  aria-current={index === activeIndex ? "true" : undefined}
                  className={`h-2.5 rounded-full shadow-sm transition-all ${
                    index === activeIndex ? "w-6 bg-white" : "w-2.5 bg-white/60 hover:bg-white/90"
                  }`}
                />
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={showNext}
            aria-label="Show next job post"
            className={navigationButtonClassName}
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}
