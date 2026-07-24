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
      // api.get already returns response.data (HTTP body)
      const response: any = await api.get(`/story/${id}`);
      // Backend wraps in { data: { ... } } envelope
      const item = response?.data || response;
      if (!item) return undefined;

      console.log('[getStoryById] Raw response keys:', Object.keys(response));
      console.log('[getStoryById] Story item keys:', Object.keys(item));
      console.log('[getStoryById] Has images?', !!item.images, 'count:', (item.images || []).length);

      // Backend returns images in 'images' field (array of image objects)
      const rawImages = item.images || item.items || item.storyItems || [];
      const storyItems: StoryItemData[] = rawImages.map((si: any) => ({
        _id: si._id || si.id,
        itemId: si._id || si.id,
        image: si.storyImage || si.image || '',
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
      // api.post already returns response.data, so 'item' IS the data directly
      const item: any = await api.post('/story', formData);
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
      // api.patch already returns response.data, so 'item' IS the data directly
      const item: any = await api.patch(`/story/${storyId}`, formData);
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

  // Fetch story items by getting the full story and extracting its images
  // Uses GET /story/:storyId (no separate /items endpoint)
  getStoryItems: async (storyId: string | number): Promise<StoryItem[]> => {
    try {
      // api.get already returns response.data (HTTP body)
      const response: any = await api.get(`/story/${storyId}`);
      // Backend wraps in { data: { ... } } envelope
      const item = response?.data || response;



      // Backend returns images in the 'images' field
      const rawImages = item.images || item.items || item.storyItems || [];

      return rawImages.map((img: any) => ({
        _id: img._id || img.id,
        title: item.title || 'Untitled Item',
        language: img.language?.name || img.language || '',
        buttonText: img.buttonText || '',
        buttonLink: img.buttonLink || '',
        image: img.storyImage || img.image || '',
        storyImage: img.storyImage || img.image || '',
        viewCount: Number(img.viewCount || 0),
      }));
    } catch (error) {
      console.error(`Failed to fetch items for story ${storyId}`, error);
      throw error;
    }
  },

  // Try to increment view count by sending a PATCH request with just the view count
  // Since the user requested to make this work, and we can only hit the external backend,
  // we will try appending 'views' or hitting a generic endpoint if possible.
  incrementView: async (storyId: string | number, currentViews: number): Promise<boolean> => {
    try {
      const formData = new FormData();
      formData.append("views", String(currentViews + 1));
      await api.patch(`/story/${storyId}`, formData);
      return true;
    } catch (error) {
      console.error("Failed to increment view", error);
      return false; // Silently fail if endpoint doesn't support updating views this way
    }
  }
};
