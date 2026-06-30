"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Filter, Loader2, Plus, RefreshCw, Search, X } from "lucide-react";
import Link from "next/link";
import { getColumns } from "./columns";
import { DraggableDataTable } from "./draggable-data-table";
import { Button } from "@/components/ui/button";
import { postService, Category } from "@/services/post-service";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CheckCircle2 } from "lucide-react";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // --- Deletion Dialog state ---
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<{ id: string; name: string } | null>(null);

  // --- Filter state ---
  const [filters, setFilters] = useState({
    status: "all",
  });

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await postService.getCategories();
      setCategories(data || []);
    } catch (err) {
      console.error("Failed to load categories", err);
      setError("Failed to load categories. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const clearFilters = () => {
    setFilters({
      status: "all",
    });
    setSearchQuery("");
  };

  const handleDeleteClick = useCallback((id: string, name: string) => {
    setCategoryToDelete({ id, name });
    setIsDeleteDialogOpen(true);
  }, []);

  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    
    setIsDeleteDialogOpen(false);
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      await postService.deleteCategory(categoryToDelete.id);
      setSuccess(`Category "${categoryToDelete.name}" deleted successfully.`);
      await loadCategories();
      
      // Auto-clear success message after 5 seconds
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      console.error("Failed to delete category", err);
      setError("Failed to delete category. Please try again.");
    } finally {
      setLoading(false);
      setCategoryToDelete(null);
    }
  };

  const handleReorder = async (newOrder: Category[]) => {
    // Optimistically update the UI
    setCategories(newOrder);

    // Get array of IDs in new order
    const orderedIds = newOrder.map(cat => cat._id);
    
    try {
      await postService.updateCategoryOrder(orderedIds);
    } catch (err) {
      console.error("Failed to reorder categories", err);
      setError("Failed to reorder categories. Please try again.");
      // Rollback to previous state on failure
      loadCategories();
    }
  };

  const columns = useMemo(() => getColumns(handleDeleteClick), [handleDeleteClick]);

  const activeFiltersCount = [
    filters.status !== "all",
  ].filter(Boolean).length;

  const filteredCategories = useMemo(() => {
    return categories.filter((category) => {
      // 1. Search filter
      if (searchQuery.trim()) {
        const lowerQuery = searchQuery.toLowerCase();
        const nameStr = category.name || "";
        if (!nameStr.toLowerCase().includes(lowerQuery)) return false;
      }

      // 2. Status filter
      if (filters.status !== "all") {
        const status = (category.status || "Unknown").toLowerCase();
        if (status !== filters.status.toLowerCase()) return false;
      }

      return true;
    });
  }, [categories, searchQuery, filters]);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 pb-4">
        <h2 className="text-3xl font-bold tracking-tight">Category List</h2>
        <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search categories..."
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
              <PopoverContent className="w-64 p-4" align="end">
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
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</label>
                      <Select value={filters.status} onValueChange={(val) => setFilters(f => ({ ...f, status: val }))}>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Inactive">Inactive</SelectItem>
                          <SelectItem value="Unknown">Unknown</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Button variant="outline" size="icon" onClick={loadCategories} title="Refresh">
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Link href="/categories/add">
                <Button className="bg-green-600 hover:bg-green-700 text-white dark:bg-green-700 dark:hover:bg-green-800">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Category
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

      {success && (
        <Alert className="mb-4 bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/40">
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64 border rounded-md">
           <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
           <span className="ml-2 text-muted-foreground">Loading categories...</span>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border rounded-md text-muted-foreground">
           <p>No categories found.</p>
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
          <DraggableDataTable 
            columns={columns} 
            data={filteredCategories} 
            onReorder={handleReorder}
            getRowId={(row) => row._id}
          />
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the category
              <span className="font-semibold text-foreground mx-1">&quot;{categoryToDelete?.name}&quot;</span>
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white dark:bg-red-700 dark:hover:bg-red-800"
            >
              Delete Category
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
