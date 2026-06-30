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

export interface DashboardSummary {
  totalUsers: number;
  totalEmployees: number;
  totalArticles: number;
  totalComments: number;
  totalPendingArticles: number;
  totalApprovedArticles: number;
  totalLanguage: number;
  totalCategory: number;
}

export interface DashboardResponse {
  success: boolean;
  message: string;
  dashboard: {
    summary: DashboardSummary;
    totalMenu?: number;
    totalRole?: number;
    data?: {
      visitorStats?: VisitorStat[];
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
  summary?: DashboardSummary;
}

export const dashboardService = {
  getAdminDashboard: async (): Promise<DashboardResponse | undefined> => {
    try {
        // Using a type that allows checking for a 'data' wrapper property 
        // while avoiding the 'any' lint error.
        const payload = await api.get<DashboardResponse & { data?: DashboardResponse }>('/dashboard/admin');
        
        // Defensive check: If the response is wrapped in { data: ... }
        if (payload?.data && (payload?.data?.dashboard || payload?.data?.summary)) {
            return payload.data as DashboardResponse;
        }

        return payload as DashboardResponse;
    } catch (error) {
        console.error("Failed to fetch admin dashboard payload:", error);
        throw error;
    }
  }
};
