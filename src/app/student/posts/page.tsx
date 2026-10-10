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
        return Number.isFinite(dateDifference) && dateDifference !== 0
          ? dateDifference
          : b.id - a.id;
      }),
    [posts],
  );

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 border-b border-gray-100 bg-white">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center px-5">
          <Link
            href="/student"
            className="text-sm font-semibold text-gray-600 transition-colors hover:text-[#E8621A]"
          >
            ← Back to dashboard
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-[1400px] px-5 py-8">
        <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#E8621A]">
            Student opportunities
          </p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-[#15213D]">Job posts</h1>
              <p className="mt-1 text-sm text-gray-500">
                Browse tutoring requests from students and find your next opportunity.
              </p>
            </div>
            {!loading && !error && (
              <span className="text-sm font-medium text-gray-500">
                {sortedPosts.length} loaded post{sortedPosts.length === 1 ? "" : "s"}
              </span>
            )}
          </div>
          <div className="mt-5">
            <StudentJobPostCreator onCreated={() => setRetryCount((count) => count + 1)} />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col gap-4">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="h-52 animate-shimmer rounded-2xl"
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
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-12 text-center text-sm text-gray-500">
            No job posts yet.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {sortedPosts.map((post) => (
              <JobPostListItem key={post.id} post={post} />
            ))}
          </div>
        )}
        {!loading && !error && moreRecords && (
          <div className="mt-6 flex flex-col items-center gap-3">
            {loadMoreError && (
              <p role="alert" className="text-sm text-red-600">
                {loadMoreError}
              </p>
            )}
            <button
              type="button"
              onClick={loadMorePosts}
              disabled={loadingMore}
              className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loadingMore
                ? "Loading more posts…"
                : loadMoreError
                  ? "Retry loading posts"
                  : "Load more job posts"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
