import api from "@/lib/axios";

export interface AiWriterSettings {
  _id?: string;
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  promptTemplate: string;
}

const defaultSettings: AiWriterSettings = {
  apiKey: "",
  model: "gemini-2.5-flash",
  temperature: 0.4,
  maxTokens: 1000,
  promptTemplate: "You are a professional english news writer and write a comprehensive article in english. Include a catchy headline, and the full article content in 300 words. Ensure the tone is neutral and journalistic. Write the news article based on the following headline:",
};

// Key to track local state for alert UI updates
const MOCK_STORAGE_KEY = "epoverse_ai_writer_settings";

export const aiWriterService = {
  getSettings: async (): Promise<AiWriterSettings> => {
    try {
      const response = await api.get<unknown>('/settings/ai-writer');
      
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
      if (data && typeof data === 'object' && (data.apiKey !== undefined || data._id)) {
        return data as AiWriterSettings;
      }

      throw new Error("Invalid response format from AI writer settings API");
    } catch (error) {
      console.error("Failed to fetch AI writer settings from backend", error);
      // Fallback for UI resilience
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem(MOCK_STORAGE_KEY);
        if (stored) return JSON.parse(stored);
      }
      return defaultSettings;
    }
  },

  updateSettings: async (settings: AiWriterSettings): Promise<AiWriterSettings> => {
    try {
      let response;
      if (settings._id) {
        // Update existing settings
        response = await api.patch<AiWriterSettings>(`/settings/ai-writer/${settings._id}`, settings);
      } else {
        // Create new settings (Initial save)
        response = await api.post<AiWriterSettings>('/settings/ai-writer', settings);
      }
      
      // Also update local copy for immediate UI sync
      if (typeof window !== "undefined") {
        localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(response));
      }
      
      return response as AiWriterSettings;
    } catch (error) {
       console.error("Failed to update AI writer settings on backend", error);
       throw error;
    }
  },

  generateContent: async (prompt: string, context?: string): Promise<string> => {
    try {
      // Fetch settings like model, temperature, template
      // API Key is handled securely on the Next.js API route using .env.local
      const settings = await aiWriterService.getSettings();

      const payload = {
        prompt: context ? `Context:\n${context}\n\nPrompt:\n${prompt}` : prompt,
        modelName: settings.model || "gemini-2.5-flash",
        temperature: settings.temperature,
        maxTokens: settings.maxTokens,
        promptTemplate: settings.promptTemplate
      };

      const response = await fetch('/api/ai-writer/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Generation failed from API route");
      }

      return data.text;
    } catch (error: unknown) {
      console.error("Failed to generate content with AI Writer", error);
      const errorMessage = error instanceof Error ? error.message : "Generation failed";
      throw new Error(errorMessage);
    }
  }
};

