import api from "@/lib/axios";

export interface OpinionData {
    id?: string;
    // Mongo often uses _id
    _id?: string;
    // language can be the string ID or a populated object from the API
    language: string | { _id: string; name: string };
    name: string;
    designation?: string;
    headline: string;
    slug: string;
    details?: string;
    // Some implementations keep customUrl for backwards compatibility or routing
    customUrl?: string; 
    photo1?: string | null;
    photo2?: string | null;
    imageAlt?: string;
    imageTitle?: string;
    metaKeywords?: string[];
    metaDescription?: string;
    isLatest?: boolean;
    status?: string | number | boolean;
    createdAt?: string;
}

export interface OpinionResponse {
    data: OpinionData[];
    total: number;
    page: number;
    limit: number;
}

export interface OpinionQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: string | boolean | number;
    language?: string;
}

export const opinionService = {
  getAllOpinions: async (params?: OpinionQueryParams): Promise<OpinionResponse> => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response = await api.get<any>('/opinions', { params });
        console.log("Raw Opinion Response:", response);
        
        // Handle various backend response wrappers safely
        const payload = response?.data ? response.data : response;

        // If it's already the expected object structure, return it
        if (payload && Array.isArray(payload.data)) {
            return payload as OpinionResponse;
        }

        // If it's just an array, wrap it
        if (Array.isArray(payload)) {
            return { data: payload, total: payload.length, page: 1, limit: payload.length };
        }
        
        // Fallback: If it's an object with various possible keys, find the first array
        if (typeof payload === 'object' && payload !== null) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const payloadObj = payload as any;
            if (payloadObj.opinions && Array.isArray(payloadObj.opinions)) {
                return { data: payloadObj.opinions, total: payloadObj.opinions.length, page: 1, limit: payloadObj.total || payloadObj.opinions.length };
            }
            if (payloadObj.posts && Array.isArray(payloadObj.posts)) {
                return { data: payloadObj.posts, total: payloadObj.posts.length, page: 1, limit: payloadObj.total || payloadObj.posts.length };
            }

            const firstArray = Object.values(payload as Record<string, unknown>).find(val => Array.isArray(val));
            if (firstArray) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const arr = firstArray as any[];
                return { data: arr, total: arr.length, page: 1, limit: arr.length };
            }
        }

        return { data: [], total: 0, page: 1, limit: 10 };
    } catch (error) {
        console.error("Failed to fetch opinions:", error);
        return { data: [], total: 0, page: 1, limit: 10 };
    }
  },

  getOpinionBySlug: async (slug: string): Promise<OpinionData | undefined> => {
    try {
        return await api.get<OpinionData>(`/opinions/slug/${slug}`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        if (error.response && error.response.status === 404) {
            return undefined;
        }
        throw error;
    }
  },

  getOpinionById: async (id: string): Promise<OpinionData | undefined> => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response = await api.get<any>(`/opinions/${id}`);
        // Handle wrappers like { success: true, data: { ... }, opinion: { ... } }
        const data = response?.data || response?.opinion || response;
        
        if (data && typeof data === 'object' && (data._id || data.id || data.headline)) {
            return data as OpinionData;
        }
        return undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        if (error.response && error.response.status === 404) {
            return undefined;
        }
        throw error;
    }
  },

  createOpinion: async (opinion: Partial<OpinionData>): Promise<OpinionData> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await api.post<any>('/opinions', opinion);
    console.log("Create Opinion Response:", response);
    return response?.data || response?.opinion || response;
  },

  updateOpinion: async (id: string, updates: Partial<OpinionData>): Promise<OpinionData | null> => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response = await api.put<any>(`/opinions/${id}`, updates);
        console.log("Update Opinion Response:", response);
        const data = response?.data || response?.opinion || response;
        
        if (data && typeof data === 'object' && (data._id || data.id || data.headline)) {
            return data as OpinionData;
        }
        return data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
         if (error.response && error.response.status === 404) {
            return null;
        }
        throw error;
    }
  },

  deleteOpinion: async (id: string): Promise<boolean> => {
    await api.delete(`/opinions/${id}`);
    return true;
  }
};
