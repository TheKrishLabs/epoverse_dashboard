import api from "@/lib/axios";

export interface TrendingPost {
    _id: string;
    post: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    language: any; // Can be string or populated object { _id: string, name: string }
    createdAt: string;
    updatedAt: string;
}

export const trendingPostService = {
  getTrendingPosts: async (): Promise<TrendingPost[]> => {
    try {
      const response = await api.get<unknown>('/trending-post');
      console.log("Raw Trending Post Response:", response);
      
      // Handle various backend response wrappers safely
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payload = (response as any)?.data ? (response as any).data : response;

      if (Array.isArray(payload)) return payload as TrendingPost[];
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payloadObj = payload as any;
      if (payloadObj && payloadObj.trendingPosts && Array.isArray(payloadObj.trendingPosts)) {
        return payloadObj.trendingPosts as TrendingPost[];
      }
      if (payloadObj && payloadObj.posts && Array.isArray(payloadObj.posts)) {
        return payloadObj.posts as TrendingPost[];
      }
      
      // Fallback: If it's a deeply nested object, find the first available array
      if (typeof payload === 'object' && payload !== null) {
          const firstArray = Object.values(payload as Record<string, unknown>).find(val => Array.isArray(val));
          if (firstArray) return firstArray as TrendingPost[];
      }

      return [];
    } catch (error) {
      console.error("Failed to fetch trending posts", error);
      return [];
    }
  },

  getTrendingPostById: async (id: string): Promise<TrendingPost | undefined> => {
    try {
      const response = await api.get<unknown>(`/trending-post/${id}`);
      
      // Handle various backend response wrappers safely
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = response as any;
      const data = res?.data || res?.trendingPost || res?.post || res;

      if (data && typeof data === 'object' && (data._id || data.post || data.id)) {
        return data as TrendingPost;
      }
      
      return undefined;
    } catch (error) {
       console.error(`Failed to fetch trending post ${id}`, error);
       return undefined;
    }
  },

  addTrendingPost: async (payload: { language: string; post: string }): Promise<TrendingPost> => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await api.post<any>('/trending-post', payload);
      // Unwrap if backend returns { success: true, data: { ... } }
      return response?.data || response?.trendingPost || response;
    } catch (error) {
      console.error("Failed to add trending post", error);
      throw error;
    }
  },

  updateTrendingPost: async (id: string, payload: { language: string; post: string }): Promise<TrendingPost> => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await api.put<any>(`/trending-post/${id}`, payload);
      // Unwrap if backend returns { success: true, data: { ... } }
      return response?.data || response?.trendingPost || response;
    } catch (error) {
      console.error(`Failed to update trending post ${id}`, error);
      throw error;
    }
  },

  deleteTrendingPost: async (id: string): Promise<void> => {
    try {
      await api.delete(`/trending-post/${id}`);
    } catch (error) {
      console.error(`Failed to delete trending post ${id}`, error);
      throw error;
    }
  }
};
