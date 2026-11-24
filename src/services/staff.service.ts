import axios from "axios";
import api from "@/lib/axios";
import { API } from "@/constants/api";

export interface StaffRegistrationRequest {
  email: string;
  phone: string;
  password: string;
  first_name: string;
  last_name: string;
}

export interface StaffRecord {
  id?: number | string;
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
}

export interface StaffPage {
  staff: StaffRecord[];
  moreRecords: boolean;
}

export type StaffFieldErrors = Partial<Record<keyof StaffRegistrationRequest, string>>;

export class StaffApiError extends Error {
  constructor(message: string, public readonly fieldErrors: StaffFieldErrors = {}) {
    super(message);
    this.name = "StaffApiError";
  }
}

function firstMessage(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) return value;
  if (Array.isArray(value)) return value.find((item): item is string => typeof item === "string");
  return undefined;
}

function requestError(error: unknown, fallback: string): Error {
  if (error instanceof StaffApiError) return error;
  if (!axios.isAxiosError(error)) return new StaffApiError(fallback);
  const data = error.response?.data;
  if (!data || typeof data !== "object") return new StaffApiError(fallback);
  const fieldErrors: StaffFieldErrors = {};
  const fields: (keyof StaffRegistrationRequest)[] = [
    "email",
    "phone",
    "password",
    "first_name",
    "last_name",
  ];
  for (const field of fields) {
    const message = firstMessage(data[field]);
    if (message) fieldErrors[field] = message;
  }
  return new StaffApiError(
    firstMessage(data.detail) ||
      firstMessage(data.message) ||
      firstMessage(data.error) ||
      firstMessage(data.non_field_errors) ||
      Object.values(fieldErrors)[0] ||
      fallback,
    fieldErrors
  );
}

class StaffService {
  async getAll(page = 1, perPage = 10, signal?: AbortSignal): Promise<StaffPage> {
    try {
      const response = await api.get<unknown>(API.ALL_STAFF, {
        params: { page, per_page: perPage },
        signal,
      });
      const body = response.data;
      const envelope =
        body && typeof body === "object" && !Array.isArray(body)
          ? (body as {
              data?: unknown;
              results?: unknown;
              info?: { more_records?: boolean };
              next?: unknown;
            })
          : null;
      const records = Array.isArray(body) ? body : envelope?.data ?? envelope?.results;
      if (!Array.isArray(records))
        throw new StaffApiError("The staff API returned an unexpected response.");
      const staff = records.map((item: unknown): StaffRecord => {
        if (
          !item ||
          typeof item !== "object" ||
          typeof (item as Record<string, unknown>).email !== "string"
        ) {
          throw new StaffApiError("The staff API returned an invalid staff record.");
        }
        const record = item as Record<string, unknown>;
        return {
          id:
            typeof record.id === "number" || typeof record.id === "string" ? record.id : undefined,
          email: record.email as string,
          phone:
            typeof record.phone === "string" || typeof record.phone === "number"
              ? String(record.phone)
              : "",
          first_name: typeof record.first_name === "string" ? record.first_name : "",
          last_name: typeof record.last_name === "string" ? record.last_name : "",
        };
      });
      return { staff, moreRecords: envelope?.info?.more_records === true || !!envelope?.next };
    } catch (error) {
      if (axios.isCancel(error)) throw error;
      throw requestError(error, "Unable to load staff. Please try again.");
    }
  }

  async register(payload: StaffRegistrationRequest): Promise<void> {
    try {
      const response = await api.post(API.REGISTER_STAFF, {
        email: payload.email,
        phone: payload.phone,
        password: payload.password,
        first_name: payload.first_name,
        last_name: payload.last_name,
      });
      if (response.data?.success === false || response.data?.error) {
        throw new StaffApiError(
          firstMessage(response.data.error) ||
            firstMessage(response.data.message) ||
            "Unable to create staff account."
        );
      }
    } catch (error) {
      throw requestError(error, "Unable to create staff account. Please try again.");
    }
  }
}

const staffService = new StaffService();

export default staffService;
