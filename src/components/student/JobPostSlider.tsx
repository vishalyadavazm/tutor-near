"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import JobPostBanner from "@/components/student/JobPostBanner";
import type { StudentPost } from "@/services/student.service";

export default function JobPostSlider({ posts }: { posts: StudentPost[] }) {
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

  return (
    <div
      aria-label="Latest job posts"
      aria-roledescription="carousel"
      className="relative"
    >
      <Link
        href="/student/posts"
        aria-label={`View all job posts. Featured post: ${activePost.title}`}
        className="block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
      >
        <JobPostBanner post={activePost} />
      </Link>

      {posts.length > 1 && (
        <>
          <button
            type="button"
            onClick={showPrevious}
            aria-label="Show previous job post"
            className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl font-semibold text-[#15213D] shadow transition-colors hover:bg-white"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={showNext}
            aria-label="Show next job post"
            className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl font-semibold text-[#15213D] shadow transition-colors hover:bg-white"
          >
            ›
          </button>
          <div className="absolute bottom-3 right-4 flex items-center gap-2">
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
        </>
      )}
    </div>
  );
}
