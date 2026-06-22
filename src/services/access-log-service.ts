import api from "@/lib/axios";

export interface AccessLog {
  _id: string;
  employeeId?: {
    _id: string;
    fullName: string;
  };
  roleId?: {
    _id: string;
    name: string;
  };
  logName: string;
  description: string;
  dateTime: string;
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
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await api.get<any>('/access-log', {
        params: { range }
      });
      
      // The API returns the array directly wrapped in the axios response
      if (Array.isArray(response)) return response;
      if (response && Array.isArray(response.data)) return response.data;
      if (response && response.data && Array.isArray(response.data.data)) return response.data.data;
      if (response && Array.isArray(response.logs)) return response.logs;
      if (response && response.data && Array.isArray(response.data.logs)) return response.data.logs;
      
      return [];
    } catch (error) {
      console.error("Error fetching access logs:", error);
      return [];
    }
  }
};
