import Link from "next/link";
import type { ReactNode } from "react";
import { AiOutlineArrowLeft } from "react-icons/ai";

interface BackLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
}

export default function BackLink({ href, children, className = "" }: BackLinkProps) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-brand-orange ${className}`}
    >
      <AiOutlineArrowLeft className="h-4 w-4 shrink-0" />
      {children}
    </Link>
  );
}
