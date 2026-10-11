"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import JobPostListItem from "@/components/student/JobPostListItem";
import StudentJobPostCreator from "@/components/student/StudentJobPostCreator";
import studentService, { StudentPost } from "@/services/student.service";

export default function StudentPostsPage() {
  const [posts, setPosts] = useState<StudentPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [moreRecords, setMoreRecords] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"recent" | "oldest">("recent");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      setLoadMoreError(null);
      try {
        const result = await studentService.getPostsPage();
        if (!cancelled) {
          setPosts(result.posts);
          setCurrentPage(result.page);
          setMoreRecords(result.moreRecords);
        }
      } catch {
        if (!cancelled) setError("Couldn't load job posts. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [retryCount]);

  async function loadMorePosts() {
    setLoadingMore(true);
    setLoadMoreError(null);
    try {
      const result = await studentService.getPostsPage(currentPage + 1);
      setPosts((currentPosts) => [...currentPosts, ...result.posts]);
      setCurrentPage(result.page);
      setMoreRecords(result.moreRecords);
    } catch {
      setLoadMoreError("Couldn't load more job posts. Please try again.");
    } finally {
      setLoadingMore(false);
    }
  }

  const sortedPosts = useMemo(
    () =>
      [...posts].sort((a, b) => {
        const dateDifference = Date.parse(b.created_t) - Date.parse(a.created_t);
        const order = Number.isFinite(dateDifference) && dateDifference !== 0
          ? dateDifference
          : b.id - a.id;
        return sortOrder === "recent" ? order : -order;
      }),
    [posts, sortOrder],
  );

  return (
    <main className="min-h-screen bg-[#F7F9FC] text-[#111827]">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-3 sm:px-5">
          <Link href="/student" className="flex items-center gap-2 shrink-0">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#15213D] shadow-sm">
              <svg className="h-4 w-4" fill="white" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
              </svg>
            </span>
            <span className="flex min-w-[74px] flex-col leading-tight">
              <span className="text-sm font-semibold">
                <span className="text-[#15213D]">Tutor</span>
                <span className="text-[#E8621A]">Near</span>
              </span>
              <span className="text-[9px] font-medium uppercase tracking-[0.08em] text-gray-400">
                Verified tutors
              </span>
            </span>
          </Link>
          <span className="text-xs font-medium text-gray-500 sm:hidden">Job posts</span>
        </div>
      </header>

      <div className="mx-auto max-w-[1120px] px-4 py-5 sm:px-6 sm:py-7">
        <Link
          href="/student"
          className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 transition-colors hover:text-[#E8621A]"
        >
          <span aria-hidden="true">←</span>
          Back to dashboard
        </Link>

        <section className="mb-5 rounded-xl border border-[#E4E9F0] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#E8621A]">
                Student opportunities
              </p>
              <h1 className="mt-1 text-xl font-bold tracking-tight text-[#111827]">Job posts</h1>
              <p className="mt-1 text-xs text-gray-500">
                Browse tutoring requests from students and find your next opportunity.
              </p>
            </div>
            {!loading && !error && (
              <span className="mt-1 rounded-full bg-[#F2F5F9] px-3 py-1 text-[11px] font-medium text-gray-600">
                {sortedPosts.length} loaded post{sortedPosts.length === 1 ? "" : "s"}
              </span>
            )}
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-3">
            <StudentJobPostCreator onCreated={() => setRetryCount((count) => count + 1)} />
            <label className="flex items-center gap-2 text-[11px] text-gray-500">
              Sort by:
              <select
                value={sortOrder}
                onChange={(event) => setSortOrder(event.target.value as "recent" | "oldest")}
                className="rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-700 outline-none focus:border-orange-300"
              >
                <option value="recent">Most Recent</option>
                <option value="oldest">Oldest</option>
              </select>
            </label>
          </div>
        </section>

        {loading ? (
          <div className="flex flex-col gap-3">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="h-32 animate-shimmer rounded-xl"
              />
            ))}
          </div>
        ) : error ? (
          <div
            role="alert"
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            <span>{error}</span>
            <button
              onClick={() => setRetryCount((count) => count + 1)}
              className="font-semibold underline underline-offset-2"
            >
              Retry
            </button>
          </div>
        ) : sortedPosts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-white px-4 py-12 text-center text-sm text-gray-500">
            No job posts yet.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {sortedPosts.map((post) => (
              <JobPostListItem key={post.id} post={post} />
            ))}
          </div>
        )}
        {!loading && !error && moreRecords && (
          <div className="mt-5 flex flex-col items-center gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:justify-between">
            <p className="text-[11px] text-gray-500">
              Showing {sortedPosts.length} request{sortedPosts.length === 1 ? "" : "s"}
            </p>
            {loadMoreError && (
              <p role="alert" className="text-sm text-red-600">
                {loadMoreError}
              </p>
            )}
            <button
              type="button"
              onClick={loadMorePosts}
              disabled={loadingMore}
              className="rounded-lg bg-[#15213D] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#243557] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loadingMore
                ? "Loading…"
                : loadMoreError
                  ? "Retry"
                  : "Load more requests"}
            </button>
          </div>
        )}
        {!loading && !error && !moreRecords && sortedPosts.length > 0 && (
          <p className="mt-5 border-t border-gray-200 pt-4 text-[11px] text-gray-500">
            Showing {sortedPosts.length} request{sortedPosts.length === 1 ? "" : "s"}
          </p>
        )}
      </div>
    </main>
  );
}
