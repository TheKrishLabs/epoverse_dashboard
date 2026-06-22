

export interface Role {
  _id: string;
  name: string;
  permissions?: Record<string, string[]>;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Optional interface if some endpoints return a wrapper, though currently it seems they don't
export interface RoleResponse {
  success: boolean;
  message?: string;
  data: Role[];
  role?: Role; // for single role operations
}

import api from '@/lib/axios';

const BASE_URL = '/role-and-permission';

export const roleService = {
  /**
   * Fetch all roles
   */
  getRoles: async (): Promise<Role[]> => {
    try {
      // Handle array or wrapped object gracefully so .map() never breaks in UI
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await api.get<any>(`${BASE_URL}`);
      return Array.isArray(response) ? response : (response?.data || response?.roles || []);
    } catch (error: unknown) {
      console.error('Error fetching roles:', error);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const axiosError = error as any;
      if (axiosError.response && axiosError.response.data) {
        console.error('Backend Error Data:', axiosError.response.data);
      }
      throw error;
    }
  },

  /**
   * Fetch a single role by ID
   */
  getRoleById: async (id: string): Promise<Role> => {
    try {
      // The backend likely returns the role object directly. Support wrapper fallback just in case.
      const response = await api.get<Role | RoleResponse>(`${BASE_URL}/${id}`);
      if ('role' in response && response.role) return response.role;
      return response as Role;
    } catch (error) {
      console.error(`Error fetching role ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new role
   */
  createRole: async (data: { name: string; permissions?: Record<string, string[]> }): Promise<Role> => {
    try {
      const response = await api.post<Role>(`${BASE_URL}`, data);
      return response;
    } catch (error) {
      console.error('Error creating role:', error);
      throw error;
    }
  },

  /**
   * Update an existing role
   */
  updateRole: async (id: string, data: { name: string; permissions?: Record<string, string[]> }): Promise<Role> => {
    try {
      const response = await api.put<Role>(`/role-and-permission/${id}/update`, data);
      return response;
    } catch (error) {
      console.error(`Error updating role ${id}:`, error);
      throw error;
    }
  },

  /**
   * Toggle soft delete (Active/Inactive status) of a role
   */
  toggleSoftDeleteRole: async (id: string): Promise<Role> => {
    try {
      const response = await api.patch<Role>(`${BASE_URL}/${id}/toggle-soft-delete`);
      return response;
    } catch (error) {
      console.error(`Error toggling status for role ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a role
   */
  deleteRole: async (id: string): Promise<Record<string, unknown>> => {
    try {
      const response = await api.delete<Record<string, unknown>>(`${BASE_URL}/${id}`);
      return response;
    } catch (error) {
      console.error(`Error deleting role ${id}:`, error);
      throw error;
    }
  }
};
