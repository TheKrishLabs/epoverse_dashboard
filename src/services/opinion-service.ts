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
        const response = await api.get<OpinionResponse>('/opinions', { params });
        // Handle cases where the backend might strictly return an array instead of the expected object wrapper
        if (Array.isArray(response)) {
            return { data: response, total: response.length, page: 1, limit: response.length };
        }
        return response as unknown as OpinionResponse; // Axios unwrap is handled by interceptor ideally, but ensure types match
    } catch (error) {
        throw error;
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
        return await api.get<OpinionData>(`/opinions/${id}`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        if (error.response && error.response.status === 404) {
            return undefined;
        }
        throw error;
    }
  },

  createOpinion: async (opinion: Partial<OpinionData>): Promise<OpinionData> => {
    return api.post<OpinionData>('/opinions', opinion);
  },

  updateOpinion: async (id: string, updates: Partial<OpinionData>): Promise<OpinionData | null> => {
    try {
        return await api.put<OpinionData>(`/opinions/${id}`, updates);
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
