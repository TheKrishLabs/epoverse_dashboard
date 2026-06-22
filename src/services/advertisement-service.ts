import api from "@/lib/axios";

export interface Advertisement {
  _id: string;
  theme: string;
  page: 'home' | 'category' | 'details' | string;
  position: number;
  adType: 'script' | 'image';
  language: string;
  embedCode?: string;
  adRedirectUrl?: string;
  status: 'Active' | 'Inactive';
  imageUrl?: string;
  image?: File;
  createdAt?: string;
}

export const advertisementService = {
  getAds: async (): Promise<Advertisement[]> => {
    try {
      interface AdvertResponse {
        data?: unknown;
        ads?: Advertisement[];
        advertisements?: Advertisement[];
      }
      
      // api.get in src/lib/axios.ts already unwraps response.data
      const payload = await api.get<AdvertResponse>('/advertisement');
      
      // Handle various response structures
      if (Array.isArray(payload)) return payload as Advertisement[];
      
      if (payload && typeof payload === 'object') {
        if (Array.isArray(payload.ads)) return payload.ads;
        if (Array.isArray(payload.data)) return payload.data as Advertisement[];
        if (Array.isArray(payload.advertisements)) return payload.advertisements;
        
        const data = payload.data;
        if (data && typeof data === 'object') {
          if ('ads' in (data as Record<string, unknown>)) {
            const ads = (data as AdvertResponse).ads;
            if (Array.isArray(ads)) return ads as Advertisement[];
          }
          if ('advertisements' in (data as Record<string, unknown>)) {
            const ads = (data as AdvertResponse).advertisements;
            if (Array.isArray(ads)) return ads as Advertisement[];
          }
        }
      }
      
      return [];
    } catch (error) {
      console.error("Failed to fetch advertisements", error);
      return [];
    }
  },

  createAd: async (ad: Partial<Advertisement>): Promise<Advertisement> => {
    // If it's an image ad with a file, we MUST use FormData
    if (ad.adType === 'image' && ad.image instanceof File) {
      const formData = new FormData();
      Object.entries(ad).forEach(([key, value]) => {
        if (value !== undefined) {
          if (key === 'image') {
            formData.append('image', value as File);
          } else {
            formData.append(key, String(value));
          }
        }
      });
      return api.post<Advertisement>('/advertisement', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    
    // Default JSON post for script ads or other cases
    return api.post<Advertisement>('/advertisement', ad);
  },

  updateAd: async (id: string, updates: Partial<Advertisement>): Promise<Advertisement> => {
    if (updates.adType === 'image' && updates.image instanceof File) {
      const formData = new FormData();
      Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined) {
          if (key === 'image') {
            formData.append('image', value as File);
          } else {
            formData.append(key, String(value));
          }
        }
      });
      return api.patch<Advertisement>(`/advertisement/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    return api.patch<Advertisement>(`/advertisement/${id}`, updates);
  },

  deleteAd: async (id: string): Promise<boolean> => {
    await api.delete(`/advertisement/${id}`);
    return true;
  }
};
