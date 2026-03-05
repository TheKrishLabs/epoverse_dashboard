import api from "@/lib/axios";

export interface StoryData {
  id: string | number;
  title: string;
  views: number | string;
  date: string;
  language: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any; // To hold any additional backend payload elements safely
}

export const storyService = {
  getStories: async (): Promise<StoryData[]> => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response: any = await api.get('/story');
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let items: any[] = [];
      if (Array.isArray(response)) items = response;
      else if (response && Array.isArray(response.data)) items = response.data;
      else if (response && Array.isArray(response.stories)) items = response.stories;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return items.map((item: any) => ({
        id: item._id || item.id || Math.random().toString(),
        title: item.title || item.headline || item.storyName || 'Untitled Story',
        views: Number(item.views || item.hitCount || 0),
        date: item.createdAt || item.date || new Date().toISOString(),
        language: item.language?.name || item.language || 'English',
        ...item
      }));
    } catch (error) {
      console.error("Failed to fetch stories", error);
      throw error;
    }
  },

  getStoryById: async (id: number | string): Promise<StoryData | undefined> => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response: any = await api.get(`/story/${id}`);
      return response.data || response;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        if (error.response && error.response.status === 404) return undefined;
        throw error;
    }
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createStory: async (story: any): Promise<StoryData> => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response: any = await api.post('/story', story);
        return response.data || response;
    } catch (error) {
        console.error("Failed to create story", error);
        throw error;
    }
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateStory: async (id: number | string, updates: any): Promise<StoryData | null> => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response: any = await api.put(`/story/${id}`, updates);
      return response.data || response;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        if (error.response && error.response.status === 404) return null;
        throw error;
    }
  },

  deleteStory: async (id: number | string): Promise<boolean> => {
    try {
        await api.delete(`/story/${id}`);
        return true;
    } catch (error) {
        console.error("Failed to delete story", error);
        throw error;
    }
  }
};
