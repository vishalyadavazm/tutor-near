import axios from "axios";
import api from "@/lib/axios";
import { API } from "@/constants/api";
import { getApiErrorMessage } from "@/lib/api-error";

export type EnquiryId = number | string;
export interface EnquiryUserRef { id: number; name: string }
export interface EnquiryStatus { id: number; name: string; is_active: boolean }

export interface EnquiryPayload {
  name: string;
  phone: string;
  email?: string;
  subject_of_interest?: string;
  class_of_interest?: string;
  status?: number;
  enquirer_type: "student" | "parent";
  message: string;
  mentor: number;
}

export interface EnquiryRecord {
  id: number | string;
  name: string;
  phone: string;
  enquirer_type: string;
  message: string;
  email?: string;
  subject_of_interest?: string;
  class_of_interest?: string;
  status?: EnquiryStatus | null;
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

export interface EnquiryHistoryRecord {
  id: number;
  enquiry_id: number;
  action: "remark" | "assigned";
  remarks: string;
  next_date: string | null;
  assigned_from?: EnquiryUserRef | null;
  assigned_to?: EnquiryUserRef | null;
  reason?: string | null;
  created_by?: EnquiryUserRef | null;
  created_t?: string;
}
export interface EnquiryHistoryPayload { remarks: string; next_date?: string | null }

function id(value: EnquiryId): number {
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number < 1) throw new Error("Invalid record ID.");
  return number;
}

function list<T>(body: unknown, page: number, perPage: number) {
  const envelope = body as { data?: unknown; info?: { page?: number; per_page?: number; more_records?: boolean } } | null;
  const records = Array.isArray(body) ? body : envelope?.data;
  if (!Array.isArray(records)) throw new Error("The API returned an unexpected list response.");
  return {
    records: records as T[], page: envelope?.info?.page ?? page,
    perPage: envelope?.info?.per_page ?? perPage, moreRecords: envelope?.info?.more_records === true,
  };
}

function extractErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) return getApiErrorMessage(error.response?.data) || fallback;
  return fallback;
}

class EnquiryService {
  private async request<T>(operation: () => Promise<{ data: T }>, fallback: string): Promise<T> {
    try { return (await operation()).data; }
    catch (error) {
      if (axios.isCancel(error)) throw error;
      throw new Error(extractErrorMessage(error, fallback));
    }
  }

  async getAll(
    page = 1,
    perPage = 10,
    sort = "-created_t",
    filter?: string,
    signal?: AbortSignal,
  ): Promise<EnquiryPage> {
    try {
      const response = await api.get<unknown>(API.ENQUIRY, {
        params: { page, per_page: perPage, sort, ...(filter ? { filter } : {}) },
        signal,
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
      if (axios.isCancel(error)) throw error;
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

  async assign(enquiryId: number | string, staffId: number | string, reason?: string): Promise<void> {
    try {
      await api.patch(`${API.ENQUIRY}/${enquiryId}`, {
        assigned_to: id(staffId),
        ...(reason?.trim() ? { assign_reason: reason.trim() } : {}),
      });
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Unable to assign this enquiry."));
    }
  }

  async getById(enquiryId: EnquiryId, signal?: AbortSignal): Promise<EnquiryRecord> {
    const body = await this.request(() => api.get<{ data: EnquiryRecord }>(`${API.ENQUIRY}/${id(enquiryId)}`, { signal }), "Unable to load this enquiry.");
    if (!body.data || Array.isArray(body.data) || !body.data.id) throw new Error("The API returned an unexpected enquiry response.");
    return body.data;
  }

  async update(enquiryId: EnquiryId, payload: Partial<EnquiryPayload>): Promise<void> {
    await this.request(() => api.patch(`${API.ENQUIRY}/${id(enquiryId)}`, payload), "Unable to update this enquiry.");
  }

  async getStatuses(page = 1, perPage = 10, activeOnly = false, signal?: AbortSignal) {
    const body = await this.request(() => api.get(API.ENQUIRY_STATUS, {
      params: { page, per_page: perPage, sort: "id", ...(activeOnly ? { filter: "is_active:eq:true" } : {}) }, signal,
    }), "Unable to load enquiry statuses.");
    return list<EnquiryStatus>(body, page, perPage);
  }

  async getActiveStatuses(signal?: AbortSignal): Promise<EnquiryStatus[]> {
    const statuses: EnquiryStatus[] = [];
    for (let page = 1; ; page += 1) {
      const result = await this.getStatuses(page, 200, true, signal);
      statuses.push(...result.records);
      if (!result.moreRecords || result.records.length === 0) return statuses;
    }
  }

  async createStatus(name: string, isActive?: boolean): Promise<void> {
    const value = this.statusName(name);
    await this.request(() => api.post(API.ENQUIRY_STATUS, {
      name: value, ...(isActive === undefined ? {} : { is_active: isActive }),
    }), "Unable to create the status.");
  }

  async updateStatus(statusId: EnquiryId, payload: { name?: string; is_active?: boolean }): Promise<void> {
    const body = { ...payload, ...(payload.name === undefined ? {} : { name: this.statusName(payload.name) }) };
    await this.request(() => api.patch(`${API.ENQUIRY_STATUS}/${id(statusId)}`, body), "Unable to update the status.");
  }

  async deactivateStatus(statusId: EnquiryId): Promise<void> {
    await this.request(() => api.delete(`${API.ENQUIRY_STATUS}/${id(statusId)}`), "Unable to deactivate the status.");
  }

  private statusName(name: string): string {
    const value = name.trim();
    if (!value || value.length > 20) throw new Error("Status names must contain 1–20 characters.");
    return value;
  }

  async getHistory(enquiryId: EnquiryId, page = 1, signal?: AbortSignal) {
    const body = await this.request(() => api.get(API.ENQUIRY_HISTORY, {
      params: { filter: `enquiry_id:eq:${id(enquiryId)}`, sort: "created_t,id", page, per_page: 200 }, signal,
    }), "Unable to load enquiry history.");
    return list<EnquiryHistoryRecord>(body, page, 200);
  }

  async addHistory(enquiryId: EnquiryId, payload: EnquiryHistoryPayload): Promise<void> {
    const remarks = payload.remarks.trim();
    if (!remarks) throw new Error("Remarks are required.");
    await this.request(() => api.post(API.ENQUIRY_HISTORY, { ...payload, enquiry_id: id(enquiryId), remarks }), "Unable to add the remark.");
  }

  async updateHistory(entry: EnquiryHistoryRecord, payload: EnquiryHistoryPayload): Promise<void> {
    if (entry.action !== "remark") throw new Error("Assignment history is read-only.");
    const remarks = payload.remarks.trim();
    if (!remarks) throw new Error("Remarks are required.");
    await this.request(() => api.patch(`${API.ENQUIRY_HISTORY}/${id(entry.id)}`, {
      ...payload, enquiry_id: id(entry.enquiry_id), remarks,
    }), "Unable to update the remark.");
  }

  async deleteHistory(entry: EnquiryHistoryRecord): Promise<void> {
    if (entry.action !== "remark") throw new Error("Assignment history is read-only.");
    await this.request(() => api.delete(`${API.ENQUIRY_HISTORY}/${id(entry.id)}`), "Unable to delete the remark.");
  }
}

const enquiryService = new EnquiryService();

export default enquiryService;
