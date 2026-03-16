import api from "@/lib/axios";

export interface PollOption {
  _id?: string;
  id?: string;
  text: string;
  votes?: number;
}

export interface PollData {
  _id?: string;
  id?: string;
  language: string;
  question: string;
  options: PollOption[];
  votePermission: 'all' | 'registered';
  status: 'Active' | 'Inactive'; // Typically consistent with string representation
  createdAt?: string;
}

// Ensure proper backend payload type mapping based on possible endpoint requirements
export const pollService = {
  getPolls: async (): Promise<PollData[]> => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response = await api.get<any>('/polls');
      console.log("Raw Polls Response:", response);
      
      // Handle wrappers like { success: true, polls: [...], data: [...] }
      if (Array.isArray(response)) return response;
      if (response && typeof response === 'object') {
          // Check for data or polls key first
          if (Array.isArray(response.data)) return response.data;
          if (Array.isArray(response.polls)) return response.polls;
          if (Array.isArray(response.items)) return response.items;
          
          // Fallback: find the first array property
          const firstArray = Object.values(response).find(val => Array.isArray(val));
          if (firstArray) return firstArray as PollData[];
      }
      
      return [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch(error: any) {
        console.warn("API failed. Falling back to empty array.", error);
        return [];
    }
  },

  getPollById: async (id: string): Promise<PollData | undefined> => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response = await api.get<any>(`/polls/${id}`);
        // Handle wrappers like { success: true, data: { ... }, poll: { ... } }
        const data = response?.data || response?.poll || response;
        
        if (data && typeof data === 'object' && (data._id || data.id || data.question)) {
            return data as PollData;
        }
        return undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        if (error.response && error.response.status === 404) {
            return undefined;
        }
        throw error;
    }
  },

  createPoll: async (poll: Partial<PollData>): Promise<PollData> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await api.post<any>('/polls', poll);
    console.log("Create Poll Response:", response);
    return response?.data || response?.poll || response;
  },

  updatePoll: async (id: string, updates: Partial<PollData>): Promise<PollData | null> => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response = await api.patch<any>(`/polls/${id}`, updates);
        console.log("Update Poll Response:", response);
        const data = response?.data || response?.poll || response;
        
        if (data && typeof data === 'object' && (data._id || data.id || data.question)) {
            return data as PollData;
        }
        return data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
         if (error.response && error.response.status === 404) {
            return null;
        }
        throw error;
    }
  },

  deletePoll: async (id: string): Promise<boolean> => {
    await api.delete(`/polls/${id}`);
    return true;
  },

  togglePollStatus: async (id: string): Promise<PollData> => {
    return api.patch<PollData>(`/polls/toggle-inactive/${id}`);
  }
};
