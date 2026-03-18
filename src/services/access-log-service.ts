import api from "@/lib/axios";

export interface AccessLog {
  id: string;
  user: string;
  email: string;
  loginTime: string;
  logoutTime: string | null;
  ipAddress: string;
  status: "Success" | "Failed";
}

export interface AccessLogResponse {
  success: boolean;
  message: string;
  data: AccessLog[];
}

export const accessLogService = {
  /**
   * Fetch access logs within a specific range
   */
  getLogs: async (range: string = "today"): Promise<AccessLog[]> => {
    const response = await api.get<AccessLogResponse>('/access-log', {
      params: { range }
    });
    return response.data || [];
  }
};
