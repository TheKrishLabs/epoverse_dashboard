import api from '@/lib/axios';

export interface User {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  role?: string | { _id: string; name: string };
  status: 'Active' | 'Inactive' | 'active' | 'inActive';
  image?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserResponse {
  success: boolean;
  message?: string;
  data: User[];
  user?: User; // for single user operations
}



export const userService = {
  /**
   * Fetch all users
   */
  getUsers: async (): Promise<User[]> => {
    try {
      const response = await api.get<{ statusCode: number; message: string; data: User[] }>('/users');
      // The backend structure could be direct array or wrapped. Being defensive.
      if (Array.isArray(response)) return response;
      if (response && Array.isArray(response.data)) return response.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (response as any)?.users || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  /**
   * Fetch a single user by ID
   */
  getUserById: async (id: string): Promise<User> => {
    try {
      const response = await api.get<{ data?: User } | User>(`/users/${id}`);

      // Handle potential wrapped response structures
      if (response && 'data' in response && response.data) {
        return response.data;
      }
      return response as User;
    } catch (error) {
      console.error(`Error fetching user ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new user by Admin
   */
  createUser: async (payload: Record<string, unknown> | FormData): Promise<UserResponse> => {
    try {
      console.log('--- Submitting User JSON Payload ---', payload);
      const response = await api.post<UserResponse>('/users', payload);
      return response;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  /**
   * Update an existing user
   */
  updateUser: async (id: string, payload: Record<string, unknown> | FormData): Promise<UserResponse> => {
    try {
      console.log(`--- Submitting User Update Payload for ${id} ---`, payload);
      const response = await api.put<UserResponse>(`/users/${id}/update`, payload);
      return response;
    } catch (error) {
      console.error(`Error updating user ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a user
   */
  deleteUser: async (id: string): Promise<UserResponse> => {
    try {
      const response = await api.delete<UserResponse>(`/users/${id}`);
      return response;
    } catch (error) {
      console.error(`Error deleting user ${id}:`, error);
      throw error;
    }
  },

  /**
   * Update user status explicitly
   */
  updateStatus: async (id: string, status: 'Active' | 'Inactive'): Promise<UserResponse> => {
    try {
      const response = await api.put<UserResponse>(`/users/${id}/status`, { status });
      return response;
    } catch (error) {
      console.error(`Error updating user status ${id}:`, error);
      throw error;
    }
  }
};
