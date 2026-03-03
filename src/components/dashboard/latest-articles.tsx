"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { 
    Eye, 
    Edit, 
    RefreshCw, 
    ArrowRight, 
    Image as ImageIcon,
    AlertCircle
} from "lucide-react";

import { postService, Article } from "@/services/post-service";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function LatestArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArticles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await postService.getLatestArticles(5);
      setArticles(data || []);
    } catch (err: unknown) {
      console.error(err);
      setError("Failed to load latest articles. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex flex-col gap-1">
          <CardTitle>Latest Articles</CardTitle>
          <CardDescription>Recently created or updated articles</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchArticles} 
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button asChild variant="default" size="sm" className="hidden sm:flex items-center gap-2">
            <Link href="/post/list">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="px-0 sm:px-6">
        {error ? (
          <div className="px-6 pb-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        ) : isLoading ? (
          <div className="px-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-md" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12 px-4 border-dashed border-2 rounded-lg mx-6 bg-slate-50 dark:bg-slate-900/50">
            <h3 className="text-lg font-medium text-muted-foreground">No recent articles found</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">You haven not authored any content yet.</p>
            <Button asChild variant="outline">
              <Link href="/post/add">Create First Article</Link>
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Image</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead className="hidden md:table-cell">Category</TableHead>
                  <TableHead className="hidden lg:table-cell">Language</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden xl:table-cell text-right">Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {articles.map((article) => (
                  <TableRow key={article._id}>
                    <TableCell>
                      <div className="h-10 w-10 relative rounded overflow-hidden bg-slate-100 flex items-center justify-center border">
                        {article.image || article.featuredImage ? (
                          <img 
                            src={article.image || article.featuredImage || ''} 
                            alt={article.title || "Article Image"}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <ImageIcon className="h-5 w-5 text-slate-400" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium max-w-[200px] sm:max-w-xs truncate">
                      {article.title || article.headline || "Untitled"}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {article.category?.name || "Uncategorized"}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">
                      {article.language?.name || article.language || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={
                          article.status?.toLowerCase() === 'active' || article.status?.toLowerCase() === 'published'
                            ? "border-green-500 text-green-600 bg-green-50 dark:bg-green-950/30" 
                            : "border-slate-300 text-slate-500 bg-slate-50 dark:bg-slate-900/30"
                        }
                      >
                        {article.status || "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell text-right text-muted-foreground text-sm">
                        {article.createdAt ? format(new Date(article.createdAt), "MMM d, yyyy") : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button asChild size="icon" variant="ghost" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                          <Link href={`/post/view/${article._id}`} title="View">
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button asChild size="icon" variant="ghost" className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50">
                          <Link href={`/post/edit/${article._id}`} title="Edit">
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        
        {/* Mobile View All Button */}
        <div className="mt-4 px-6 sm:hidden flex justify-center">
            <Button asChild variant="outline" className="w-full h-10">
              <Link href="/post/list">
                View All Articles
              </Link>
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
