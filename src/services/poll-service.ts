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
  status: 'Active' | 'Inactive'; 
  isActive?: boolean;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Ensure proper backend payload type mapping based on possible endpoint requirements
export const pollService = {
  getPolls: async (): Promise<PollData[]> => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response = await api.get<any>('/polls');
      console.log("Raw Polls Response:", response);
      
      let items: PollData[] = [];
      if (Array.isArray(response)) items = response;
      else if (response && typeof response === 'object') {
          if (Array.isArray(response.data)) items = response.data;
          else if (Array.isArray(response.polls)) items = response.polls;
          else if (Array.isArray(response.items)) items = response.items;
          else {
              const firstArray = Object.values(response).find(val => Array.isArray(val));
              if (firstArray) items = firstArray as PollData[];
          }
      }
      
      // Filter out deleted polls
      return items.filter(p => !p.isDeleted);
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await api.patch<any>(`/polls/toggle-inactive/${id}`);
    return response?.data?.poll || response?.poll || response;
  }
};
