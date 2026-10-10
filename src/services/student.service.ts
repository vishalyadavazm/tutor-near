import api from "@/lib/axios";
import axios from "axios";
import { API } from "@/constants/api";

interface StudentPostListResponse {
  data: StudentPost[];
  info: {
    page: number;
    per_page: number;
    more_records: boolean;
  };
}

export interface StudentProfileUserRef {
  id: number;
  name: string;
}

/** Returned in place of `user` when the student hasn't created a profile yet. */
export interface StudentProfileBasicUser {
  id: number;
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
}

export interface StudentStandard {
  id: number;
  name: string;
}

export interface StudentProfileRecord {
  id: number;
  created_t: string;
  modified_t: string;
  profile_pic: string | null;
  gender: string;
  date_of_birth: string | null;
  about: string;
  looking_for_mentor: boolean;
  temp_address: string;
  permanent_address: string;
  city: string;
  state: string;
  country: string;
  created_by: StudentProfileUserRef | null;
  modified_by: StudentProfileUserRef | null;
  user: StudentProfileUserRef;
  standard: StudentStandard | null;
}

export interface StudentProfilePayload {
  profile_pic?: File;
  gender: string;
  date_of_birth?: string;
  about: string;
  looking_for_mentor?: boolean;
  temp_address: string;
  permanent_address: string;
  city: string;
  state: string;
  country: string;
  standard: number;
}

export interface StudentPost {
  id: number;
  created_t: string;
  modified_t: string;
  banner: string;
  title: string;
  description: string | null;
  valid_uptp: string | null;
  is_active: boolean;
  created_by: number;
  modified_by: number | null;
}

export interface StudentPostPayload {
  title: string;
  banner: File;
  description?: string;
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

class StudentService {
  async getPostsPage(page = 1, perPage = 10): Promise<{
    posts: StudentPost[];
    page: number;
    perPage: number;
    moreRecords: boolean;
  }> {
    const res = await api.get<StudentPostListResponse>(API.POST_POSTS, {
      params: { page, per_page: perPage },
    });
    return {
      posts: res.data.data,
      page: res.data.info.page,
      perPage: res.data.info.per_page,
      moreRecords: res.data.info.more_records,
    };
  }

  async getPosts(): Promise<StudentPost[]> {
    const result = await this.getPostsPage();
    return result.posts;
  }

  async createPost(payload: StudentPostPayload): Promise<void> {
    const formData = new FormData();
    formData.append("title", payload.title);
    formData.append("banner", payload.banner);
    if (payload.description?.trim()) {
      formData.append("description", payload.description.trim());
    }

    try {
      await api.post(API.POST_POSTS, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Unable to create job post."));
    }
  }

  async getProfiles(): Promise<StudentProfileRecord[]> {
    const res = await api.get<{ data: StudentProfileRecord[] | { id: null; user: StudentProfileBasicUser } }>(
      API.STUDENT_PROFILE,
    );
    return Array.isArray(res.data.data) ? res.data.data : [];
  }

  /**
   * Before a student has created a profile, the API returns `{ id: null, user: {...basic user fields} }`
   * instead of a list — this fetches that in one call so the create form can prefill name/email.
   */
  async getMyProfile(): Promise<{ profile: StudentProfileRecord | null; basicUser: StudentProfileBasicUser | null }> {
    const res = await api.get<{ data: StudentProfileRecord[] | { id: null; user: StudentProfileBasicUser } }>(
      API.STUDENT_PROFILE,
    );
    const data = res.data.data;
    if (Array.isArray(data)) {
      return { profile: data[0] ?? null, basicUser: null };
    }
    return { profile: null, basicUser: data?.user ?? null };
  }

  private buildProfileFormData(payload: StudentProfilePayload): FormData {
    const formData = new FormData();
    if (payload.profile_pic) {
      formData.append("profile_pic", payload.profile_pic);
    }
    formData.append("gender", payload.gender);
    if (payload.date_of_birth) {
      formData.append("date_of_birth", payload.date_of_birth);
    }
    formData.append("about", payload.about);
    if (payload.looking_for_mentor !== undefined) {
      formData.append("looking_for_mentor", String(payload.looking_for_mentor));
    }
    formData.append("temp_address", payload.temp_address);
    formData.append("permanent_address", payload.permanent_address);
    formData.append("city", payload.city);
    formData.append("state", payload.state);
    formData.append("country", payload.country);
    formData.append("standard", String(payload.standard));
    return formData;
  }

  async createProfile(payload: StudentProfilePayload) {
    try {
      const res = await api.post(API.STUDENT_PROFILE, this.buildProfileFormData(payload), {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Unable to save profile."));
    }
  }

  async updateProfile(id: number, payload: StudentProfilePayload) {
    try {
      const res = await api.patch(`${API.STUDENT_PROFILE}/${id}`, this.buildProfileFormData(payload), {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Unable to update profile."));
    }
  }
}

export default new StudentService();
