"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { postService, Article, Category } from "@/services/post-service";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { columns } from "@/app/(dashboard)/post/list/columns";

export default function CategoryArticlesPage() {
  const params = useParams();
  const categoryId = params.id as string;
  
  const [articles, setArticles] = useState<Article[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [articlesData, categoriesData] = await Promise.all([
          postService.getArticlesByCategory(categoryId),
          postService.getCategories()
      ]);
      
      setArticles(articlesData || []);
      const currentCategory = categoriesData.find(c => c._id === categoryId);
      if (currentCategory) {
          setCategory(currentCategory);
      }
    } catch (err) {
      console.error("Failed to load category articles", err);
      setError("Failed to load articles for this category. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    if (categoryId) {
        loadData();
    }
  }, [categoryId, loadData]);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 pb-4">
        <div className="flex items-center gap-4">
            <Link href="/categories">
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-full border-gray-200">
                    <ArrowLeft className="h-4 w-4" />
                </Button>
            </Link>
            <div>
                <h2 className="text-3xl font-bold tracking-tight">
                    {category ? `Articles: ${category.name}` : "Category Articles"}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                    Viewing all articles assigned to this category
                </p>
            </div>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="outline" size="icon" onClick={loadData} title="Refresh">
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
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
           <span className="ml-2 text-muted-foreground">Loading articles...</span>
        </div>
      ) : articles.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border rounded-md text-muted-foreground bg-gray-50/50 dashed">
           <p className="text-lg font-medium">No articles found in this category.</p>
           <p className="text-sm mt-1">Articles assigned to &quot;{category?.name || 'this category'}&quot; will appear here.</p>
           <Link href="/post/add" className="mt-4">
             <Button variant="outline" className="text-green-600 border-green-200 hover:bg-green-50">
                 Write an Article
             </Button>
           </Link>
        </div>
      ) : (
        <div className="rounded-md border bg-white shadow-sm overflow-hidden">
            <DataTable columns={columns} data={articles} />
        </div>
      )}
    </div>
  );
}
