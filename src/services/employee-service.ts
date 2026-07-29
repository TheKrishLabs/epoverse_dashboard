import api from '@/lib/axios';
import { User, UserResponse } from './user-service';

export const employeeService = {
  /**
   * Fetch all employees
   */
  getEmployees: async (): Promise<User[]> => {
    try {
      const response = await api.get<{ statusCode: number; message: string; data: User[] }>('/users/employees');
      if (Array.isArray(response)) return response;
      if (response && Array.isArray(response.data)) return response.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (response as any)?.users || [];
    } catch (error) {
      console.error('Error fetching employees:', error);
      throw error;
    }
  },

  /**
   * Fetch a single employee by ID
   */
  getEmployeeById: async (id: string): Promise<User> => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await api.get<any>(`/users/${id}/employees`);

      if (response?.data?.user) return response.data.user;
      if (response?.user) return response.user;
      if (response?.data) return response.data;
      
      return response as User;
    } catch (error) {
      console.error(`Error fetching employee ${id}:`, error);
      throw error;
    }
  },

  

  /**
   * Update an existing employee
   */
  updateEmployee: async (id: string, payload: Record<string, unknown> | FormData): Promise<UserResponse> => {
    try {
      console.log(`--- Submitting Employee Update Payload for ${id} ---`, payload);
      const response = await api.patch<UserResponse>(`/users/${id}/employees`, payload);
      return response;
    } catch (error) {
      console.error(`Error updating employee ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new employee
   */
  createEmployee: async (payload: Record<string, unknown> | FormData): Promise<UserResponse> => {
    try {
      console.log('--- Submitting Employee JSON Payload ---', payload);
      const response = await api.post<UserResponse>('/users', payload);
      return response;
    } catch (error) {
      console.error('Error creating employee:', error);
      throw error;
    }
  },
  /**
   * Delete an employee
   */
  deleteEmployee: async (id: string): Promise<UserResponse> => {
    try {
      const response = await api.delete<UserResponse>(`/users/${id}`);
      return response;
    } catch (error) {
      console.error(`Error deleting employee ${id}:`, error);
      throw error;
    }
  },
};
