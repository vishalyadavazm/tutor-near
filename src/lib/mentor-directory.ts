export const MENTOR_SEARCH_FIELDS = [
  { value: "course", label: "Course or class", placeholder: "Search courses or classes..." },
  { value: "expertise", label: "Skill or subject", placeholder: "Search skills or subjects..." },
  { value: "first_name", label: "Tutor first name", placeholder: "Search tutor first names..." },
  { value: "last_name", label: "Tutor last name", placeholder: "Search tutor last names..." },
] as const;

export type MentorSearchField = typeof MENTOR_SEARCH_FIELDS[number]["value"];
export type MentorSort = "relevant" | "rating" | "exp" | "name";

export const MENTOR_EXPERIENCE_BUCKETS = [
  { label: "0–2 years", min: 0, max: 2 },
  { label: "3–5 years", min: 3, max: 5 },
  { label: "6–10 years", min: 6, max: 10 },
  { label: "10+ years", min: 10, max: null },
] as const;

export interface MentorDirectoryFilters {
  searchField: MentorSearchField;
  searchText: string;
  city: string;
  courses: string[];
  experience: string;
  verifiedOnly: boolean;
  sort: MentorSort;
}

export interface MentorDirectoryParams {
  page: number;
  per_page: number;
  sort: string;
  filter?: string;
}

const SORT_FIELDS: Record<MentorSort, string> = {
  relevant: "id",
  rating: "-total_rating,id",
  exp: "-total_expierence_in_years,id",
  name: "first_name,last_name,id",
};

function filterValue(value: string): string {
  // The API uses commas and colons as syntax and documents no literal escaping.
  if (/[:,]/.test(value)) {
    throw new Error("Search and filter values cannot contain commas or colons.");
  }
  return value;
}

export function buildMentorDirectoryParams(
  filters: MentorDirectoryFilters,
  page = 1,
): MentorDirectoryParams {
  const conditions: string[] = [];
  const search = filters.searchText.trim();
  const city = filters.city.trim();
  if (search) conditions.push(`${filters.searchField}:contains:${filterValue(search)}`);
  if (city) conditions.push(`city:contains:${filterValue(city)}`);
  for (const course of filters.courses) {
    conditions.push(`course:eq:${filterValue(course)}`);
  }
  const bucket = MENTOR_EXPERIENCE_BUCKETS.find((item) => item.label === filters.experience);
  if (bucket) {
    conditions.push(`total_expierence_in_years:gte:${bucket.min}`);
    if (bucket.max !== null) conditions.push(`total_expierence_in_years:lte:${bucket.max}`);
  }
  if (filters.verifiedOnly) conditions.push("is_verified:eq:true");
  return {
    page,
    per_page: 12,
    sort: SORT_FIELDS[filters.sort],
    ...(conditions.length ? { filter: conditions.join(",") } : {}),
  };
}
