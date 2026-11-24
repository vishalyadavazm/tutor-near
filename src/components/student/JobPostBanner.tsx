import Image from "next/image";
import Link from "next/link";
import type { StudentPost } from "@/services/student.service";

export default function JobPostBanner({
  post,
  compact = false,
}: {
  post: StudentPost;
  compact?: boolean;
}) {
  const bannerUrl = post.banner.replace(/^http:\/\//i, "https://");
  const createdAt = new Date(post.created_t);
  const postedLabel = Number.isNaN(createdAt.getTime())
    ? null
    : new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(createdAt);

  return (
    <article className={`relative isolate grid overflow-hidden rounded-2xl bg-[#10233A] text-white shadow-sm ${compact ? "min-h-[140px] md:grid-cols-[minmax(0,1fr)_190px]" : "min-h-[220px] md:grid-cols-[minmax(0,1fr)_220px]"}`}>
      <Image
        src={bannerUrl}
        alt=""
        fill
        sizes="(max-width: 1279px) 100vw, 1400px"
        loading="lazy"
        className="absolute inset-0 -z-20 h-full w-full object-cover opacity-50"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#0c1b2d]/95 via-[#10233a]/70 to-[#10233a]/40" />
      <div className="absolute -right-12 top-1/2 -z-10 hidden h-72 w-72 -translate-y-1/2 rounded-full border-[44px] border-white/[0.04] md:block" />
      <div className={`flex min-w-0 flex-col justify-center ${compact ? "p-4 md:px-5" : "p-5 sm:p-7 md:pl-16 md:pr-10"}`}>
        <div className={`flex flex-wrap items-center gap-x-3 gap-y-2 ${compact ? "mb-2 text-[10px] sm:text-xs" : "mb-3 text-xs"}`}>
          <span className="rounded-full border border-orange-300/20 bg-orange-500/15 px-3 py-1 font-semibold uppercase tracking-wide text-orange-100">
            <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-orange-400 align-middle" />
            Tuition requirement
          </span>
          {!compact && <span className="text-white/60">Post #{post.id}</span>}
          {postedLabel && <span className="text-white/60">Posted {postedLabel}</span>}
        </div>
        <h2 className={`max-w-4xl leading-tight tracking-tight ${compact ? "line-clamp-2 text-base font-semibold sm:text-xl" : "text-xl font-bold sm:text-2xl lg:text-[27px]"}`}>
          {post.title}
        </h2>
        {post.description && (
          <p className={`max-w-4xl leading-relaxed text-white/75 ${compact ? "mt-1 hidden text-xs sm:line-clamp-1" : "mt-2 line-clamp-2 text-sm"}`}>
            {post.description}
          </p>
        )}
      </div>
      <div className={`flex flex-row items-center justify-between gap-3 border-t border-white/10 bg-black/10 md:flex-col md:items-stretch md:justify-center md:border-l md:border-t-0 md:bg-transparent ${compact ? "px-4 py-3" : "px-5 py-4 md:px-6"}`}>
        <Link
          href="/student/posts"
          className="text-xs font-semibold text-sky-200 transition-colors hover:text-white md:text-right"
        >
          View all job posts <span aria-hidden="true">›</span>
        </Link>
        <Link
          href="/student/posts"
          className={`whitespace-nowrap rounded-lg bg-[#E8621A] text-center font-semibold text-white shadow transition-colors hover:bg-orange-600 ${compact ? "px-3 py-2 text-xs" : "px-4 py-2.5 text-sm"}`}
        >
          View requirement
        </Link>
      </div>
    </article>
  );
}
