"use client";

import { useRouter } from "next/navigation";
import BackLink from "@/components/common/BackLink";
import EnquiryEditor from "@/components/admin/EnquiryEditor";

export default function NewEnquiry() {
  const router = useRouter();
  return <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6"><BackLink href="/admin/enquiries">Enquiries</BackLink><h1 className="my-6 text-2xl font-bold text-brand-navy">Create enquiry</h1><EnquiryEditor onSaved={() => router.push("/admin/enquiries")} onCancel={() => router.push("/admin/enquiries")} /></main>;
}
