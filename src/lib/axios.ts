import axios from "axios";
import { clearAuth, getIsAuthenticatedSnapshot } from "@/utils/auth";
import { notifyError, queueNotification } from "@/lib/notifications";
import { getApiErrorMessage } from "@/lib/api-error";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 seconds
  withCredentials: true,
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("authToken");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== "undefined" && !axios.isCancel(error)) {
      const backendMessage = getApiErrorMessage(error.response?.data);
      const fallbackMessage =
        error.code === "ECONNABORTED" || error.code === "ETIMEDOUT"
          ? "The request timed out. Please try again."
          : !error.response
            ? "Unable to connect. Please check your connection and try again."
            : "The request failed. Please try again.";
      const message = backendMessage || fallbackMessage;
      let redirecting = false;

      if (error.response?.status === 401) {
        const hadSession = getIsAuthenticatedSnapshot();
        clearAuth();

        // Keep administrative sessions on their own sign-in page.
        const pathname = window.location.pathname.replace(/\/+$/, "");
        const loginPath = pathname === "/admin" || pathname.startsWith("/admin/") ? "/admin" : "/login";
        if (pathname !== loginPath) {
          const redirectMessage = backendMessage || (hadSession
            ? "Your session has expired. Please sign in again."
            : fallbackMessage);
          queueNotification("error", redirectMessage, "api-auth-error");
          redirecting = true;
          window.location.href = loginPath;
        }
      }

      if (!redirecting) {
        // Repeated failures with the same message update one toast instead of stacking.
        notifyError(message, "api-error:" + message);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
