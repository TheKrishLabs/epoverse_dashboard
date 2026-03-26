import api from '@/lib/axios';

// Update interface to match user's expected response structure
// { "fullName":..., "email":..., "password":..., "confirmPassword":... }
export interface User {
  id?: string;
  fullName?: string; // Mapped from response
  email: string;
  name?: string; // Kept for compatibility with other components
  role?: string;
  avatar?: string;
  accessToken?: string;
}

export interface AuthResponse {
  // flexible response because the user indicated a structured user object might be returned
  // without a explicit "token" field in the example, but generally login endpoints return tokens.
  // We will support both: token in root, or token implied/not present.
  message?: string;
  token?: string;
  accessToken?: string;
  user?: User;
  
  // Specific fields from user example
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

// Use Next.js rewrites (configured in next.config.ts) to avoid CORS issues
const API_URL = "/auth";

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      console.log(`Attempting login to: ${API_URL}/login`);
      const data = await api.post<AuthResponse>(`${API_URL}/login`, { email, password });
      console.log("Response Data:", data);

      // Handle the token storage.
      // If the API returns a 'token' field, we store it.
      
      const responseData = data as Record<string, unknown>;
      const nestedData = responseData.data as Record<string, unknown> | undefined;
      const nestedToken = (nestedData?.accessToken || nestedData?.token) as string | undefined;
      
      // Extract from data.user.accessToken as specifically requested
      const userToken = data.user?.accessToken;
      
      const tokenToStore = userToken || data.accessToken || data.token || nestedToken;
      
      // If no token but we have user data, we might generate a dummy one or check headers?
      // For now, let's assume if data.email exists, it's a success.
      
      if (tokenToStore) {
        localStorage.setItem("authToken", tokenToStore);
        document.cookie = `authToken=${tokenToStore}; path=/; max-age=86400; SameSite=Strict`;
      } else if (data.email || data.user?.email || data.user) {
          // Fallback: If the API just returns the user object (flat or nested), we accept it as "logged in"
          // This is not secure for real auth but fits the user's "Specific Response" scenario.
           const dummyToken = "session-active";
           localStorage.setItem("authToken", dummyToken); 
           document.cookie = `authToken=${dummyToken}; path=/; max-age=86400; SameSite=Strict`;
      }

      // Store User Data
      // Map 'fullName' to 'name' for compatibility
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const userData = ((data.user as any)?.user || data.user || data) as Record<string, any>;
      const userToStore: User = {
          email: userData.email || '',
          name: userData.fullName || userData.name || userData.email?.split('@')[0] || 'User',
          fullName: userData.fullName,
          // Merge other fields if needed
          ...userData
      };
      
      console.log("Saving user to localStorage:", userToStore);
      localStorage.setItem("user", JSON.stringify(userToStore));

      if (userToStore.role) {
        document.cookie = `userRole=${userToStore.role}; path=/; max-age=86400; SameSite=Strict`;
      }

      return data;
    } catch (error: unknown) {
      console.error("Login Service Error Detailed:", error);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errorMessage = (error as any)?.customMessage || (error as any)?.message || "Network error. Please try again later.";
      throw new Error(errorMessage);
    }
  },

  signup: async (fullName: string, email: string, password: string, confirmPassword?: string): Promise<AuthResponse> => {
    try {
      console.log(`Attempting signup to: ${API_URL}/register`);
      const payload: { fullName: string; email: string; password: string; confirmPassword?: string } = { fullName, email, password };
      if (confirmPassword) payload.confirmPassword = confirmPassword;

      const data = await api.post<AuthResponse>(`${API_URL}/register`, payload);
      console.log("Signup Response Data:", data);

      return data;
    } catch (error: unknown) {
      console.error("Signup Service Error Detailed:", error);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errorMessage = (error as any)?.customMessage || (error as any)?.message || "Network error. Please try again later.";
      throw new Error(errorMessage);
    }
  },

  logout: () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    // Clear cookies with all potential path/domain combinations to be safe
    document.cookie = "authToken=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "userRole=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    window.location.href = "/login";
  },

  getToken: (): string | null => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("authToken");
    }
    return null;
  },

  isAuthenticated: (): boolean => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("authToken");
      return !!token;
    }
    return false;
  },

  getUser: (): User | null => {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          return JSON.parse(userStr);
        } catch (e) {
          console.error("Error parsing user data", e);
          return null;
        }
      }
    }
    return null;
  }
};
