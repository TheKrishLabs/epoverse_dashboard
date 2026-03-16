import api from "@/lib/axios";
import { PostData } from "@/lib/mock-db";

export type { PostData };


export interface Category {
    _id: string;
    name: string;
    description?: string;
    slug?: string;
    status?: string;
}

export interface Article {
    _id: string;
    title?: string;
    headline?: string;
    shortDescription?: string;
    content: string;
    // They could be returned as nested populated objects or just ID strings
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    category?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    language?: any;
    slug?: string;
    featuredImage?: string;
    image?: string;
    thumbnail?: string;
    imageAlt?: string;
    tags?: string[];
    metaKeywords?: string[];
    metaDescription?: string;
    isLatest?: boolean;
    status?: string;
    createdAt?: string;
    updatedAt?: string;
}

export const postService = {
  getCategories: async (): Promise<Category[]> => {
      try {
        console.log("Fetching categories from /categories");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response: any = await api.get('/categories');
        console.log("Raw Categories Response:", response);
        if (Array.isArray(response)) return response;
        if (response && Array.isArray(response.data)) return response.data;
        if (response && Array.isArray(response.categories)) return response.categories;
        return [];
      } catch (error) {
        console.error("Failed to fetch categories", error);
        throw error;
      }
  },

  createCategory: async (payload: {
    name: string;
    slug?: string;
    description?: string;
    status?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }): Promise<any> => {
      try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return await api.post<any>('/categories', payload);
      } catch (error) {
          console.error("Failed to create category", error);
          throw error;
      }
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateCategory: async (id: string, payload: any): Promise<any> => {
      try {
          return await api.put(`/categories/${id}`, payload);
      } catch (error) {
          console.error("Failed to update category", error);
          throw error;
      }
  },

  getPosts: async (): Promise<PostData[]> => {
    return api.get<PostData[]>('/posts');
  },

  getArticles: async (): Promise<Article[]> => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response: any = await api.get('/articles');
        let items: Article[] = [];
        if (Array.isArray(response)) items = response;
        else if (response && Array.isArray(response.data)) items = response.data;
        else if (response && Array.isArray(response.articles)) items = response.articles;
        else if (response && response.data && Array.isArray(response.data.articles)) items = response.data.articles;
        // Backend uses soft-delete (isDeleted: true) but still returns those records
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return items.filter((a: any) => !a.isDeleted);
      } catch (error) {
        console.error("Failed to fetch articles", error);
        throw error;
      }
  },

  getLatestArticles: async (limit: number = 5): Promise<Article[]> => {
    try {
        // Attempt to request filtered params natively if the API supports it
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response: any = await api.get('/articles', {
            params: { sort: 'createdAt', order: 'desc', limit }
        });
        
        // Parse array safely
        let items: Article[] = [];
        if (Array.isArray(response)) items = response;
        else if (response && Array.isArray(response.data)) items = response.data;
        else if (response && Array.isArray(response.articles)) items = response.articles;

        // Filter soft-deleted, sort and slice
        items = items
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .filter((a: any) => !a.isDeleted)
            .sort((a, b) => {
                const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return dateB - dateA;
            });

        return items.slice(0, limit);
    } catch (error) {
        console.error("Failed to fetch latest articles", error);
        throw error;
    }
  },

  getArticleById: async (id: string): Promise<Article | undefined> => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response: any = await api.get(`/articles/${id}`);
        const data = response?.data?.article || response?.article || response?.data || response;
        if (data && typeof data === 'object' && (data._id || data.id)) return data;
        return data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        if (error.response && error.response.status === 404) {
            return undefined;
        }
        throw error;
    }
  },

  getPostById: async (id: string): Promise<PostData | undefined> => {
    try {
        return await api.get<PostData>(`/posts/${id}`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        if (error.response && error.response.status === 404) {
            return undefined;
        }
        throw error;
    }
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createPost: async (post: any): Promise<any> => {
    // Legacy support or fallback depending on how Dashboard handles it
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return api.post<any>('/posts', post);
  },

  createArticle: async (payload: {
    headline: string;
    content: string;
    shortDescription: string;
    slug: string;
    category: string;
    language: string;
    status: string;
    image: string;
    thumbnail?: string;
    imageAlt?: string;
    tags?: string[];
    metaKeywords?: string[];
    metaDescription?: string;
    isLatest?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } | FormData): Promise<any> => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await api.post<any>('/articles', payload);
      return response;
    } catch (error) {
      console.error("Failed to add article", error);
      throw error;
    }
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateArticle: async (id: string, payload: any): Promise<any> => {
    try {
        console.log(`Updating article ${id} with payload:`, payload);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response: any = await api.put(`/articles/${id}`, payload);
        console.log(`Update Article (${id}) Response:`, response);
        
        // Handle various response wrappers
        const data = response?.data?.article || response?.article || response?.data || response;
        
        if (data && typeof data === 'object' && (data._id || data.id)) {
            return data;
        }
        return data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.error(`Failed to update article ${id}:`, error);
        if (error.response && error.response.status === 404) {
            return null;
        }
        throw error;
    }
  },

  updatePost: async (id: string, updates: Partial<PostData>): Promise<PostData | null> => {
    try {
        return await api.put<PostData>(`/posts/${id}`, updates);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
         if (error.response && error.response.status === 404) {
            return null;
        }
        throw error;
    }
  },

  deletePost: async (id: string): Promise<boolean> => {
    await api.delete(`/posts/${id}`);
    return true;
  },

  deleteArticle: async (id: string): Promise<boolean> => {
    try {
      await api.delete(`/articles/${id}`);
      return true;
    } catch (error) {
      console.error(`Failed to delete article ${id}:`, error);
      throw error;
    }
  },

  downloadBulkTemplate: async (): Promise<Blob> => {
    try {
      const response = await api.get('/articles/bulk/template', {
        responseType: 'blob'
      });
      // The axios interceptor we have in src/lib/axios.ts returns response.data directly
      return response as unknown as Blob; 
      
    } catch (error) {
       console.error("Failed to download bulk upload template:", error);
       throw error;
    }
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  uploadBulkArticles: async (file: File): Promise<any> => {
    try {
      // // MOCK IMPLEMENTATION FOR DEVELOPMENT
      // // Simulate backend validation
      // if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      //   throw {
      //     response: {
      //        data: {
      //            message: "Invalid file format. Server only accepts CSV files."
      //        }
      //     }
      //   };
      // }

      // // Simulate network request delay (2 seconds)
      // await new Promise(resolve => setTimeout(resolve, 2000));
      
      // // Simulate successful backend response
      // return {
      //     message: `Successfully processed ${file.name}. (Mock Response)`,
      //     data: {
      //         status: "success",
      //         rowsProcessed: Math.floor(Math.random() * 50) + 10 // Random number to look realistic
      //     }
      // };

       // Original Implementation:
      const formData = new FormData();
      formData.append('file', file);
      
      // Axios handles the 'Content-Type' naturally along with the dynamic multipart boundary when passed FormData.
      // Explicitly forcing 'Content-Type': 'multipart/form-data' deletes this boundary, causing bad requests.
      const response = await api.post('/articles/bulk/upload', formData);
      
      return response;
      
    } catch (error) {
       console.error("Failed to upload bulk articles:", error);
       throw error;
    }
  },

  getArticlesByCategory: async (categoryId: string): Promise<Article[]> => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response: any = await api.get(`/articles/fetch-by-category/${categoryId}`);
        console.log(`Raw Articles by Category (${categoryId}) Response:`, response);
        
        if (Array.isArray(response)) return response;
        if (response && typeof response === 'object') {
            if (Array.isArray(response.data)) return response.data;
            if (Array.isArray(response.articles)) return response.articles;
            
            // Fallback: find first array
            const firstArray = Object.values(response).find(val => Array.isArray(val));
            if (firstArray) return firstArray as Article[];
        }
        return [];
    } catch (error) {
        console.error(`Failed to fetch articles for category ${categoryId}`, error);
        throw error;
    }
  }
};
