import api from "@/lib/axios";
import { PostData } from "@/lib/mock-db";

export type { PostData };


export interface Category {
    _id: string;
    name: string;
    slug?: string;
    status?: string;
}

export interface Article {
    _id: string;
    title?: string;
    headline?: string;
    content: string;
    // They could be returned as nested populated objects or just ID strings
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    category?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    language?: any;
    featuredImage?: string;
    image?: string;
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
        if (Array.isArray(response)) return response;
        if (response && Array.isArray(response.data)) return response.data;
        if (response && Array.isArray(response.articles)) return response.articles;
        return [];
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

        // Fallback: Just in case the backend ignored our sorting/limiting params, we manually sort and slice client-side
        items = items.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA; // Descending
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
        if (response && response.article) return response.article;
        return response;
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
        return await api.put(`/articles/${id}`, payload);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
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
  }
};
