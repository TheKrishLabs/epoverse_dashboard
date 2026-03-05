
"use client";

import { useState } from "react";
import { 
  Edit, 
  Trash2, 
  Save, 
  RotateCcw, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  ArrowUpDown
} from "lucide-react";
import { format } from "date-fns";

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

// --- Types ---
interface BreakingPost {
  id: number;
  post: string;
  time: string; // ISO string
  language: string;
}

// --- Mock Data ---
const INITIAL_DATA: BreakingPost[] = [
  { id: 1, post: "Breaking News: Major blockchain update released today.", time: "2024-05-20T10:30:00", language: "English" },
  { id: 2, post: "Stock markets hit all-time high amidst global rally.", time: "2024-05-19T14:15:00", language: "English" },
  { id: 3, post: "New agricultural policies announced by the government.", time: "2024-05-18T09:00:00", language: "Hindi" },
  { id: 4, post: "Tech giant unveils latest AI model for public use.", time: "2024-05-17T16:45:00", language: "English" },
  { id: 5, post: "Local sports team wins championship after 20 years.", time: "2024-05-16T20:00:00", language: "Tamil" },
];

export default function BreakingPostPage() {
  // --- State ---
  const [posts, setPosts] = useState<BreakingPost[]>(INITIAL_DATA);
  const [formData, setFormData] = useState({ language: "English", post: "" });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [errors, setErrors] = useState<{ language?: string; post?: string }>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Table State
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState<{ key: keyof BreakingPost; direction: 'asc' | 'desc' } | null>(null);

  // Delete Dialog State
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);


  // --- Handlers ---

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined })); // Clear error on change
  };

  const validateForm = () => {
    const newErrors: { language?: string; post?: string } = {};
    if (!formData.language) newErrors.language = "Language is required.";
    if (!formData.post.trim()) newErrors.post = "Post content is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    if (editingId) {
      // Update existing
      setPosts(prev => prev.map(p => 
        p.id === editingId 
          ? { ...p, post: formData.post, language: formData.language, time: new Date().toISOString() } 
          : p
      ));
      setSuccessMessage("Trending post updated successfully!");
    } else {
      // Create new
      const newPost: BreakingPost = {
        id: Date.now(),
        post: formData.post,
        language: formData.language,
        time: new Date().toISOString(),
      };
      setPosts(prev => [newPost, ...prev]);
      setSuccessMessage("Trending post added successfully!");
    }

    // Reset form
    handleReset();
    
    // Clear success message after 3 seconds
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleReset = () => {
    setFormData({ language: "English", post: "" });
    setEditingId(null);
    setErrors({});
  };

  const handleEdit = (post: BreakingPost) => {
    setFormData({ language: post.language, post: post.post });
    setEditingId(post.id);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to form
  };

  const confirmDelete = (id: number) => {
    setDeleteId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (deleteId) {
      setPosts(prev => prev.filter(p => p.id !== deleteId));
      setSuccessMessage("Trending post deleted successfully!");
      setIsDeleteDialogOpen(false);
      setDeleteId(null);
       setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  // --- Table Logic ---

  // Filtering
  const filteredPosts = posts.filter(post => 
    post.post.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.language.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sorting
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
    if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  const requestSort = (key: keyof BreakingPost) => {
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

      {/* --- Section 1: Add/Edit Form --- */}
      <Card className="dark:bg-sidebar dark:border-border">
        <CardHeader>
          <CardTitle>{editingId ? "Edit Trending Post" : "Add Trending Post"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="language">Language <span className="text-red-500">*</span></Label>
              <Select 
                value={formData.language} 
                onValueChange={(val) => handleInputChange("language", val)}
              >
                <SelectTrigger id="language" className={cn(errors.language && "border-red-500 focus-visible:ring-red-500")}>
                  <SelectValue placeholder="Select Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Hindi">Hindi</SelectItem>
                  <SelectItem value="Tamil">Tamil</SelectItem>
                  <SelectItem value="Bengali">Bengali</SelectItem>
                </SelectContent>
              </Select>
               {errors.language && <span className="text-xs text-red-500">{errors.language}</span>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="post">Your Post <span className="text-red-500">*</span></Label>
              <Textarea 
                id="post" 
                placeholder="Enter Your Post" 
                className={cn("min-h-[100px]", errors.post && "border-red-500 focus-visible:ring-red-500")}
                value={formData.post}
                onChange={(e) => handleInputChange("post", e.target.value)}
              />
               {errors.post && <span className="text-xs text-red-500">{errors.post}</span>}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button 
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-700 text-white dark:bg-green-700 dark:hover:bg-green-800"
            >
              <Save className="mr-2 h-4 w-4" />
              {editingId ? "Update" : "Save"}
            </Button>
            <Button 
                variant="destructive" 
                onClick={handleReset}
                className="bg-red-500 hover:bg-red-600 text-white dark:bg-red-600 dark:hover:bg-red-700"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* --- Section 2: Post List Table --- */}
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
                            <TableHead className="font-bold text-emerald-900 dark:text-emerald-100 cursor-pointer" onClick={() => requestSort('post')}>
                                <div className="flex items-center gap-1">
                                    Trending Post
                                    <ArrowUpDown className="h-3 w-3" />
                                </div>
                            </TableHead>
                            <TableHead className="w-[180px] font-bold text-emerald-900 dark:text-emerald-100 cursor-pointer" onClick={() => requestSort('time')}>
                                <div className="flex items-center gap-1">
                                    Post Time
                                    <ArrowUpDown className="h-3 w-3" />
                                </div>
                            </TableHead>
                            <TableHead className="w-[120px] font-bold text-emerald-900 dark:text-emerald-100 cursor-pointer" onClick={() => requestSort('language')}>
                                 <div className="flex items-center gap-1">
                                    Language
                                    <ArrowUpDown className="h-3 w-3" />
                                </div>
                            </TableHead>
                            <TableHead className="w-[100px] font-bold text-emerald-900 dark:text-emerald-100 text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedPosts.length > 0 ? (
                            paginatedPosts.map((post, index) => (
                                <TableRow key={post.id} className="hover:bg-muted/50 dark:hover:bg-muted/10">
                                    <TableCell>{startIndex + index + 1}</TableCell>
                                    <TableCell className="font-medium">{post.post}</TableCell>
                                    <TableCell>{format(new Date(post.time), "dd MMM yyyy, hh:mm a")}</TableCell>
                                    <TableCell>{post.language}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button 
                                                size="icon" 
                                                variant="ghost" 
                                                className="h-8 w-8 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 rounded-md dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40"
                                                onClick={() => handleEdit(post)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button 
                                                size="icon" 
                                                variant="ghost" 
                                                className="h-8 w-8 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-md dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
                                                onClick={() => confirmDelete(post.id)}
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

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this Trending post? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
             <Button variant="ghost" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
             <Button variant="destructive" onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
