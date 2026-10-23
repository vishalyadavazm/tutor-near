import axios from "axios";
import api from "@/lib/axios";
import { API } from "@/constants/api";

export interface EnquiryPayload {
  name: string;
  phone: string;
  subject: string;
  grade: string;
  enquirer_type: string;
  message: string;
  mentor: number;
}

export interface EnquiryRecord {
  id: number | string;
  name: string;
  phone: string;
  enquirer_type: string;
  message: string;
  mentor?: { id: number; name: string } | null;
  assigned_to?: { id: number; name: string } | null;
  created_t?: string;
  created_at?: string;
}

export interface EnquiryPage {
  enquiries: EnquiryRecord[];
  page: number;
  perPage: number;
  moreRecords: boolean;
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
  async getAll(
    page = 1,
    perPage = 10,
    sort = "-created_t",
    filter?: string,
  ): Promise<EnquiryPage> {
    try {
      const response = await api.get<unknown>(API.ENQUIRY, {
        params: { page, per_page: perPage, sort, ...(filter ? { filter } : {}) },
      });
      const responseData = response.data;
      const result = Array.isArray(responseData)
        ? { enquiries: responseData, info: null }
        : responseData && typeof responseData === "object"
          ? {
              enquiries: (responseData as { data?: unknown }).data,
              info: (responseData as {
                info?: { page?: number; per_page?: number; more_records?: boolean };
              }).info ?? null,
            }
          : null;

      if (!result || !Array.isArray(result.enquiries)) {
        throw new Error("The enquiries API returned an unexpected response.");
      }

      const enquiries = result.enquiries.map((item: unknown, index: number): EnquiryRecord => {
        if (!item || typeof item !== "object") {
          throw new Error(`The enquiries API returned an invalid record at position ${index + 1}.`);
        }
        const record = item as Partial<EnquiryRecord>;
        if (
          (typeof record.id !== "number" && typeof record.id !== "string") ||
          typeof record.name !== "string" ||
          typeof record.phone !== "string" ||
          typeof record.enquirer_type !== "string" ||
          typeof record.message !== "string"
        ) {
          throw new Error(`The enquiries API returned an incomplete record at position ${index + 1}.`);
        }
        return record as EnquiryRecord;
      });

      return {
        enquiries,
        page: result.info?.page ?? page,
        perPage: result.info?.per_page ?? perPage,
        moreRecords: result.info?.more_records ?? false,
      };
    } catch (error) {
      if (error instanceof Error && !axios.isAxiosError(error)) throw error;
      throw new Error(extractErrorMessage(error, "Unable to load enquiries."));
    }
  }

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
