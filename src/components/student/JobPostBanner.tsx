import Image from "next/image";
import type { StudentPost } from "@/services/student.service";

export default function JobPostBanner({ post }: { post: StudentPost }) {
  const bannerUrl = post.banner.replace(/^http:\/\//i, "https://");

  return (
    <article className="relative isolate min-h-52 overflow-hidden rounded-2xl bg-[#15213D] shadow-sm sm:min-h-60">
      <Image
        src={bannerUrl}
        alt=""
        fill
        sizes="(max-width: 1279px) 100vw, 50vw"
        loading="lazy"
        className="absolute inset-0 -z-20 h-full w-full object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#101a31]/90 via-[#101a31]/55 to-transparent" />
      <div className="flex min-h-52 max-w-2xl flex-col justify-end p-5 sm:min-h-60 sm:p-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-orange-200">
          Job post
        </p>
        <h2 className="text-xl font-bold leading-tight text-white sm:text-2xl">
          {post.title}
        </h2>
        {post.description && (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-white/85">
            {post.description}
          </p>
        )}
      </div>
    </article>
  );
}
