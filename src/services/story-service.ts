/* eslint-disable */
import api from "@/lib/axios";

export interface StoryData {
  id: string | number;
  _id?: string;
  title: string;
  views: number | string;
  date: string;
  items?: StoryItemData[];
  [key: string]: any;
}

export interface StoryItemData {
  _id: string;
  itemId?: string;
  image?: string;
  storyImage?: string;
  sortOrder?: number;
  viewCount?: number;
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
      const response: any = await api.get('/story');
      
      let items: any[] = [];
      if (Array.isArray(response)) items = response;
      else if (response && Array.isArray(response.data)) items = response.data;
      else if (response && Array.isArray(response.stories)) items = response.stories;

      return items.map((item: any) => ({
        ...item,
        id: item._id || item.id || Math.random().toString(),
        title: item.title || item.headline || item.storyName || 'Untitled Story',
        views: Number(item.views || item.hitCount || 0),
        date: item.createdAt || item.date || new Date().toISOString(),
      }));
    } catch (error) {
      console.error("Failed to fetch stories", error);
      throw error;
    }
  },

  getStoryById: async (id: number | string): Promise<StoryData | undefined> => {
    try {
      const response: any = await api.get(`/story/${id}`);
      const item = response.data || response;
      if (!item) return undefined;
      
      // Map items (images) from the backend response
      const storyItems: StoryItemData[] = (item.items || item.storyItems || []).map((si: any) => ({
        _id: si._id || si.id,
        itemId: si._id || si.id,
        image: si.image || si.storyImage || '',
        storyImage: si.storyImage || si.image || '',
        sortOrder: si.sortOrder ?? 0,
        viewCount: Number(si.viewCount || 0),
      }));

      return {
        ...item,
        id: item._id || item.id || id,
        title: item.title || item.headline || item.storyName || 'Untitled Story',
        views: Number(item.views || item.hitCount || 0),
        date: item.createdAt || item.date || new Date().toISOString(),
        items: storyItems,
      };
    } catch (error: any) {
        if (error.response && error.response.status === 404) return undefined;
        throw error;
    }
  },

  // POST /story — FormData with title + images
  createStory: async (formData: FormData): Promise<StoryData> => {
    try {
        const response: any = await api.post('/story', formData);
        const item = response.data || response;
        return {
          ...item,
          id: item._id || item.id || Math.random().toString(),
          title: item.title || 'Untitled Story',
          views: Number(item.views || 0),
          date: item.createdAt || item.date || new Date().toISOString(),
        };
    } catch (error) {
        console.error("Failed to create story", error);
        throw error;
    }
  },

  // PATCH /story/:storyId — FormData with title, existingOrders, deleteImageIds, images
  updateStory: async (storyId: number | string, formData: FormData): Promise<StoryData | null> => {
    try {
      const response: any = await api.patch(`/story/${storyId}`, formData);
      const item = response.data || response;
      return {
        ...item,
        id: item._id || item.id || storyId,
        title: item.title || 'Untitled Story',
        views: Number(item.views || 0),
        date: item.createdAt || item.date || new Date().toISOString(),
      };
    } catch (error: any) {
        if (error.response && error.response.status === 404) return null;
        throw error;
    }
  },

  // DELETE /story/:storyId
  deleteStory: async (id: number | string): Promise<boolean> => {
    try {
        await api.delete(`/story/${id}`);
        return true;
    } catch (error) {
        console.error("Failed to delete story", error);
        throw error;
    }
  },

  // DELETE /story/item/:itemId — delete a particular image in a story
  deleteStoryItem: async (itemId: string): Promise<boolean> => {
    try {
        await api.delete(`/story/item/${itemId}`);
        return true;
    } catch (error) {
        console.error("Failed to delete story item", error);
        throw error;
    }
  },

  getStoryItems: async (storyId: string | number): Promise<StoryItem[]> => {
    try {
      const response: any = await api.get(`/story/${storyId}/items`);
      
      const items = Array.isArray(response) ? response : (response?.data || response?.items || []);
      
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
};
