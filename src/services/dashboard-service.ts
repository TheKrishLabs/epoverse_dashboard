import api from "@/lib/axios";

export interface DashboardArticleCounts {
  allLength: number;
  approvedCount: number;
  pendingCount: number;
  featuredCount: number;
}

export interface VisitorStat {
  date: string;
  desktop?: number;
  mobile?: number;
  visitors?: number; 
}

export interface DashboardResponse {
  totalArticle: DashboardArticleCounts;
  totalCategories: number;
  totalComments: number;
  totalMenu: number;
  totalRole: number;
  totalLanguage: number;
  totalUser: number;
  message?: string;
  data?: { // Some APIs wrap details heavily in .data
       visitorStats?: VisitorStat[];
       // add other properties if the payload dictates it
       [key: string]: unknown;
  };
}

export const dashboardService = {
  getAdminDashboard: async (): Promise<DashboardResponse | undefined> => {
    try {
        const payload = await api.get<DashboardResponse>('/dashboard/admin');
        
        // Safely extract from nested `.data.data` wrapper if it exists (common inside node setups)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const resObj = payload as any;
        if (resObj?.data && resObj?.data?.totalArticle) {
            return resObj.data as DashboardResponse;
        }

        return payload;
    } catch (error) {
        console.error("Failed to fetch admin dashboard payload:", error);
        throw error;
    }
  }
};
