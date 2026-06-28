import api from "@/lib/axios";
import axios from "axios";
import { API } from "@/constants/api";
import { saveToken, removeToken } from "@/utils/auth";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password: string;
  role: string;
  profile_type: string;
}

export interface LoginResponse {
  token?: string;
  access?: string;
  auth_token?: string;
  role?: string;
  profile_type?: string;
  user_type?: string;
  data?: {
    token?: string;
    role?: string;
    profile_type?: string;
    user_type?: string;
  };
}

export function extractRole(data: LoginResponse): string | null {
  const raw =
    data.role ||
    data.profile_type ||
    data.user_type ||
    data.data?.role ||
    data.data?.profile_type ||
    data.data?.user_type ||
    null;
  if (!raw) return null;
  return raw.toLowerCase().includes("teacher") ? "teacher" : "student";
}

class AuthService {
  private extractToken(data: LoginResponse): string | undefined {
    return data.token || data.access || data.auth_token || data.data?.token;
  }

  async login(data: LoginRequest): Promise<LoginResponse> {
    try {
      const res = await api.post<LoginResponse>(API.LOGIN, data);

      const token = this.extractToken(res.data);

      if (token) {
        saveToken(token);
      }

      return res.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.detail ||
            error.response?.data?.message ||
            error.response?.data?.error ||
            "Login failed.",
        );
      }

      throw new Error("Something went wrong.");
    }
  }

  async sendRegisterOTP(data: RegisterRequest) {
    try {
      const res = await api.post(API.REGISTER_OTP, data);
      return res.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.error ||
            error.response?.data?.detail ||
            error.response?.data?.message ||
            "Unable to send OTP.",
        );
      }

      throw new Error("Something went wrong.");
    }
  }

  async registerUser(data: RegisterRequest & { otp: string }) {
    try {
      const res = await api.post(API.REGISTER, data);
      return res.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.error ||
            error.response?.data?.detail ||
            error.response?.data?.message ||
            "Registration failed.",
        );
      }

      throw new Error("Something went wrong.");
    }
  }

  sendLoginOTP(email: string) {
    return api.post(API.LOGIN_OTP, { email });
  }

  verifyLoginOTP(email: string, otp: string) {
    return api.post(API.VERIFY_LOGIN_OTP, {
      email,
      otp,
    });
  }

  forgotPassword(email: string) {
    return api.post(API.FORGOT_PASSWORD, {
      email,
    });
  }

  logout() {
    removeToken();

    if (globalThis.window !== undefined) {
      globalThis.window.location.href = "/login";
    }
  }
  sendEmailOTP(email: string) {
    return api.post(API.EMAIL_SEND_OTP, {
      email,
    });
  }

  verifyEmailOTP(email: string, otp: string) {
    return api.post<LoginResponse>(API.VERIFY_EMAIL_OTP, {
      email,
      otp,
    });
  }
}

export default new AuthService();
