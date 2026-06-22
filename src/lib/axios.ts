import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// Define the structure of error response from the API
interface ApiErrorResponse {
  message?: string;
  error?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

// Create Axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api', // Default to /api if env var not set
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 seconds timeout (to handle Render free tier cold starts)
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage (or cookies if you prefer measuring that here, 
    // but localStorage is common for client-side)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      if (token) {
        console.log(`[Axios] Found token in localStorage (Preview: ${token.substring(0, 10)}...). Attaching to: ${config.url}`);
      } else {
        console.warn(`[Axios] NO token found in localStorage for: ${config.url}`);
      }
      
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    // Let browser automatically set Content-Type with boundary for FormData
    if (config.data instanceof FormData && config.headers) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // You can unwrap the response data here if you want to work directly with data
    // For now, returning the full response object is safer for types, 
    // or we can strictly return response.data
    return response;
  },
  (error: AxiosError<ApiErrorResponse>) => {
    // Handle global errors
    if (error.response) {
      const { status } = error.response;
      
      if (status === 401) {
        // Unauthorized - Clear token and redirect to login
        if (typeof window !== 'undefined') {
            // Check if we are not already on the login page to avoid loops
            if (!window.location.pathname.includes('/login')) {
                 localStorage.removeItem('authToken');
                 localStorage.removeItem('user');
                 // Optional: Clear cookies logic here if needed
                 document.cookie = "authToken=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                 // We intentionally do NOT use window.location.href = '/login' here to prevent abrupt
                 // unmounting of pages or losing user form progress.
                 // The UI (e.g. Next.js middleware or Auth guards) should gracefully react to the missing token.
                 console.warn("Session expired or invalid token. Please log in again.");
            }
        }
      }
      
      // You can handle other status codes here (403, 404, 500 etc.)
    }
    
    // Construct a more usable error object or just reject
    const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'An unexpected error occurred';
    // Attach custom message to error object for easier access in types
    // @ts-expect-error Adding custom property
    error.customMessage = errorMessage;
    
    return Promise.reject(error);
  }
);

// Helper methods to standardize API calls
const api = {
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await axiosInstance.get<T>(url, config);
    return response.data;
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  post: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await axiosInstance.post<T>(url, data, config);
    return response.data;
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  put: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await axiosInstance.put<T>(url, data, config);
    return response.data;
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  patch: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await axiosInstance.patch<T>(url, data, config);
    return response.data;
  },

  delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await axiosInstance.delete<T>(url, config);
    return response.data;
  },
  
  // Expose the instance if needed for advanced usage
  instance: axiosInstance
};

export default api;
