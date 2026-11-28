import type { MentorDirectoryParams } from "./mentor-directory";

export type MentorVerificationStatus = "pending" | "verified" | "all";
export type MentorVerificationSearchField = "first_name" | "last_name" | "email";

export function buildMentorVerificationParams({
  status,
  searchField,
  search,
  page,
}: {
  status: MentorVerificationStatus;
  searchField: MentorVerificationSearchField;
  search: string;
  page: number;
}): MentorDirectoryParams {
  const conditions: string[] = [];
  if (status !== "all") conditions.push(`is_verified:eq:${status === "verified"}`);
  const value = search.trim();
  if (/[:,]/.test(value)) throw new Error("Search for one value without commas or colons.");
  if (value) conditions.push(`${searchField}:contains:${value}`);
  return {
    page,
    per_page: 10,
    sort: "id",
    ...(conditions.length ? { filter: conditions.join(",") } : {}),
  };
}
