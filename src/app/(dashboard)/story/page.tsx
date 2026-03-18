
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Eye, 
  Edit, 
  Trash2, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  ArrowUpDown,
  Search,
  FileSpreadsheet,
  FileText,
  RefreshCw
} from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { storyService, StoryData, StoryItem } from "@/services/story-service";

export default function StoryManagePage() {
  // --- State ---
  const [stories, setStories] = useState<StoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Table State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState<{ key: keyof StoryData; direction: 'asc' | 'desc' } | null>(null);

  // Delete Dialog State
  const [deleteId, setDeleteId] = useState<string | number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // View Items Modal State
  const [viewItems, setViewItems] = useState<StoryItem[]>([]);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewStoryTitle, setViewStoryTitle] = useState("");

  // Edit Item Modal State
  const [editItem, setEditItem] = useState<StoryItem | null>(null);
  const [isEditItemOpen, setIsEditItemOpen] = useState(false);
  const [isSavingItem, setIsSavingItem] = useState(false);

  // --- Effects ---
  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
        const data = await storyService.getStories();
        setStories(data);
    } catch (error) {
        console.error("Failed to load stories", error);
        setErrorMessage("Failed to load stories from the server. Please try again.");
    } finally {
        setLoading(false);
    }
  };

  // --- Handlers ---

  const confirmDelete = (id: string | number) => {
    setDeleteId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (deleteId) {
      try {
          await storyService.deleteStory(deleteId);
          setStories(prev => prev.filter(s => s.id !== deleteId));
          setSuccessMessage("Story deleted successfully!");
          setIsDeleteDialogOpen(false);
          setDeleteId(null);
          setTimeout(() => setSuccessMessage(null), 3000);
      } catch (error) {
          console.error("Failed to delete story", error);
      }
    }
  };

  const handleViewItems = async (story: StoryData) => {
    setViewStoryTitle(story.title);
    setIsViewOpen(true);
    setViewLoading(true);
    setViewItems([]); // Clear previous items
    try {
        const items = await storyService.getStoryItems(story.id);
        setViewItems(items);
    } catch (error) {
        console.error("Failed to fetch story items", error);
        setErrorMessage("Failed to load story items.");
    } finally {
        setViewLoading(false);
    }
  };

  const handleEditItem = (item: StoryItem) => {
    setEditItem({ ...item });
    setIsEditItemOpen(true);
  };

  const handleSaveItem = async () => {
    if (!editItem) return;
    setIsSavingItem(true);
    try {
        const updated = await storyService.updateStoryItem(editItem._id, {
            title: editItem.title,
            buttonText: editItem.buttonText,
            buttonLink: editItem.buttonLink,
        });
        
        // Update local items list
        setViewItems(prev => prev.map(item => item._id === updated._id ? updated : item));
        setSuccessMessage("Story item updated successfully!");
        setIsEditItemOpen(false);
        setEditItem(null);
        setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
        console.error("Failed to update story item", error);
        setErrorMessage("Failed to update story item. Please try again.");
    } finally {
        setIsSavingItem(false);
    }
  };

  const downloadCSV = () => {
    const headers = ["ID", "Title", "Views", "Date", "Language"];
    const rows = stories.map(story => [
      story.id,
      `"${story.title.replace(/"/g, '""')}"`,
      story.views,
      story.date,
      story.language
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "stories.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadExcel = () => {
    const tableContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Stories</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
      </head>
      <body>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Views</th>
              <th>Date</th>
              <th>Language</th>
            </tr>
          </thead>
          <tbody>
            ${stories.map(story => `
              <tr>
                <td>${story.id}</td>
                <td>${story.title}</td>
                <td>${story.views}</td>
                <td>${story.date}</td>
                <td>${story.language}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([tableContent], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "stories.xls");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Table Logic ---

  // Filtering
  const filteredStories = stories.filter(story => 
    story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    story.language.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sorting
  const sortedStories = [...filteredStories].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    // Handle potential string comparison or number comparison
    const valA = a[key as keyof StoryData];
    const valB = b[key as keyof StoryData];

    if (valA === undefined || valB === undefined) return 0;

    if (valA < valB) return direction === 'asc' ? -1 : 1;
    if (valA > valB) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  const requestSort = (key: keyof StoryData) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Pagination
  const totalPages = Math.ceil(sortedStories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStories = sortedStories.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      {/* --- Header --- */}
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Story</h2>
        <Link href="/story/create">
            <Button className="bg-green-600 hover:bg-green-700 text-white dark:bg-green-700 dark:hover:bg-green-800">
            <Plus className="mr-2 h-4 w-4" />
            New Story
            </Button>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 py-4">
        <div className="flex items-center gap-2">
            <Button 
                variant="outline" 
                onClick={downloadCSV}
                className="h-9 text-green-600 border-green-200 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900 dark:hover:bg-green-900/40"
            >
                <FileSpreadsheet className="mr-2 h-4 w-4" /> CSV
            </Button>
            <Button 
                variant="outline" 
                onClick={downloadExcel}
                className="h-9 text-green-600 border-green-200 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900 dark:hover:bg-green-900/40"
            >
                <FileText className="mr-2 h-4 w-4" /> Excel
            </Button>
             <Button variant="ghost" size="icon" onClick={loadStories} title="Refresh">
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
        </div>
        <div className="flex items-center justify-end space-x-2">
        <div className="relative w-full max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
                placeholder="Search stories..." 
                className="pl-8"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            />
        </div>
      </div>
      </div>

      {successMessage && (
        <Alert className="bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-900 dark:text-emerald-400">
           <AlertTitle>Success</AlertTitle>
           <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {errorMessage && (
        <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-900 dark:text-red-400 mt-2">
           <AlertTitle>Error</AlertTitle>
           <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* --- Story List Table --- */}
      <Card className="dark:bg-sidebar dark:border-border">
        <CardContent className="p-0">
            <div className="rounded-md border bg-white dark:bg-sidebar dark:border-border">
                <Table>
                    <TableHeader className="bg-gray-100 dark:bg-muted/20">
                        <TableRow>
                            <TableHead className="w-[50px] font-bold">Sl</TableHead>
                            <TableHead className="font-bold cursor-pointer" onClick={() => requestSort('title')}>
                                <div className="flex items-center gap-1">
                                    Story Title
                                    <ArrowUpDown className="h-3 w-3" />
                                </div>
                            </TableHead>
                            <TableHead className="w-[150px] font-bold cursor-pointer" onClick={() => requestSort('views')}>
                                <div className="flex items-center gap-1">
                                    Views / Hit Count
                                    <ArrowUpDown className="h-3 w-3" />
                                </div>
                            </TableHead>
                             <TableHead className="w-[180px] font-bold cursor-pointer" onClick={() => requestSort('date')}>
                                <div className="flex items-center gap-1">
                                    Date & Time
                                    <ArrowUpDown className="h-3 w-3" />
                                </div>
                            </TableHead>
                            <TableHead className="w-[120px] font-bold cursor-pointer" onClick={() => requestSort('language')}>
                                 <div className="flex items-center gap-1">
                                    Language
                                    <ArrowUpDown className="h-3 w-3" />
                                </div>
                            </TableHead>
                            <TableHead className="w-[140px] font-bold text-center">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                             <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    Loading stories...
                                </TableCell>
                            </TableRow>
                        ) : paginatedStories.length > 0 ? (
                            paginatedStories.map((story, index) => (
                                <TableRow key={story.id} className="hover:bg-muted/50 dark:hover:bg-muted/10">
                                    <TableCell>{startIndex + index + 1}</TableCell>
                                    <TableCell className="font-medium truncate max-w-[300px]" title={story.title}>{story.title}</TableCell>
                                    <TableCell>{story.views.toLocaleString()}</TableCell>
                                    <TableCell>{format(new Date(story.date), "dd MMM yyyy, hh:mm a")}</TableCell>
                                    <TableCell>{story.language}</TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex justify-center gap-2">
                                            <Button 
                                                size="icon" 
                                                variant="ghost" 
                                                className="h-8 w-8 bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 rounded-md dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/40"
                                                onClick={() => handleViewItems(story)}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Link href={`/story/edit/${story.id}`}>
                                                <Button 
                                                    size="icon" 
                                                    variant="ghost" 
                                                    className="h-8 w-8 bg-amber-50 text-amber-600 hover:bg-amber-100 hover:text-amber-700 rounded-md dark:bg-amber-900/20 dark:text-amber-400 dark:hover:bg-amber-900/40"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Button 
                                                size="icon" 
                                                variant="ghost" 
                                                className="h-8 w-8 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-md dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
                                                onClick={() => confirmDelete(story.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                             <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No stories found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between space-x-2 py-4 px-4">
                <div className="text-sm text-muted-foreground">
                     Showing {paginatedStories.length > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + itemsPerPage, sortedStories.length)} of {sortedStories.length} entries
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1 || loading}
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
                                disabled={loading}
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
                        disabled={currentPage === totalPages || loading}
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
              Are you sure you want to delete this story? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
             <Button variant="ghost" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
             <Button variant="destructive" onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Items Modal */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-green-600" />
              Story Items: {viewStoryTitle}
            </DialogTitle>
            <DialogDescription>
              View all slides and content associated with this story.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto pr-2 mt-4">
            {viewLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <RefreshCw className="h-8 w-8 animate-spin mb-2" />
                    <p>Fetching story items...</p>
                </div>
            ) : viewItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {viewItems.map((item, idx) => (
                        <Card key={item._id || idx} className="overflow-hidden border-muted/60 hover:border-green-200 transition-colors">
                            <div className="aspect-[16/9] relative bg-muted group">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img 
                                    src={item.storyImage || item.image || "/placeholder.svg"} 
                                    alt={item.title}
                                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                />
                                <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full">
                                    Slide {idx + 1}
                                </div>
                                {item.viewCount !== undefined && (
                                    <div className="absolute top-2 right-2 bg-green-600/80 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                                        <Eye className="h-3 w-3" />
                                        {item.viewCount} views
                                    </div>
                                )}
                                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                     <Button 
                                        size="icon" 
                                        variant="secondary" 
                                        className="h-7 w-7 bg-white/90 hover:bg-white text-amber-600 shadow-sm"
                                        onClick={() => handleEditItem(item)}
                                    >
                                        <Edit className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </div>
                            <CardContent className="p-3">
                                <h4 className="font-semibold text-sm line-clamp-1 mb-1" title={item.title}>
                                    {item.title}
                                </h4>
                                <div className="space-y-1 text-xs text-muted-foreground">
                                    {item.language && (
                                        <p className="flex justify-between border-b border-muted py-1">
                                            <span>Language:</span>
                                            <span className="text-foreground font-medium">{item.language}</span>
                                        </p>
                                    )}
                                    {item.buttonText && (
                                        <p className="flex justify-between border-b border-muted py-1">
                                            <span>Btn Text:</span>
                                            <span className="text-foreground font-medium">{item.buttonText}</span>
                                        </p>
                                    )}
                                    {item.buttonLink && (
                                        <p className="flex items-start flex-col py-1">
                                            <span>Btn Link:</span>
                                            <span className="text-blue-600 break-all font-medium mt-0.5">{item.buttonLink}</span>
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <p>No items found for this story.</p>
                </div>
            )}
          </div>

          <DialogFooter className="mt-4 pt-4 border-t">
             <Button variant="outline" onClick={() => setIsViewOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Story Item Modal */}
      <Dialog open={isEditItemOpen} onOpenChange={setIsEditItemOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-amber-600" />
              Edit Story Item
            </DialogTitle>
            <DialogDescription>
                Update the title and button details for this slide.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
             <div className="space-y-2">
                <Label htmlFor="item-title">Title</Label>
                <Input 
                    id="item-title" 
                    value={editItem?.title || ""} 
                    onChange={(e) => setEditItem(prev => prev ? { ...prev, title: e.target.value } : null)}
                />
             </div>
             <div className="space-y-2">
                <Label htmlFor="item-btn-text">Button Text</Label>
                <Input 
                    id="item-btn-text" 
                    value={editItem?.buttonText || ""} 
                    onChange={(e) => setEditItem(prev => prev ? { ...prev, buttonText: e.target.value } : null)}
                />
             </div>
             <div className="space-y-2">
                <Label htmlFor="item-btn-link">Button Link</Label>
                <Input 
                    id="item-btn-link" 
                    value={editItem?.buttonLink || ""} 
                    onChange={(e) => setEditItem(prev => prev ? { ...prev, buttonLink: e.target.value } : null)}
                />
             </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 mt-2">
             <Button variant="ghost" onClick={() => setIsEditItemOpen(false)} disabled={isSavingItem}>Cancel</Button>
             <Button 
                className="bg-green-600 hover:bg-green-700 text-white" 
                onClick={handleSaveItem}
                disabled={isSavingItem}
             >
                {isSavingItem ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
                {isSavingItem ? "Saving..." : "Save Changes"}
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
