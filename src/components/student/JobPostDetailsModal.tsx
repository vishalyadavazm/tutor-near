"use client";

import Image from "next/image";
import { useEffect } from "react";
import {
  AiOutlineCalendar,
  AiOutlineClockCircle,
  AiOutlineClose,
  AiOutlineUser,
} from "react-icons/ai";
import type { StudentPost } from "@/services/student.service";

const NAVY = "#15213D";

function formatDate(value: string | null): string {
  if (!value) return "Not specified";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("en", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(date);
}

export default function JobPostDetailsModal({
  post,
  onClose,
}: {
  post: StudentPost;
  onClose: () => void;
}) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="job-post-modal-title"
        className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Job post #{post.id}
            </p>
            <h2 id="job-post-modal-title" className="mt-1 text-lg font-bold" style={{ color: NAVY }}>
              Post details
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close job post details"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition hover:bg-gray-200"
          >
            <AiOutlineClose />
          </button>
        </div>

        <div className="p-5 sm:p-6">
          {post.banner ? (
            <div className="relative mb-6 aspect-[16/9] w-full overflow-hidden rounded-xl bg-gray-100">
              <Image
                src={post.banner.replace(/^http:\/\//i, "https://")}
                alt={`Banner for ${post.title}`}
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-contain"
              />
            </div>
          ) : (
            <div className="mb-6 flex aspect-[16/9] items-center justify-center rounded-xl bg-gray-100 text-sm text-gray-500">
              No banner image
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                post.is_active ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600"
              }`}
            >
              {post.is_active ? "Active" : "Closed"}
            </span>
            <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
              Tutor request
            </span>
          </div>

          <h3 className="mt-4 text-xl font-bold text-gray-900">{post.title}</h3>
          <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-gray-700">
            {post.description || "No description provided."}
          </p>

          <dl className="mt-6 grid gap-4 rounded-xl bg-gray-50 p-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                <AiOutlineClockCircle />
                Posted
              </dt>
              <dd className="mt-1 text-gray-800">{formatDate(post.created_t)}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                <AiOutlineCalendar />
                Valid until
              </dt>
              <dd className="mt-1 text-gray-800">{formatDate(post.valid_uptp)}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                <AiOutlineUser />
                Created by user
              </dt>
              <dd className="mt-1 text-gray-800">
                {typeof post.created_by === "object" && post.created_by !== null
                  ? `${post.created_by.name} (#${post.created_by.id})`
                  : post.created_by !== null
                    ? `#${post.created_by}`
                    : "Not available"}
              </dd>
            </div>
            <div>
              <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                <AiOutlineClockCircle />
                Last modified
              </dt>
              <dd className="mt-1 text-gray-800">{formatDate(post.modified_t)}</dd>
            </div>
          </dl>
        </div>
      </section>
    </div>
  );
}
