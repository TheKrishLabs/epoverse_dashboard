"use client";

import { useState, useEffect, use } from "react";
import { PostForm } from "@/components/post-form";
import { postService } from "@/services/post-service";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface EditPostPageProps {
  params: Promise<{ id: string }>;
}

export default function EditPostPage({ params }: EditPostPageProps) {
  // Next.js 15: params is a Promise — unwrap with React.use()
  const { id } = use(params);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPost = async () => {
      try {
        const data = await postService.getArticleById(id);
        if (data) {
          setPost(data);
        } else {
          setError("Post not found.");
        }
      } catch (err) {
        console.error("Failed to load post", err);
        setError("Failed to load post details. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    loadPost();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-3 text-muted-foreground">Loading post…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      {post && <PostForm initialData={post} isEditing />}
    </div>
  );
}
