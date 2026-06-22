import api from "@/lib/axios";

export interface Language {
    _id: string;
    name: string;
    description?: string;
    isDeleted?: boolean;
    createdAt?: string;
    updatedAt?: string;
    __v?: number;
}

export const languageService = {
  getLanguages: async (): Promise<Language[]> => {
      try {
        const response = await api.get<unknown>('/languages');
        console.log("Raw Language Response Axios Object:", response);
        
        // Cast to Record to safely access optional properties
        const responseObj = response as Record<string, unknown>;
        
        // Extract the JSON body from the Axios response
        const payload = responseObj?.data ? responseObj.data : response;
        console.log("Language JSON Payload:", payload);

        // Handle various backend response wrappers
        if (Array.isArray(payload)) return payload as Language[];
        
        const payloadObj = payload as Record<string, unknown>;
        if (payloadObj?.data && Array.isArray(payloadObj.data)) return payloadObj.data as Language[];
        if (payloadObj?.languages && Array.isArray(payloadObj.languages)) return payloadObj.languages as Language[];
        
        // Fallback: If it's a deeply nested object, find the first array
        if (typeof payload === 'object' && payload !== null) {
            const firstArray = Object.values(payload as Record<string, unknown>).find(val => Array.isArray(val));
            if (firstArray) return firstArray as Language[];
        }

        return [];
      } catch (error) {
        console.error("Failed to fetch languages", error);
        throw error;
      }
  },

  createLanguage: async (payload: { name: string; description?: string }): Promise<Language> => {
      try {
          const response = await api.post<Language>('/languages', payload);
          return response;
      } catch (error) {
          console.error("Failed to create language", error);
          throw error;
      }
  },
  
  // Future proofing just in case
  deleteLanguage: async (id: string): Promise<void> => {
      try {
          await api.delete(`/languages/${id}`);
      } catch (error) {
          console.error(`Failed to delete language ${id}`, error);
          throw error;
      }
  }
};
