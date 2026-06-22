"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Filter, Loader2, Plus, RefreshCw, Search, Trash2, AlertTriangle, X } from "lucide-react";
import Link from "next/link";
import { createColumns } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { postService, Article, Category } from "@/services/post-service";
import { languageService, Language } from "@/services/language-service";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function PostPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Filter options ---
  const [categories, setCategories] = useState<Category[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);

  // --- Filter state ---
  const [filters, setFilters] = useState({
    categoryId: "all",
    languageId: "all",
    status: "all",
  });

  // --- Delete dialog state ---
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    loadArticles();
    loadFilterOptions();
  }, []);

  const loadArticles = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await postService.getArticles();
      setArticles(data || []);
    } catch (err) {
      console.error("Failed to load articles", err);
      setError("Failed to load articles. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadFilterOptions = async () => {
    try {
      const [catData, langData] = await Promise.all([
        postService.getCategories(),
        languageService.getLanguages(),
      ]);
      setCategories(catData || []);
      setLanguages(langData || []);
    } catch (err) {
      console.error("Failed to load filter options", err);
    }
  };

  const clearFilters = () => {
    setFilters({
      categoryId: "all",
      languageId: "all",
      status: "all",
    });
    setSearchQuery("");
  };

  const activeFiltersCount = [
    filters.categoryId !== "all",
    filters.languageId !== "all",
    filters.status !== "all",
  ].filter(Boolean).length;

  /** Called by columns — opens the confirmation dialog */
  const handleDeleteRequest = useCallback((id: string, title: string) => {
    setDeleteError(null);
    setDeleteTarget({ id, title });
  }, []);

  /** Confirmed — call API then remove from local state */
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await postService.deleteArticle(deleteTarget.id);
      // Optimistic removal — no refetch needed
      setArticles((prev) => prev.filter((a) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const aid = a._id || (a as any).id;
        return aid !== deleteTarget.id;
      }));
      setDeleteTarget(null);
    } catch (err) {
      console.error("Delete failed:", err);
      setDeleteError("Failed to delete the article. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = useMemo(() => createColumns(handleDeleteRequest), [handleDeleteRequest]);

  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      // 1. Search filter
      if (searchQuery.trim()) {
        const lowerQuery = searchQuery.toLowerCase();
        const titleStr = article.headline || article.title || "";
        if (!titleStr.toLowerCase().includes(lowerQuery)) return false;
      }

      // 2. Category filter
      if (filters.categoryId !== "all") {
        const articleCatId = typeof article.category === "object" ? article.category?._id : article.category;
        if (articleCatId !== filters.categoryId) return false;
      }

      // 3. Language filter
      if (filters.languageId !== "all") {
        const articleLangId = typeof article.language === "object" ? article.language?._id : article.language;
        if (articleLangId !== filters.languageId) return false;
      }

      // 4. Status filter
      if (filters.status !== "all") {
        const status = article.status?.toLowerCase();
        if (status !== filters.status.toLowerCase()) return false;
      }

      return true;
    });
  }, [articles, searchQuery, filters]);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 pb-4">
        <h2 className="text-3xl font-bold tracking-tight">Post List</h2>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search articles by title..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="relative">
                <Filter className="mr-2 h-4 w-4" />
                Filter
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-2 px-1.5 py-0.5 text-[10px] bg-green-100 text-green-700 hover:bg-green-100 border-green-200">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium leading-none">Filters</h4>
                  {activeFiltersCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground">
                      Clear all
                    </Button>
                  )}
                </div>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category</label>
                    <Select value={filters.categoryId} onValueChange={(val) => setFilters(f => ({ ...f, categoryId: val }))}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Language</label>
                    <Select value={filters.languageId} onValueChange={(val) => setFilters(f => ({ ...f, languageId: val }))}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Select Language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Languages</SelectItem>
                        {languages.map((lang) => (
                          <SelectItem key={lang._id} value={lang._id}>{lang.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</label>
                    <Select value={filters.status} onValueChange={(val) => setFilters(f => ({ ...f, status: val }))}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Button variant="outline" size="icon" onClick={loadArticles} title="Refresh">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Link href="/post/add">
            <Button className="bg-green-600 hover:bg-green-700 text-white dark:bg-green-700 dark:hover:bg-green-800">
              <Plus className="mr-2 h-4 w-4" />
              Add Article
            </Button>
          </Link>
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
      ) : filteredArticles.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border rounded-md text-muted-foreground">
          <p>No articles found.</p>
          {(searchQuery || activeFiltersCount > 0) && (
            <Button variant="link" onClick={clearFilters} className="mt-2 text-primary">
              Clear all filters and search query
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {activeFiltersCount > 0 && (
             <div className="flex flex-wrap gap-2 items-center">
                <span className="text-xs font-medium text-muted-foreground">Active Filters:</span>
                {filters.categoryId !== "all" && (
                   <Badge variant="outline" className="flex items-center gap-1 py-1 bg-white">
                      Cat: {categories.find(c => c._id === filters.categoryId)?.name}
                      <X className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => setFilters(f => ({ ...f, categoryId: "all" }))} />
                   </Badge>
                )}
                {filters.languageId !== "all" && (
                   <Badge variant="outline" className="flex items-center gap-1 py-1 bg-white">
                      Lang: {languages.find(l => l._id === filters.languageId)?.name}
                      <X className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => setFilters(f => ({ ...f, languageId: "all" }))} />
                   </Badge>
                )}
                {filters.status !== "all" && (
                   <Badge variant="outline" className="flex items-center gap-1 py-1 bg-white capitalize">
                      Status: {filters.status}
                      <X className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => setFilters(f => ({ ...f, status: "all" }))} />
                   </Badge>
                )}
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 px-2 text-[10px] uppercase font-bold text-muted-foreground hover:text-red-500">
                   Clear all
                </Button>
             </div>
          )}
          <DataTable columns={columns} data={filteredArticles} />
        </div>
      )}

      {/* ── Delete Confirmation Dialog ─────────────────────────── */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setDeleteTarget(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertTriangle className="h-5 w-5" />
              Delete Article
            </DialogTitle>
            <DialogDescription className="pt-2">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">
                &ldquo;{deleteTarget?.title}&rdquo;
              </span>
              ?
              <br />
              <span className="text-red-500 text-sm">This action cannot be undone.</span>
            </DialogDescription>
          </DialogHeader>

          {deleteError && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{deleteError}</AlertDescription>
            </Alert>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="gap-2"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              {isDeleting ? "Deleting…" : "Yes, Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
