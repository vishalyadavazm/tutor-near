import type { Metadata } from "next";
import MyEnquiries from "@/components/student/MyEnquiries";

export const metadata: Metadata = { title: "My Enquiries · TutorNear" };
export default function MyEnquiriesPage() { return <MyEnquiries />; }
