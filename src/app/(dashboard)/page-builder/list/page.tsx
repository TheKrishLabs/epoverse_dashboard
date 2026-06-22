"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Filter, Loader2, Plus, RefreshCw, Search, X } from "lucide-react";
import Link from "next/link";
import { columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { pageService, PageData } from "@/services/page-service";
import { languageService, Language } from "@/services/language-service";
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

export default function PageListPage() {
  const [pages, setPages] = useState<PageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // --- Filter options ---
  const [languages, setLanguages] = useState<Language[]>([]);

  // --- Filter state ---
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    languageId: "all",
    status: "all",
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [pagesData, langsData] = await Promise.all([
         pageService.getPages(),
         languageService.getLanguages()
      ]);
      
      setLanguages(langsData || []);

      // Map the language IDs to language names for the table
      const mappedPages = pagesData.map(page => {
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
         const langObj: any = page.language;
         const langId = typeof langObj === 'object' && langObj ? langObj._id : langObj;
         const langNameFallback = typeof langObj === 'object' && langObj ? langObj.name : null;

         // eslint-disable-next-line @typescript-eslint/no-explicit-any
         const langMatch = langsData.find((l: any) => l._id === langId || l.name === langId);
         return {
             ...page,
             languageName: langMatch ? langMatch.name : (langNameFallback || langId || "Unknown Language")
         };
      });
      
      setPages(mappedPages);
    } catch (err) {
      console.error("Failed to load pages data", err);
      setError("Failed to load pages. Please check your connection.");
      setPages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const clearFilters = () => {
    setFilters({
      languageId: "all",
      status: "all",
    });
    setSearchQuery("");
  };

  const activeFiltersCount = [
    filters.languageId !== "all",
    filters.status !== "all",
  ].filter(Boolean).length;

  const filteredPages = useMemo(() => {
    return pages.filter((page) => {
      // 1. Search filter
      if (searchQuery.trim()) {
        const lowerQuery = searchQuery.toLowerCase();
        if (!page.title.toLowerCase().includes(lowerQuery)) return false;
      }

      // 2. Language filter
      if (filters.languageId !== "all") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const langObj: any = page.language;
        const langId = typeof langObj === 'object' && langObj ? langObj._id : langObj;
        if (langId !== filters.languageId) return false;
      }

      // 3. Status filter
      if (filters.status !== "all") {
        const status = (page.status || "Draft").toLowerCase();
        if (status !== filters.status.toLowerCase()) return false;
      }

      return true;
    });
  }, [pages, searchQuery, filters]);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 pb-4">
        <h2 className="text-3xl font-bold tracking-tight">Page List</h2>
        <div className="flex flex-wrap items-center gap-2">
          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search pages by title..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filter Popover */}
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
                        <SelectItem value="Published">Published</SelectItem>
                        <SelectItem value="Draft">Draft</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Button variant="ghost" size="icon" onClick={loadData} title="Refresh">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Link href="/page-builder/add">
            <Button className="bg-green-600 hover:bg-green-700 text-white dark:bg-green-700 dark:hover:bg-green-800">
              <Plus className="mr-2 h-4 w-4" />
              Add New Page
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
            <span className="ml-2 text-muted-foreground">Loading pages...</span>
        </div>
      ) : filteredPages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border rounded-md text-muted-foreground">
           <p>No pages found.</p>
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
          <DataTable columns={columns(loadData)} data={filteredPages} />
        </div>
      )}
    </div>
  );
}
