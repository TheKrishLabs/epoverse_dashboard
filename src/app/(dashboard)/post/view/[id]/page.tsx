
"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
// import { format } from "date-fns";
import { ArrowLeft, Calendar, User, Globe, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";



interface ViewPostPageProps {
  params: Promise<{ id: string }>;
}

export default function ViewPostPage({ params }: ViewPostPageProps) {
    const { id } = use(params);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [post, setPost] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadPost = async () => {
            try {
                const { postService } = await import("@/services/post-service");
                const data = await postService.getArticleById(id);
                if (data) {
                    setPost(data);
                } else {
                    setError("Article not found");
                }
            } catch (err) {
                console.error("Failed to load article", err);
                setError("Failed to load article details");
            } finally {
                setLoading(false);
            }
        };
        loadPost();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8 min-h-[400px]">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="p-8">
                <div className="bg-red-50 text-red-600 p-4 rounded-md border border-red-200">
                    {error || "Article not found"}
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
        <h2 className="text-3xl font-bold tracking-tight">View Article</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
            <Card className="overflow-hidden border-none shadow-md">
                <div className="relative h-64 sm:h-80 w-full group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                        src={post.image || post.featuredImage || "/placeholder-image.jpg"} 
                        alt={post.imageAlt || post.headline || post.title || "Article Image"} 
                        title={post.imageTitle || post.headline || post.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute top-4 right-4">
                        <Badge className={(post.status === "Publish" || post.status === "Published" || post.status === "Active" || post.status === "published") ? "bg-emerald-600" : "bg-yellow-600"}>
                            {post.status || "Unknown"}
                        </Badge>
                    </div>
                </div>
                <CardHeader className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="outline" className="bg-primary/5">
                            {typeof post.category === 'object' ? post.category?.name : post.category || "Uncategorized"}
                        </Badge>
                        {post.subCategory && (
                            <>
                                <span>&gt;</span>
                                <span className="font-medium">{post.subCategory}</span>
                            </>
                        )}
                        <span>•</span>
                        <span className="flex items-center gap-1"><Globe className="h-3 w-3" /> {typeof post.language === 'object' ? post.language?.name : post.language || "Unknown"}</span>
                    </div>
                    <CardTitle className="text-2xl sm:text-3xl font-extrabold">{post.headline || post.title || "Untitled"}</CardTitle>
                    {post.shortDescription && (
                        <p className="text-lg text-muted-foreground leading-relaxed italic border-l-4 border-primary/20 pl-4">
                            {post.shortDescription}
                        </p>
                    )}
                </CardHeader>
                <CardContent>
                    <Separator className="my-6" />
                    <div 
                        className="prose dark:prose-invert max-w-none prose-emerald prose-headings:font-bold prose-p:leading-relaxed prose-img:rounded-xl" 
                        dangerouslySetInnerHTML={{ __html: post.content || "" }} 
                    />
                </CardContent>
            </Card>
        </div>

        {/* Sidebar / Metadata */}
        <div className="space-y-6">
            <Card className="shadow-sm">
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
                            <Calendar className="h-4 w-4" /> Created Date
                         </span>
                         <span className="font-medium">{(post.createdAt ? new Date(post.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' }) : "N/A")}</span>
                    </div>
                     <div className="flex items-center justify-between">
                         <span className="text-sm text-muted-foreground flex items-center gap-2">
                            <Eye className="h-4 w-4" /> Total Views
                         </span>
                         <span className="font-medium font-mono">{(post.hit || post.views)?.toLocaleString() || "0"}</span>
                    </div>
                </CardContent>
            </Card>

            {(post.metaKeywords || post.tags || post.metaDescription) && (
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">SEO & Discovery</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {post.slug && (
                            <div>
                                <span className="text-sm text-muted-foreground block mb-1 font-semibold text-xs uppercase tracking-wider">URL Slug</span>
                                <p className="font-mono text-xs bg-muted p-2 rounded truncate" title={post.slug}>{post.slug}</p>
                            </div>
                        )}
                        <div>
                            <span className="text-sm text-muted-foreground block mb-2 font-semibold text-xs uppercase tracking-wider">Keywords & Tags</span>
                            <div className="flex flex-wrap gap-1.5">
                                {(() => {
                                    const keywords = post.metaKeywords || post.tags || post.seo?.keyword || post.seoKeywords;
                                    if (!keywords) return <span className="text-sm text-muted-foreground">N/A</span>;
                                    const keywordArray = Array.isArray(keywords) ? keywords : typeof keywords === 'string' ? keywords.split(",") : [];
                                    if (keywordArray.length === 0) return <span className="text-sm text-muted-foreground">N/A</span>;
                                    return keywordArray.map((k: string, i: number) => (
                                        <Badge key={i} variant="secondary" className="text-[10px] px-2 py-0 h-5 lowercase">{k.trim()}</Badge>
                                    ));
                                })()}
                            </div>
                        </div>
                        {post.metaDescription && (
                            <div>
                                <span className="text-sm text-muted-foreground block mb-1 font-semibold text-xs uppercase tracking-wider">Meta Description</span>
                                <p className="text-xs text-muted-foreground leading-relaxed">{post.metaDescription}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            <Card className="shadow-sm overflow-hidden">
                 <CardHeader className="pb-3 text-sm font-semibold uppercase tracking-wider">
                    Article Status
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <div className={`h-3 w-3 rounded-full animate-pulse ${ (post.status === "Publish" || post.status === "published") ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" : "bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)]"}`} /> 
                        <span className="text-sm font-bold capitalize">{post.status || "Draft"}</span>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
