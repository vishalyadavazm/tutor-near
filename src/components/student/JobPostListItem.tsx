import Image from "next/image";
import type { StudentPost } from "@/services/student.service";

export default function JobPostListItem({ post }: { post: StudentPost }) {
  const bannerUrl = post.banner.replace(/^http:\/\//i, "https://");
  const createdAt = new Date(post.created_t);
  const formattedDate = Number.isNaN(createdAt.getTime())
    ? null
    : new Intl.DateTimeFormat("en", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(createdAt);

  return (
    <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md sm:flex">
      <div className="relative h-48 shrink-0 bg-gray-100 sm:h-auto sm:min-h-52 sm:w-64">
        <Image
          src={bannerUrl}
          alt=""
          fill
          sizes="(max-width: 639px) 100vw, 256px"
          loading="lazy"
          className="object-cover"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center p-5 sm:p-6">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700">
            Tutor request
          </span>
          {formattedDate && (
            <time dateTime={post.created_t} className="text-xs text-gray-500">
              Posted {formattedDate}
            </time>
          )}
        </div>
        <h2 className="text-lg font-semibold leading-snug text-[#15213D] sm:text-xl">
          {post.title}
        </h2>
        {post.description ? (
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-gray-600">
            {post.description}
          </p>
        ) : (
          <p className="mt-2 text-sm text-gray-400">No additional details provided.</p>
        )}
      </div>
    </article>
  );
}
