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
      return await api.get<PollData[]>('/polls');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch(error: any) {
        // Mock fallback if you need to build without API ready yet, according to "Implement mock API (replaceable with real API later)" Requirement
        console.warn("API might not exist. Falling back to empty array.", error);
        return [];
    }
  },

  getPollById: async (id: string): Promise<PollData | undefined> => {
    try {
        return await api.get<PollData>(`/polls/${id}`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        if (error.response && error.response.status === 404) {
            return undefined;
        }
        throw error;
    }
  },

  createPoll: async (poll: Partial<PollData>): Promise<PollData> => {
    // If mocking is required, you can wrap this block logic, but usually we just pipe to API
    return api.post<PollData>('/polls', poll);
  },

  updatePoll: async (id: string, updates: Partial<PollData>): Promise<PollData | null> => {
    try {
        return await api.patch<PollData>(`/polls/${id}`, updates);
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
  }
};
