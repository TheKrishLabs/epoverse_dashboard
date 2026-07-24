/* eslint-disable */
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
  post?: any;
  postId?: string;
  article?: any;
  user?: any;
  author?: any;
  content?: string;
  text?: string;
  status?: string;
  isReported?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const commentService = {
  // 2. fetching comments :(admin dashboard)
  fetchComments: async (): Promise<CommentData[]> => {
    try {
      const response = await api.get<any>('/comments/fetch-all');

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

  // 3. fetching comments by id:
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
      console.error(`Failed to fetch comment with id ${id}:`, error);
      throw error;
    }
  },

  // 4. update report to unreport comment
  unreportComment: async (id: string): Promise<any> => {
    try {
      const response = await api.patch<any>(`/comments/${id}/unreport`);
      return response?.data || response;
    } catch (error) {
      console.error(`Failed to unreport comment ${id}:`, error);
      throw error;
    }
  },

  // Update unreport to report comment (admin toggle)
  reReportComment: async (id: string): Promise<any> => {
    try {
      const response = await api.patch<any>(`/comments/${id}/report`);
      return response?.data || response;
    } catch (error) {
      console.error(`Failed to report comment ${id}:`, error);
      throw error;
    }
  },

  // 5. Deleting a comment (admin)
  deleteCommentAdmin: async (id: string): Promise<boolean> => {
    try {
      await api.delete(`/comments/${id}/admin`);
      return true;
    } catch (error) {
      console.error(`Failed to delete comment ${id} as admin:`, error);
      throw error;
    }
  },

  // 6. deleting self comment by user:
  deleteCommentUser: async (id: string): Promise<boolean> => {
    try {
      await api.delete(`/comments/${id}`);
      return true;
    } catch (error) {
      console.error(`Failed to delete comment ${id} as user:`, error);
      throw error;
    }
  },

  // 1. report comment:(user side)
  reportComment: async (id: string, reportedReason: string, reportedMessages: string): Promise<any> => {
    try {
      // NOTE: Using exact typo from docs "/report-commnet"
      const response = await api.patch<any>(`/comments/${id}/report-commnet`, {
        reportedReason,
        reportedMessages
      });
      return response?.data || response;
    } catch (error) {
      console.error(`Failed to report comment ${id}:`, error);
      throw error;
    }
  }
};

