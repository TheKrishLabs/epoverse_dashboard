
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Filter, Loader2, Plus, RefreshCw, Search, Trash2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { createColumns } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { postService, Article } from "@/services/post-service";
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

export default function PostPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Delete dialog state ---
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    loadArticles();
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
    if (!searchQuery.trim()) return articles;
    const lowerQuery = searchQuery.toLowerCase();
    return articles.filter((article) => {
      const titleStr = article.headline || article.title || "";
      return titleStr.toLowerCase().includes(lowerQuery);
    });
  }, [articles, searchQuery]);

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
          <Button variant="outline" size="icon" onClick={loadArticles} title="Refresh">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Link href="/post/add">
            <Button className="bg-green-600 hover:bg-green-700 text-white dark:bg-green-700 dark:hover:bg-green-800">
              <Plus className="mr-2 h-4 w-4" />
              Add Article
            </Button>
          </Link>
          <Button variant="outline">
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
          <span className="ml-2 text-muted-foreground">Loading articles...</span>
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border rounded-md text-muted-foreground">
          <p>No articles found.</p>
          {searchQuery && <p className="text-sm mt-1">Try clearing your search query.</p>}
        </div>
      ) : (
        <DataTable columns={columns} data={filteredArticles} />
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
