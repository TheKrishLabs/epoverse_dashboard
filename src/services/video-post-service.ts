import api from "@/lib/axios";

export interface VideoPostData {
    id?: string;
    _id?: string;
    language: string;
    reporter: string;
    releaseDate: string | Date;
    headLine: string;
    details: string;
    image: string | null;
    video: string | null;
    videoUrl: string;
    imageAlt: string;
    imageTitle: string;
    customUrl: string;
    reference: string;
    metaKeyword: string;
    metaDescription: string;
    status?: string;
}

export const videoPostService = {
  getVideoPosts: async (): Promise<VideoPostData[]> => {
    return api.get<VideoPostData[]>('/video-posts');
  },

  getVideoPostById: async (id: string): Promise<VideoPostData | undefined> => {
    try {
        return await api.get<VideoPostData>(`/video-posts/${id}`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        if (error.response && error.response.status === 404) {
            return undefined;
        }
        throw error;
    }
  },

  createVideoPost: async (post: Partial<VideoPostData>): Promise<VideoPostData> => {
    return api.post<VideoPostData>('/video-posts', post);
  },

  updateVideoPost: async (id: string, updates: Partial<VideoPostData>): Promise<VideoPostData | null> => {
    try {
        return await api.put<VideoPostData>(`/video-posts/${id}`, updates);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
         if (error.response && error.response.status === 404) {
            return null;
        }
        throw error;
    }
  },

  deleteVideoPost: async (id: string): Promise<boolean> => {
    await api.delete(`/video-posts/${id}`);
    return true;
  }
};
