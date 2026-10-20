import axios from "axios";
import api from "@/lib/axios";
import { API } from "@/constants/api";

export interface EnquiryPayload {
  name: string;
  phone: string;
  enquirer_type: string;
  message: string;
}

function extractErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (data && typeof data === "object") {
      const firstFieldError = Object.values(data as Record<string, unknown>).find(
        (value) => Array.isArray(value) && value.length > 0,
      ) as string[] | undefined;
      if (firstFieldError) return firstFieldError[0];
    }
    return data?.detail || data?.message || data?.error || fallback;
  }
  return fallback;
}

class EnquiryService {
  async create(payload: EnquiryPayload): Promise<void> {
    try {
      await api.post(API.ENQUIRY, payload);
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Unable to send your enquiry."));
    }
  }
}

const enquiryService = new EnquiryService();

export default enquiryService;
