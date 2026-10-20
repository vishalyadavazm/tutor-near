import Image from "next/image";
import type { StudentPost } from "@/services/student.service";

export default function JobPostListItem({
  post,
  onClick,
}: {
  post: StudentPost;
  onClick: () => void;
}) {
  const bannerUrl = post.banner.replace(/^http:\/\//i, "https://");
  const createdAt = new Date(post.created_t);
  const formattedDate = Number.isNaN(createdAt.getTime())
    ? null
    : new Intl.DateTimeFormat("en", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(createdAt);
  const validUntil = post.valid_uptp ? new Date(post.valid_uptp) : null;
  const validUntilLabel =
    validUntil && !Number.isNaN(validUntil.getTime())
      ? new Intl.DateTimeFormat("en", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }).format(validUntil)
      : null;

  return (
    <article className="overflow-hidden rounded-xl border border-[#E4E9F0] bg-white shadow-sm transition-shadow hover:shadow-md">
      <button
        type="button"
        onClick={onClick}
        aria-label={`View details for ${post.title}`}
        className="flex w-full cursor-pointer flex-col p-3 text-left transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-orange-400 sm:flex-row sm:items-center sm:gap-4 sm:p-4"
      >
        <div className="relative h-36 shrink-0 overflow-hidden rounded-lg bg-gray-100 sm:h-24 sm:w-36">
          <Image
            src={bannerUrl}
            alt={`Banner for ${post.title}`}
            fill
            sizes="(max-width: 639px) 100vw, 144px"
            loading="lazy"
            className="object-cover"
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center pt-3 sm:pt-0">
          <div className="mb-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 text-[10px] font-medium text-orange-700">
              Tutor request
            </span>
            {formattedDate && (
              <time dateTime={post.created_t} className="text-[10px] text-gray-500">
                Posted {formattedDate}
              </time>
            )}
            <span className={`text-[10px] font-medium ${post.is_active ? "text-emerald-600" : "text-gray-400"}`}>
              · {post.is_active ? "Active" : "Closed"}
            </span>
          </div>
          <h2 className="text-sm font-semibold leading-snug text-[#111827] sm:text-base">
            {post.title}
          </h2>
          {post.description ? (
            <p className="mt-1 line-clamp-2 whitespace-pre-line text-[11px] leading-relaxed text-gray-600">
              {post.description}
            </p>
          ) : (
            <p className="mt-1 text-[11px] text-gray-400">No additional details provided.</p>
          )}
        </div>
        <div className="mt-3 flex shrink-0 justify-end sm:mt-0 sm:pl-2">
          {validUntilLabel && (
            <span className="text-[10px] text-gray-500">
              Valid until {validUntilLabel}
            </span>
          )}
          <span className="sr-only">Open post details</span>
        </div>
      </button>
    </article>
  );
}
