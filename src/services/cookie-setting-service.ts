import api from "@/lib/axios";

export interface CookieSettings {
  _id?: string;
  cookieAlertTitle: string;
  cookieAlertContent: string;
  pageTitle?: string;
  pageUrl?: string;
  cookieDurationDays: number;
  showCookieAlert: boolean;
}

const defaultSettings: CookieSettings = {
  cookieAlertTitle: "We value your privacy!",
  cookieAlertContent: "We use cookies to improve your experience, deliver personalized content and ads, and analyze our traffic. By continuing to browse our site, you agree to our use of cookies.",
  pageTitle: "Cookie Policy",
  pageUrl: "https://yourdomain.com/privacy-policy",
  cookieDurationDays: 30,
  showCookieAlert: true,
};

// Key to track local state for alert UI updates
const MOCK_STORAGE_KEY = "epoverse_cookie_settings";

export const cookieSettingService = {
  getSettings: async (): Promise<CookieSettings> => {
    try {
      const response = await api.get<unknown>('/settings/cookie');
      
      // Handle various backend response wrappers
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = response as any;
      let data = res;
      if (res && res.data && !Array.isArray(res.data)) {
        data = res.data;
      } else if (res && res.settings) {
        data = res.settings;
      } else if (Array.isArray(res) && res.length > 0) {
        data = res[0];
      } else if (res && Array.isArray(res.data) && res.data.length > 0) {
        data = res.data[0];
      }

      // Check if we got something valid, otherwise fallback
      if (data && typeof data === 'object' && (data.cookieAlertTitle || data._id)) {
        return data as CookieSettings;
      }

      throw new Error("Invalid response format from cookie settings API");
    } catch (error) {
      console.error("Failed to fetch cookie settings from backend", error);
      // Fallback for UI resilience
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem(MOCK_STORAGE_KEY);
        if (stored) return JSON.parse(stored);
      }
      return defaultSettings;
    }
  },

  updateSettings: async (settings: CookieSettings): Promise<CookieSettings> => {
    try {
      let response;
      if (settings._id) {
        // Update existing settings
        response = await api.patch<CookieSettings>(`/settings/cookie/${settings._id}`, settings);
      } else {
        // Create new settings (Initial save)
        response = await api.post<CookieSettings>('/settings/cookie', settings);
      }
      
      // Also update local copy for immediate UI sync
      if (typeof window !== "undefined") {
        localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(response));
      }
      
      return response;
    } catch (error) {
       console.error("Failed to update cookie settings on backend", error);
       throw error;
    }
  }
};
