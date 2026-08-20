import type { MentorDirectoryEntry, MentorProfileRecord } from "@/services/mentor.service";

export interface DisplayTeacher {
  id: number;
  name: string;
  initials: string;
  bg: string;
  color: string;
  photoUrl: string | null;
  expertise: string;
  about: string;
  city: string;
  state: string;
  country: string;
  experienceYears: number | null;
  courses: string[];
  qualifications: string[];
  verified: boolean;
  rating: number | null;
  reviewCount: number;
  isLiked: boolean;
  isRated: boolean;
  totalLikes: number;
}

const AVATAR_PALETTE = [
  { bg: "#DBEAFE", color: "#1D4ED8" },
  { bg: "#D1FAE5", color: "#065F46" },
  { bg: "#FAE8FF", color: "#86198F" },
  { bg: "#FEF9C3", color: "#92400E" },
  { bg: "#ECFDF5", color: "#047857" },
  { bg: "#E0F2FE", color: "#0369A1" },
  { bg: "#F3E8FF", color: "#7E22CE" },
  { bg: "#FEF3C7", color: "#B45309" },
  { bg: "#FCE7F3", color: "#9D174D" },
  { bg: "#FDE68A", color: "#92400E" },
];

export function getAvatarColors(id: number) {
  return AVATAR_PALETTE[Math.abs(id) % AVATAR_PALETTE.length];
}

export function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function formatExperience(years: number | null) {
  if (years === null || years === undefined) return "Experience not specified";
  if (years < 1) return "< 1 year experience";
  return `${years}+ year${years === 1 ? "" : "s"} experience`;
}

export function toDisplayTeacher(
  p: MentorProfileRecord,
  qualificationNamesById: Record<number, string> = {},
): DisplayTeacher {
  const name = p.user?.name || "Tutor";
  const { bg, color } = getAvatarColors(p.id);
  return {
    id: p.id,
    name,
    initials: getInitials(name),
    bg,
    color,
    photoUrl: p.profile_pic,
    expertise: p.expertise,
    about: p.about,
    city: p.city,
    state: p.state,
    country: p.country,
    experienceYears: p.total_expierence_in_years,
    courses: p.courses_can_teach.map((c) => c.name),
    qualifications: p.highest_qualification.map((id) => qualificationNamesById[id] ?? `Qualification #${id}`),
    verified: !!p.identity_verification_name,
    rating: null,
    reviewCount: 0,
    isLiked: false,
    isRated: false,
    totalLikes: 0,
  };
}

/** /mentor/all wraps each teacher's optional profile alongside real name/rating data. */
export function toDisplayTeacherFromDirectory(entry: MentorDirectoryEntry): DisplayTeacher | null {
  const p = entry.profile;
  if (!p) return null;

  const name = [entry.first_name, entry.last_name].filter(Boolean).join(" ") || entry.email || "Tutor";
  const { bg, color } = getAvatarColors(entry.id);

  return {
    id: entry.id,
    name,
    initials: getInitials(name),
    bg,
    color,
    photoUrl: p.profile_pic,
    expertise: p.expertise,
    about: p.about,
    city: p.city,
    state: p.state,
    country: p.country,
    experienceYears: p.total_expierence_in_years,
    courses: p.courses_can_teach.map((c) => c.name),
    qualifications: p.highest_qualification.map((q) => q.name),
    verified: !!p.identity_verification_name,
    rating: entry.rating_count > 0 ? entry.total_rating : null,
    reviewCount: entry.rating_count,
    isLiked: entry.is_liked,
    isRated: entry.is_rated,
    totalLikes: entry.total_likes,
  };
}
