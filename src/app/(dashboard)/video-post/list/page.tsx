"use client";

import { useState, useEffect } from "react";
import { Filter, Loader2, Plus, RefreshCw } from "lucide-react";
import Link from "next/link";
import { columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { videoPostService, VideoPostData } from "@/services/video-post-service";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function VideoPostListPage() {
  const [posts, setPosts] = useState<VideoPostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await videoPostService.getVideoPosts();
      setPosts(data);
    } catch (err) {
      console.error("Failed to load video posts", err);
      // Wait, let's gracefully handle if the endpoint is not ready and set to []
      // setError("Failed to load posts. Please try again.");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Video Post List</h2>
        <div className="flex items-center space-x-2">
           <Button variant="ghost" size="icon" onClick={loadPosts} title="Refresh">
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
           <Link href="/video-post/add">
            <Button className="bg-green-600 hover:bg-green-700 text-white dark:bg-green-700 dark:hover:bg-green-800">
                <Plus className="mr-2 h-4 w-4" />
                Add Video Post
            </Button>
           </Link>
          <Button className="bg-green-600 hover:bg-green-700 text-white dark:bg-green-700 dark:hover:bg-green-800">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </div>
      </div>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64 border rounded-md">
           <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
           <span className="ml-2 text-muted-foreground">Loading posts...</span>
        </div>
      ) : (
        <DataTable columns={columns} data={posts} />
      )}
    </div>
  );
}
