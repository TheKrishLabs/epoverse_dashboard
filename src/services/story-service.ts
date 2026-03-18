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

export interface StoryItem {
  _id: string;
  title: string;
  language?: string;
  buttonText?: string;
  buttonLink?: string;
  image?: string;
  storyImage: string;
  viewCount?: number;
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
        ...item,
        id: item._id || item.id || Math.random().toString(),
        title: item.title || item.headline || item.storyName || 'Untitled Story',
        views: Number(item.views || item.hitCount || 0),
        date: item.createdAt || item.date || new Date().toISOString(),
        language: item.language?.name || item.language || 'English',
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
      const item = response.data || response;
      if (!item) return undefined;
      
      return {
        ...item,
        id: item._id || item.id || id,
        title: item.title || item.headline || item.storyName || 'Untitled Story',
        views: Number(item.views || item.hitCount || 0),
        date: item.createdAt || item.date || new Date().toISOString(),
        language: item.language?.name || item.language || 'English',
      };
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
        const item = response.data || response;
        return {
          ...item,
          id: item._id || item.id || Math.random().toString(),
          title: item.title || item.headline || item.storyName || 'Untitled Story',
          views: Number(item.views || item.hitCount || 0),
          date: item.createdAt || item.date || new Date().toISOString(),
          language: item.language?.name || item.language || 'English',
        };
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
      const item = response.data || response;
      return {
        ...item,
        id: item._id || item.id || id,
        title: item.title || item.headline || item.storyName || 'Untitled Story',
        views: Number(item.views || item.hitCount || 0),
        date: item.createdAt || item.date || new Date().toISOString(),
        language: item.language?.name || item.language || 'English',
      };
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
  },

  getStoryItems: async (storyId: string | number): Promise<StoryItem[]> => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response: any = await api.get(`/story/${storyId}/items`);
      
      // Handle various response wrappers
      const items = Array.isArray(response) ? response : (response?.data || response?.items || []);
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return items.map((item: any) => ({
        _id: item._id || item.id,
        title: item.title || 'Untitled Item',
        language: item.language?.name || item.language || '',
        buttonText: item.buttonText || '',
        buttonLink: item.buttonLink || '',
        image: item.image || item.storyImage || '',
        storyImage: item.storyImage || item.image || '',
        viewCount: Number(item.viewCount || 0),
      }));
    } catch (error) {
      console.error(`Failed to fetch items for story ${storyId}`, error);
      throw error;
    }
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateStoryItem: async (itemId: string, updates: any): Promise<StoryItem> => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response: any = await api.patch(`/story/item/${itemId}`, updates);
        const item = response.data || response;
        return {
            _id: item._id || item.id || itemId,
            title: item.title || '',
            language: item.language?.name || item.language || '',
            buttonText: item.buttonText || '',
            buttonLink: item.buttonLink || '',
            image: item.image || item.storyImage || '',
            storyImage: item.storyImage || item.image || '',
            viewCount: Number(item.viewCount || 0),
        };
    } catch (error) {
        console.error(`Failed to update story item ${itemId}`, error);
        throw error;
    }
  }
};
