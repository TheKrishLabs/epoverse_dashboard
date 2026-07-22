/* eslint-disable */
import api from "@/lib/axios";

export interface ReportData {
  id?: string;
  _id?: string;
  reason?: string;
  description?: string;
  article?: any; // To hold populated article data if available
  reportedBy?: any; // To hold user data who reported
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const reportService = {
  fetchReports: async (): Promise<ReportData[]> => {
    try {
      const response = await api.get<any>('/reports');
      console.log("Fetch Reports Response:", response);
      
      let items: ReportData[] = [];
      if (Array.isArray(response)) items = response;
      else if (response && typeof response === 'object') {
          if (Array.isArray(response.data)) items = response.data;
          else if (Array.isArray(response.reports)) items = response.reports;
          else {
              const firstArray = Object.values(response).find(val => Array.isArray(val));
              if (firstArray) items = firstArray as ReportData[];
          }
      }
      return items;
    } catch (error) {
      console.error("Failed to fetch reports:", error);
      return [];
    }
  },

  getReportById: async (id: string): Promise<ReportData | undefined> => {
    try {
      const response = await api.get<any>(`/reports/${id}`);
      const data = response?.data || response?.report || response;
      if (data && typeof data === 'object' && (data._id || data.id)) {
          return data as ReportData;
      }
      return undefined;
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
          return undefined;
      }
      throw error;
    }
  },

  unreportArticle: async (id: string): Promise<any> => {
    const response = await api.patch<any>(`/reports/${id}/unreport`);
    return response?.data || response;
  },

  deleteReport: async (id: string): Promise<boolean> => {
    await api.delete(`/reports/${id}`);
    return true;
  },

  createReport: async (articleId: string, reason: string, description: string): Promise<any> => {
    const response = await api.post<any>(`/reports/article/${articleId}`, {
        reason,
        description
    });
    return response?.data || response;
  }
};

