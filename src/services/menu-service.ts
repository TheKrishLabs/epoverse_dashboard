import api from "@/lib/axios";

export interface MenuData {
  _id?: string;
  id?: string;
  name: string;
  location?: string;
  status: 'Publish' | 'Draft';
  items?: MenuItem[];
  createdAt?: string;
}

export interface MenuItem {
  _id?: string;
  id: string; // Unique ID for drag and drop
  menu?: string;
  title: string;
  type: 'category' | 'page' | 'link' | 'archive';
  originalId?: string; // e.g. the Category ID
  referenceId?: string; // used for API reference
  url?: string; // For custom links
  order?: number;
  parentId?: string;
}

// Mock data removed to ensure real API data is prioritized and displayed.

const STORAGE_KEY_PREFIX = 'mock_menu_items_';

export const menuService = {
  getMenus: async (): Promise<MenuData[]> => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response = await api.get<any>('/menus');
      console.log("Raw Menus Response:", response);
      
      // Handle wrappers like { success: true, menus: [...], data: [...] }
      if (Array.isArray(response)) return response;
      if (response && typeof response === 'object') {
          if (Array.isArray(response.data)) return response.data;
          if (Array.isArray(response.menus)) return response.menus;
          if (Array.isArray(response.items)) return response.items;
          
          // Fallback: find the first array property
          const firstArray = Object.values(response).find(val => Array.isArray(val));
          if (firstArray) return firstArray as MenuData[];
      }
      return [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch(error: any) {
        console.warn("API '/menus' failed.", error);
        return [];
    }
  },

  getMenuById: async (id: string): Promise<MenuData | undefined> => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response = await api.get<any>(`/menus/${id}`);
        // Handle wrappers like { success: true, data: { ... }, menu: { ... } }
        const data = response?.data || response?.menu || response;
        
        if (data && typeof data === 'object' && (data._id || data.id || data.name)) {
            return data as MenuData;
        }
        return undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        if (error.response?.status === 404) {
             return undefined;
        }
        throw error;
    }
  },

  createMenu: async (menu: Partial<MenuData>): Promise<MenuData> => {
    return api.post<MenuData>('/menus', menu);
  },

  updateMenu: async (id: string, updates: Partial<MenuData>): Promise<MenuData | null> => {
    try {
        return await api.put<MenuData>(`/menus/${id}`, updates);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
         if (error.response?.status === 404) {
            return null;
        }
        throw error;
    }
  },

  deleteMenu: async (id: string): Promise<boolean> => {
    try {
        await api.delete(`/menus/${id}`);
        return true;
    } catch (error) {
        console.warn("Failed to delete menu via API", error);
        return false;
    }
  },

  // Menu Builder Item Endpoints
  getMenuItems: async (menuId: string): Promise<MenuItem[]> => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response = await api.get<any>(`/menu-items/${menuId}`);
        console.log("Raw Menu Items Response:", response);
        
        // Handle wrappers like { success: true, data: [...], items: [...] }
        if (Array.isArray(response)) return response;
        if (response && typeof response === 'object') {
            if (Array.isArray(response.data)) return response.data;
            if (Array.isArray(response.items)) return response.items;
            
            // Fallback: find first array
            const firstArray = Object.values(response).find(val => Array.isArray(val));
            if (firstArray) return firstArray as MenuItem[];
        }
        throw new Error("Invalid array return types.");
    } catch (error) {
        // Fallback to local storage for local development testing
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(STORAGE_KEY_PREFIX + menuId);
            if (stored) {
                try {
                    return JSON.parse(stored);
                } catch {
                     // Corrupted local data, fall through to default array
                }
            }
        }
        
        console.warn(`API '/menus/${menuId}/items' failed. Falling back to default initial mock data.`, error);
        return [
            { id: "item-1", title: "Politics", type: "category" },
            { id: "item-2", title: "Business", type: "category" },
            { id: "item-3", title: "External Links", type: "link", url: "https://example.com" }
        ];
    }
  },

  createMenuItem: async (item: Partial<MenuItem>): Promise<MenuItem> => {
    return api.post<MenuItem>('/menu-items', item);
  },

  updateMenuItem: async (id: string, updates: Partial<MenuItem>): Promise<MenuItem> => {
    return api.patch<MenuItem>(`/menu-items/${id}`, updates);
  },

  saveMenuItems: async (menuId: string, items: MenuItem[]): Promise<boolean> => {
    try {
        await api.put(`/menus/${menuId}/items`, { items });
        // Optionally save locally as well just for instant updates
        if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY_PREFIX + menuId, JSON.stringify(items));
        return true;
    } catch (error) {
        console.warn(`Failed to save menu items for ${menuId} via API. Saving to local mock storage.`, error);
        if (typeof window !== 'undefined') {
             localStorage.setItem(STORAGE_KEY_PREFIX + menuId, JSON.stringify(items));
        }
        return true;
    }
  }
};
