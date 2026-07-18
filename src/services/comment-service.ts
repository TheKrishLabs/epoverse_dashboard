import api from "@/lib/axios";

export interface CommentData {
  id?: string;
  _id?: string;
  userName?: string;
  userEmail?: string;
  comment?: string;
  message?: string;
  reportedReason?: string;
  reportedMessages?: string;
  articleId?: any; // populate from backend
  postTitle?: string;
  status?: string;
  isReported?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const commentService = {
  fetchComments: async (): Promise<CommentData[]> => {
    try {
      const response = await api.get<any>('/comments/fetch-all');
      console.log("Fetch Comments Response:", response);
      
      let items: CommentData[] = [];
      if (Array.isArray(response)) items = response;
      else if (response && typeof response === 'object') {
          if (Array.isArray(response.data)) items = response.data;
          else if (Array.isArray(response.comments)) items = response.comments;
          else {
              const firstArray = Object.values(response).find(val => Array.isArray(val));
              if (firstArray) items = firstArray as CommentData[];
          }
      }
      return items;
    } catch (error) {
      console.error("Failed to fetch comments:", error);
      return [];
    }
  },

  getCommentById: async (id: string): Promise<CommentData | undefined> => {
    try {
      const response = await api.get<any>(`/comments/${id}`);
      const data = response?.data || response?.comment || response;
      if (data && typeof data === 'object' && (data._id || data.id)) {
          return data as CommentData;
      }
      return undefined;
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
          return undefined;
      }
      throw error;
    }
  },

  unreportComment: async (id: string): Promise<any> => {
    const response = await api.patch<any>(`/comments/${id}/unreport`);
    return response?.data || response;
  },

  deleteCommentAdmin: async (id: string): Promise<boolean> => {
    await api.delete(`/comments/${id}/admin`);
    return true;
  },

  deleteCommentUser: async (id: string): Promise<boolean> => {
    await api.delete(`/comments/${id}`);
    return true;
  },

  reportComment: async (id: string, reportedReason: string, reportedMessages: string): Promise<any> => {
    const response = await api.patch<any>(`/comments/${id}/report-commnet`, {
        reportedReason,
        reportedMessages
    });
    return response?.data || response;
  }
};
