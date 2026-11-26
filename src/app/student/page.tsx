import StudentHome from "@/components/student/StudentHome";

export default async function StudentPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string | string[]; city?: string | string[] }>;
}) {
  const query = await searchParams;
  const search = typeof query.search === "string" ? query.search : "";
  const city = typeof query.city === "string" ? query.city : "";
  return <StudentHome key={JSON.stringify([search, city])} initialSearch={search} initialCity={city} />;
}
