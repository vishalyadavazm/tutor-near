import type { Metadata } from "next";
import EnquiryStatusManager from "@/components/admin/EnquiryStatusManager";

export const metadata: Metadata = { title: "Enquiry Statuses · TutorNear" };

export default function EnquiryStatusesPage() { return <EnquiryStatusManager />; }
