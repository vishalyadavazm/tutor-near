import Link from "next/link";
import { AiOutlineInbox, AiOutlineRight } from "react-icons/ai";

const NAVY = "#15213D";
const ORANGE = "#E8621A";

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-[#F5F7FB] text-gray-900">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-lg font-extrabold tracking-tight" style={{ color: NAVY }}>
            Tutor<span style={{ color: ORANGE }}>Near</span>
            <span className="ml-2 text-sm font-medium text-gray-500">Admin</span>
          </Link>
          <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
            Administration
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold" style={{ color: ORANGE }}>ADMINISTRATION</p>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl" style={{ color: NAVY }}>
          Admin dashboard
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Choose an area to manage.
        </p>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/admin/enquiries"
            className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                <AiOutlineInbox className="h-6 w-6" />
              </span>
              <AiOutlineRight className="mt-1 text-gray-400 transition group-hover:translate-x-1 group-hover:text-orange-600" />
            </div>
            <h2 className="mt-5 text-lg font-semibold" style={{ color: NAVY }}>Enquiries</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-500">
              View enquiries and contact details submitted through the website.
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}
