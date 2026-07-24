"use client";

import { useEffect, useState } from "react";
import { 
  Edit, 
  Trash2, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  ArrowUpDown,
  Loader2
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { Eye } from "lucide-react";

import { Badge } from "@/components/ui/badge";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { postService, Article } from "@/services/post-service";
import { languageService, Language } from "@/services/language-service";

export default function BreakingPostPage() {
  const router = useRouter();

  // --- State ---
  const [posts, setPosts] = useState<Article[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Table State
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Article; direction: 'asc' | 'desc' } | null>(null);

  // Update Dialog State
  const [updateId, setUpdateId] = useState<string | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);

  // Delete Dialog State
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // --- Initial Data Fetching ---
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [postsData, langsData] = await Promise.all([
          postService.getTrendingArticles(),
          languageService.getLanguages()
        ]);
        console.log("DEBUG: Trending Posts Data:", postsData);
        console.log("DEBUG: Languages Data:", langsData);
        setPosts(postsData);
        setLanguages(langsData);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- Handlers ---

  const confirmUpdate = (id: string) => {
    setUpdateId(id);
    setIsUpdateDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (updateId) {
      try {
        await postService.removeTrendingArticle(updateId);
        setPosts(prev => prev.filter(p => p._id !== updateId));
        setSuccessMessage("Post status changed to Untrending and removed from the trending section!");
        setIsUpdateDialogOpen(false);
        setUpdateId(null);
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (err) {
        console.error("Failed to update trending post:", err);
        alert("Failed to change trending status.");
      }
    }
  };

  const confirmDelete = (id: string) => {
    setDeleteId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await postService.deleteArticle(deleteId);
        setPosts(prev => prev.filter(p => p._id !== deleteId));
        setSuccessMessage("Post deleted successfully!");
        setIsDeleteDialogOpen(false);
        setDeleteId(null);
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (err) {
        console.error("Failed to delete post:", err);
        alert("Failed to delete post.");
      }
    }
  };

  // --- Table Logic ---
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getLanguageName = (lang: any) => {
    if (typeof lang === 'object' && lang && lang.name) return lang.name;
    if (typeof lang === 'string' && lang) {
      const found = languages.find(l => l._id === lang);
      return found ? found.name : lang;
    }
    return "N/A";
  };

  // Filtering
  const filteredPosts = posts.filter(post => {
    if (!post) return false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyPost = post as any;
    const langName = getLanguageName(post.language);
    const postContent = post.title || post.headline || anyPost.headLine || anyPost.title || anyPost.content || "";
    const search = searchQuery.toLowerCase();
    
    return String(postContent).toLowerCase().includes(search) ||
           String(langName).toLowerCase().includes(search);
  });

  // Sorting
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    
    let valA = a[key] || "";
    let valB = b[key] || "";

    // Handle nested language object for sorting
    if (key === 'language') {
      valA = getLanguageName(a.language);
      valB = getLanguageName(b.language);
    }

    if (valA < valB) return direction === 'asc' ? -1 : 1;
    if (valA > valB) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  const requestSort = (key: keyof Article) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Pagination
  const totalPages = Math.ceil(sortedPosts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPosts = sortedPosts.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Trending Post</h2>
      </div>

      {successMessage && (
        <Alert className="bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-900 dark:text-emerald-400">
           <AlertTitle>Success</AlertTitle>
           <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* --- Post List Table --- */}
      <Card className="dark:bg-sidebar dark:border-border">
         <CardHeader>
            <div className="flex items-center justify-between">
                <CardTitle>Trending Post List</CardTitle>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search..." 
                            className="pl-8 w-[200px] lg:w-[300px]" 
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                        />
                    </div>
                </div>
            </div>
        </CardHeader>
        <CardContent>
            <div className="rounded-md border bg-white dark:bg-sidebar dark:border-border">
                <Table>
                    <TableHeader className="bg-emerald-50 dark:bg-emerald-950/20">
                        <TableRow>
                            <TableHead className="w-[50px] font-bold text-emerald-900 dark:text-emerald-100">Sl</TableHead>
                            <TableHead className="font-bold text-emerald-900 dark:text-emerald-100 cursor-pointer" onClick={() => requestSort('title')}>
                                <div className="flex items-center gap-1">
                                    Trending Post
                                    <ArrowUpDown className="h-3 w-3" />
                                </div>
                            </TableHead>
                            <TableHead className="w-[180px] font-bold text-emerald-900 dark:text-emerald-100 cursor-pointer" onClick={() => requestSort('createdAt' as keyof Article)}>
                                <div className="flex items-center gap-1">
                                    Post Time
                                    <ArrowUpDown className="h-3 w-3" />
                                </div>
                            </TableHead>
                            <TableHead className="font-bold text-emerald-900 dark:text-emerald-100">Status</TableHead>
                            <TableHead className="w-[100px] font-bold text-emerald-900 dark:text-emerald-100 text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedPosts.length > 0 ? (
                            paginatedPosts.map((post, index) => (
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                <TableRow key={post._id || (post as any).id || index} className="hover:bg-muted/50 dark:hover:bg-muted/10">
                                    <TableCell>{startIndex + index + 1}</TableCell>
                                    <TableCell className="font-medium">
                                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                        {post.title || post.headline || (post as any).headLine || (post as any).content || "N/A"}
                                    </TableCell>
                                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                    <TableCell>{(post.createdAt || (post as any).time || (post as any).date) ? format(new Date(post.createdAt || (post as any).time || (post as any).date), "dd MMM yyyy, hh:mm a") : "N/A"}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="default"
                                            className="bg-emerald-500 hover:bg-emerald-600 cursor-pointer capitalize shadow-none transition-colors"
                                            onClick={() => confirmUpdate(post._id as string)}
                                        >
                                            Trending
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link href={`/post/view/${post._id}`}>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 rounded-md dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40"
                                                    title="View"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-md dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
                                                title="Delete"
                                                onClick={() => confirmDelete(post._id as string)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                             <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No results found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between space-x-2 py-4">
                <div className="text-sm text-muted-foreground">
                     Showing {paginatedPosts.length > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + itemsPerPage, sortedPosts.length)} of {sortedPosts.length} entries
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                    </Button>
                     <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                             <Button
                                key={page}
                                variant={currentPage === page ? "default" : "outline"}
                                size="sm"
                                className={currentPage === page ? "bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800" : "w-8"}
                                onClick={() => handlePageChange(page)}
                            >
                                {page}
                            </Button>
                        ))}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        Next
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </CardContent>
      </Card>

      {/* --- Remove from Trending Dialog --- */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Status to Untrending</DialogTitle>
            <DialogDescription>
              Are you sure you want to change this post&apos;s status from <span className="font-semibold text-emerald-600">Trending</span> to <span className="font-semibold text-orange-600">Untrending</span>? 
              <br/><br/>
              If it becomes Untrending, it will be automatically removed from this trending section.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
             <Button variant="ghost" onClick={() => setIsUpdateDialogOpen(false)}>Cancel</Button>
             <Button onClick={handleUpdate}>Confirm Untrending</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Post</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this post completely? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
