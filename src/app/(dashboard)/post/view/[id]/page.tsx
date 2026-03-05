
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
// import { format } from "date-fns";
import { ArrowLeft, Calendar, User, Globe, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";



interface ViewPostPageProps {
  params: {
    id: string;
  };
}

export default function ViewPostPage({ params }: ViewPostPageProps) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [post, setPost] = useState<any>(null); // Use any or PostData
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadPost = async () => {
            try {
                // Dynamically import service to ensure usage
                const { postService } = await import("@/services/post-service");
                const data = await postService.getPostById(params.id);
                if (data) {
                    setPost(data);
                } else {
                    setError("Post not found");
                }
            } catch (err) {
                console.error("Failed to load post", err);
                setError("Failed to load post details");
            } finally {
                setLoading(false);
            }
        };
        loadPost();
    }, [params.id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="p-8">
                <div className="bg-red-50 text-red-600 p-4 rounded-md">
                    {error || "Post not found"}
                </div>
            </div>
        );
    }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center space-x-4 mb-4">
        <Link href="/post/list">
            <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to List
            </Button>
        </Link>
        <h2 className="text-3xl font-bold tracking-tight">View Post</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
            <Card className="overflow-hidden">
                <div className="relative h-64 w-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                        src={post.image || post.featuredImage || "/placeholder-image.jpg"} 
                        alt={post.headline || post.title || "Post Image"} 
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4">
                        <Badge className={(post.status === "Publish" || post.status === "Published" || post.status === "Active") ? "bg-emerald-600" : "bg-yellow-600"}>
                            {post.status || "Unknown"}
                        </Badge>
                    </div>
                </div>
                <CardHeader>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Badge variant="outline">{typeof post.category === 'object' ? post.category?.name : post.category || "Uncategorized"}</Badge>
                        {post.subCategory && (
                            <>
                                <span>&gt;</span>
                                <span className="font-medium">{post.subCategory}</span>
                            </>
                        )}
                        <span>•</span>
                        <span className="flex items-center gap-1"><Globe className="h-3 w-3" /> {typeof post.language === 'object' ? post.language?.name : post.language || "Unknown"}</span>
                    </div>
                    <CardTitle className="text-2xl">{post.headline || post.title || "Untitled"}</CardTitle>
                    <p className="text-lg text-muted-foreground">{post.seo?.title || post.seoTitle}</p> 
                </CardHeader>
                <CardContent>
                    <Separator className="my-4" />
                    <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: post.content || "" }} />
                </CardContent>
            </Card>
        </div>

        {/* Sidebar / Metadata */}
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Publishing Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                         <span className="text-sm text-muted-foreground flex items-center gap-2">
                            <User className="h-4 w-4" /> Reporter
                         </span>
                         <span className="font-medium">{post.reporter || post.postBy || "Anonymous"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                         <span className="text-sm text-muted-foreground flex items-center gap-2">
                            <Calendar className="h-4 w-4" /> Release Date
                         </span>
                         <span className="font-medium">{post.releaseDate || (post.createdAt ? new Date(post.createdAt).toLocaleDateString() : "N/A")}</span>
                    </div>
                     <div className="flex items-center justify-between">
                         <span className="text-sm text-muted-foreground flex items-center gap-2">
                            <Eye className="h-4 w-4" /> Views
                         </span>
                         <span className="font-medium">{post.hit?.toLocaleString() || "0"}</span>
                    </div>
                </CardContent>
            </Card>

            <Card>
                 <CardHeader>
                    <CardTitle className="text-lg">SEO & Meta</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <span className="text-sm text-muted-foreground block mb-1">SEO Title</span>
                        <p className="font-medium text-sm">{post.seo?.title || post.seoTitle || "N/A"}</p>
                    </div>
                     <div>
                        <span className="text-sm text-muted-foreground block mb-1">Keywords</span>
                         <div className="flex flex-wrap gap-1">
                            {(() => {
                                const keywords = post.seo?.keyword || post.seoKeywords;
                                if (!keywords) return <span className="text-sm text-muted-foreground">N/A</span>;
                                const keywordArray = Array.isArray(keywords) ? keywords : typeof keywords === 'string' ? keywords.split(",") : [];
                                return keywordArray.map((k: string, i: number) => (
                                    <Badge key={i} variant="secondary" className="text-xs">{k.trim()}</Badge>
                                ));
                            })()}
                         </div>
                    </div>
                     <div>
                        <span className="text-sm text-muted-foreground block mb-1">Description</span>
                        <p className="text-sm text-muted-foreground">{post.seo?.description || post.seoDescription || "N/A"}</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                 <CardHeader>
                    <CardTitle className="text-lg">Settings</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${post.status === "Publish" ? "bg-green-500" : "bg-gray-300"}`} /> Published
                        </li>
                        {/* <li className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${post.socialPost ? "bg-green-500" : "bg-gray-300"}`} /> Social Post
                        </li> */}
                    </ul>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
