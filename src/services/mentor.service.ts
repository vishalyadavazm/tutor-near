import api from "@/lib/axios";
import axios from "axios";
import { API } from "@/constants/api";

export interface CourseOption {
  id: number;
  name: string;
}

export interface QualificationOption {
  id: number;
  degree_name: string;
}

export interface DocumentNameOption {
  id: number;
  name: string;
}

interface ListResponse<T> {
  data: T[];
}

export interface MentorProfileUserRef {
  id: number;
  name: string;
}

/** Returned in place of `user` when the mentor hasn't created a profile yet. */
export interface MentorProfileBasicUser {
  id: number;
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
}

export interface MentorProfileRecord {
  id: number;
  created_t: string;
  modified_t: string;
  profile_pic: string | null;
  gender: string;
  date_of_birth: string;
  identity_verification: string | null;
  temp_address: string;
  permanent_address: string;
  city: string;
  state: string;
  country: string;
  total_expierence_in_years: number | null;
  expertise: string;
  about: string;
  created_by: MentorProfileUserRef | null;
  modified_by: MentorProfileUserRef | null;
  user: MentorProfileUserRef;
  identity_verification_name: DocumentNameOption | null;
  courses_can_teach: CourseOption[];
  highest_qualification: number[];
}

/* ── /mentor/all: public directory (different shape from /mentor/profile) ── */

export interface MentorAllQualification {
  id: number;
  name: string;
}

export interface MentorAllProfile {
  id: number;
  created_t: string;
  modified_t: string;
  profile_pic: string | null;
  gender: string;
  date_of_birth: string;
  identity_verification: string | null;
  temp_address: string;
  permanent_address: string;
  city: string;
  state: string;
  country: string;
  total_expierence_in_years: number | null;
  expertise: string;
  about: string;
  created_by: MentorProfileUserRef | null;
  modified_by: MentorProfileUserRef | null;
  user: number;
  identity_verification_name: DocumentNameOption | null;
  courses_can_teach: CourseOption[];
  highest_qualification: MentorAllQualification[];
}

export interface MentorDirectoryEntry {
  id: number;
  profile: MentorAllProfile | null;
  total_rating: number;
  is_liked: boolean;
  is_rated: boolean;
  email: string;
  phone: string;
  first_name: string | null;
  last_name: string | null;
  profile_type: string;
  rating_sum: number;
  rating_count: number;
  total_likes: number;
}

export interface MentorProfilePayload {
  profile_pic?: File;
  gender: string;
  date_of_birth: string;
  temp_address: string;
  permanent_address: string;
  city: string;
  state: string;
  country: string;
  total_expierence_in_years: number;
  expertise: string;
  about: string;
  courses_can_teach: number[];
  highest_qualification: number[];
  identity_verification?: File;
  identity_verification_name?: number;
}

function extractErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (data && typeof data === "object") {
      const firstFieldError = Object.values(data as Record<string, unknown>).find(
        (v) => Array.isArray(v) && v.length > 0,
      ) as string[] | undefined;
      if (firstFieldError) return firstFieldError[0];
    }
    return data?.detail || data?.message || data?.error || fallback;
  }
  return fallback;
}

class MentorService {
  async getQualifications(): Promise<QualificationOption[]> {
    const res = await api.get<ListResponse<QualificationOption>>(API.COMMON_QUALIFICATION);
    return res.data.data;
  }

  async getDocumentNames(): Promise<DocumentNameOption[]> {
    const res = await api.get<ListResponse<DocumentNameOption>>(API.COMMON_DOCUMENT_NAME);
    return res.data.data;
  }

  async getCourses(): Promise<CourseOption[]> {
    const res = await api.get<ListResponse<CourseOption>>(API.COMMON_COURSES);
    return res.data.data;
  }

  async getProfiles(): Promise<MentorProfileRecord[]> {
    const res = await api.get<{ data: MentorProfileRecord[] | { id: null; user: MentorProfileBasicUser } }>(
      API.MENTOR_PROFILE,
    );
    return Array.isArray(res.data.data) ? res.data.data : [];
  }

  /**
   * Before a mentor has created a profile, the API returns `{ id: null, user: {...basic user fields} }`
   * instead of a list — this fetches that in one call so the create form can prefill name/email.
   */
  async getMyProfile(): Promise<{ profile: MentorProfileRecord | null; basicUser: MentorProfileBasicUser | null }> {
    const res = await api.get<{ data: MentorProfileRecord[] | { id: null; user: MentorProfileBasicUser } }>(
      API.MENTOR_PROFILE,
    );
    const data = res.data.data;
    if (Array.isArray(data)) {
      return { profile: data[0] ?? null, basicUser: null };
    }
    return { profile: null, basicUser: data?.user ?? null };
  }

  async getAllProfiles(): Promise<MentorDirectoryEntry[]> {
    const res = await api.get<ListResponse<MentorDirectoryEntry>>(API.MENTOR_ALL_PROFILES);
    return res.data.data;
  }

  private buildProfileFormData(payload: MentorProfilePayload): FormData {
    const formData = new FormData();
    if (payload.profile_pic) {
      formData.append("profile_pic", payload.profile_pic);
    }
    formData.append("gender", payload.gender);
    formData.append("date_of_birth", payload.date_of_birth);
    formData.append("temp_address", payload.temp_address);
    formData.append("permanent_address", payload.permanent_address);
    formData.append("city", payload.city);
    formData.append("state", payload.state);
    formData.append("country", payload.country);
    formData.append("total_expierence_in_years", String(payload.total_expierence_in_years));
    formData.append("expertise", payload.expertise);
    formData.append("about", payload.about);
    payload.courses_can_teach.forEach((id) => formData.append("courses_can_teach", String(id)));
    payload.highest_qualification.forEach((id) => formData.append("highest_qualification", String(id)));
    if (payload.identity_verification) {
      formData.append("identity_verification", payload.identity_verification);
    }
    if (payload.identity_verification_name) {
      formData.append("identity_verification_name", String(payload.identity_verification_name));
    }
    return formData;
  }

  async createProfile(payload: MentorProfilePayload) {
    try {
      const res = await api.post(API.MENTOR_PROFILE, this.buildProfileFormData(payload), {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Unable to save profile."));
    }
  }

  async updateProfile(payload: MentorProfilePayload) {
    try {
      const res = await api.patch(API.MENTOR_PROFILE, this.buildProfileFormData(payload), {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Unable to update profile."));
    }
  }

  async toggleLike(mentorId: number) {
    try {
      const res = await api.post(API.MENTOR_LIKE, { mentor: mentorId });
      return res.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Unable to update like."));
    }
  }

  async rateMentor(mentorId: number, rating: number) {
    try {
      const res = await api.post(API.MENTOR_RATING, { mentor: mentorId, rating });
      return res.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Unable to submit rating."));
    }
  }
}

export default new MentorService();
