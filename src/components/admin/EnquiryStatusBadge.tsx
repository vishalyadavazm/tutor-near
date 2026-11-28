import type { EnquiryStatus } from "@/services/enquiry.service";

export default function EnquiryStatusBadge({ status }: { status?: EnquiryStatus | null }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${status?.is_active === false ? "bg-gray-100 text-gray-500" : "bg-orange-50 text-orange-700"}`}>
      <span className={status?.is_active === false ? "line-through" : undefined}>{status?.name || "Status unavailable"}</span>
      {status?.is_active === false && <span className="sr-only"> (inactive)</span>}
    </span>
  );
}
