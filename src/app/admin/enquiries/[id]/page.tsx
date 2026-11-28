import { notFound } from "next/navigation";
import EnquiryDetail from "@/components/admin/EnquiryDetail";

export default async function EnquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const enquiryId = Number(id);
  if (!/^\d+$/.test(id) || !Number.isSafeInteger(enquiryId) || enquiryId < 1) notFound();
  return <EnquiryDetail enquiryId={enquiryId} />;
}
