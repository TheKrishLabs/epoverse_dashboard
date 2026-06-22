import api from "@/lib/axios";

export interface PageData {
    id?: string;
    _id?: string;
    language: string;
    languageName?: string;
    title: string;
    slug: string;
    details: string;
    photo: string | null;
    videoUrl: string;
    metaKeywords: string;
    metaDescription: string;
    status?: string;
    createdAt?: string;
}

export const pageService = {
  getPages: async (): Promise<PageData[]> => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response = await api.get<any>('/pages');
        const data = response.data || response;
        
        if (Array.isArray(data)) return data;
        if (data && Array.isArray(data.data)) return data.data;
        if (data && Array.isArray(data.pages)) return data.pages;
        
        return [];
    } catch (error) {
        console.error("Error fetching pages:", error);
        throw error;
    }
  },

  getPageById: async (id: string): Promise<PageData | undefined> => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response: any = await api.get(`/pages/${id}`);
        const data = response.data || response;
        return data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        if (error.response && error.response.status === 404) return undefined;
        console.error("Error finding page by ID:", error);
        throw error;
    }
  },

  createPage: async (page: Partial<PageData>): Promise<PageData> => {
    return api.post<PageData>('/pages', page);
  },

  updatePage: async (id: string, updates: Partial<PageData>): Promise<PageData | null> => {
    try {
        return await api.patch<PageData>(`/pages/${id}`, updates);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
         if (error.response && error.response.status === 404) {
            return null;
        }
        throw error;
    }
  },

  deletePage: async (id: string): Promise<boolean> => {
    await api.delete(`/pages/${id}`);
    return true;
  }
};
