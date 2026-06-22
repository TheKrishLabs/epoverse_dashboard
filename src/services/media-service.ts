import api from "@/lib/axios";

export interface Photo {
  _id: string;
  thumbnailUrl?: string; // or however the backend returns it
  url: string; // large image url
  caption: string;
  reference: string;
  dimensions: {
    thumb: { width: number; height: number };
    large: { width: number; height: number };
  };
  createdAt: string;
  status?: "Active" | "Deleted" | string;
}

export interface UploadPhotoResponse {
  success: boolean;
  data: Photo;
  message?: string;
}

export interface GetPhotosResponse {
    photos: Photo[];
    totalPages: number;
    currentPage: number;
    totalPhotos: number;
}

export const mediaService = {
  uploadPhoto: async (formData: FormData): Promise<UploadPhotoResponse> => {
    try {
      const response = await api.post<UploadPhotoResponse>('/media', formData);
      return response;
    } catch (error) {
      console.error("Media upload failed", error);
      throw error;
    }
  },

  getPhotos: async (page = 1, limit = 20): Promise<GetPhotosResponse> => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await api.get<any>(`/media?page=${page}&limit=${limit}`);
      
      // Handle various response wrappers
      const photos = Array.isArray(response) ? response : (response?.data || response?.photos || []);
      const totalPages = response?.totalPages || 1;
      const currentPage = response?.currentPage || page;
      const totalPhotos = response?.totalPhotos || photos.length;
      
      return { photos, totalPages, currentPage, totalPhotos };
    } catch (error) {
      console.error("Failed to fetch photos", error);
      throw error;
    }
  },

  getPhotoById: async (id: string): Promise<Photo> => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await api.get<any>(`/media/${id}`);
      // Safely unpack if backend nested the data
      const data = response?.data ? response.data : response;
      return data;
    } catch (error) {
      console.error(`Failed to fetch photo with ID ${id}`, error);
      throw error;
    }
  },

  deletePhoto: async (id: string): Promise<void> => {
    try {
      await api.delete(`/media/${id}`);
    } catch (error) {
      console.error("Failed to delete photo", error);
      throw error;
    }
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toggleSoftDeletePhoto: async (id: string): Promise<any> => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await api.patch<any>(`/media/${id}/toggle-soft-delete`);
      return response;
    } catch (error) {
      console.error(`Failed to toggle soft delete for photo with ID ${id}`, error);
      throw error;
    }
  }
};
