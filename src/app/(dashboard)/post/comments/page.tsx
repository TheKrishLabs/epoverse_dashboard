/* eslint-disable */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Check, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  X,
  Trash2
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { commentService, CommentData } from "@/services/comment-service";


export default function PostCommentsPage() {
  const [comments, setComments] = useState<CommentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadComments = async () => {
    setIsLoading(true);
    try {
      const data = await commentService.fetchComments();
      setComments(data);
    } catch (error) {
      setErrorMessage("Failed to load comments.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, []);

  // Filter Logic
  const filteredComments = comments.filter(comment => {
    const searchLower = searchQuery.toLowerCase();
    return (
      (comment.userName || "").toLowerCase().includes(searchLower) ||
      (comment.userEmail || "").toLowerCase().includes(searchLower) ||
      (comment.comment || comment.message || "").toLowerCase().includes(searchLower) ||
      (comment.postTitle || "").toLowerCase().includes(searchLower)
    );
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredComments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedComments = filteredComments.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Actions
  const handleApprove = async (id: string) => {
    try {
      await commentService.unreportComment(id);
      setComments(prev => prev.map(c => 
        (c._id === id || c.id === id) ? { ...c, status: "Approved", isReported: false } : c
      ));
      setSuccessMessage("Comment approved successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      setErrorMessage("Failed to approve comment.");
      setTimeout(() => setErrorMessage(null), 3000);
    }
  };

  const confirmDelete = (id: string) => {
    setDeleteId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await commentService.deleteCommentAdmin(deleteId);
        setComments(prev => prev.filter(c => c._id !== deleteId && c.id !== deleteId));
        setSuccessMessage("Comment deleted successfully!");
        setIsDeleteDialogOpen(false);
        setDeleteId(null);
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (error) {
        setErrorMessage("Failed to delete comment.");
        setIsDeleteDialogOpen(false);
        setDeleteId(null);
        setTimeout(() => setErrorMessage(null), 3000);
      }
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Comments list</h2>
      </div>

      <div className="flex items-center justify-between py-4">
         <div className="flex items-center gap-2">
         </div>
         <div className="relative w-full max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
                placeholder="Search..." 
                className="pl-8"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            />
        </div>
      </div>

      {successMessage && (
        <Alert className="bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-900 dark:text-emerald-400 mb-4 flex items-center justify-between">
           <div>
               <AlertTitle>Success</AlertTitle>
               <AlertDescription>{successMessage}</AlertDescription>
           </div>
           <Button variant="ghost" size="sm" onClick={() => setSuccessMessage(null)} className="h-6 w-6 p-0 hover:bg-emerald-100 dark:hover:bg-emerald-800">
               <X className="h-4 w-4" />
           </Button>
        </Alert>
      )}

      {errorMessage && (
        <Alert variant="destructive" className="mb-4 flex items-center justify-between">
           <div>
               <AlertTitle>Error</AlertTitle>
               <AlertDescription>{errorMessage}</AlertDescription>
           </div>
           <Button variant="ghost" size="sm" onClick={() => setErrorMessage(null)} className="h-6 w-6 p-0">
               <X className="h-4 w-4" />
           </Button>
        </Alert>
      )}

      <Card className="dark:bg-sidebar dark:border-border">
        <CardContent className="p-0">
             <div className="rounded-md border bg-white dark:bg-sidebar dark:border-border">
                <Table>
                    <TableHeader className="bg-gray-100 dark:bg-muted/20">
                        <TableRow>
                            <TableHead className="w-[50px] font-bold">Sl</TableHead>
                            <TableHead className="font-bold">User</TableHead>
                            <TableHead className="font-bold">Comments</TableHead>
                            <TableHead className="font-bold">Post</TableHead>
                            <TableHead className="font-bold w-[100px]">Status</TableHead>
                            <TableHead className="font-bold w-[100px] text-center">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    Loading comments...
                                </TableCell>
                            </TableRow>
                        ) : paginatedComments.length > 0 ? (
                            paginatedComments.map((comment, index) => {
                                const id = comment._id || comment.id || index.toString();
                                const isPending = comment.status === "Pending" || comment.isReported;
                                
                                return (
                                <TableRow key={id} className="hover:bg-muted/50 dark:hover:bg-muted/10">
                                    <TableCell>{startIndex + index + 1}</TableCell>
                                    <TableCell>
                                        <div className="font-medium">{comment.userName || "Unknown"}</div>
                                        <div className="text-sm text-muted-foreground">{comment.userEmail || "No email"}</div>
                                    </TableCell>
                                    <TableCell className="max-w-[200px] truncate" title={comment.comment || comment.message}>
                                        {comment.comment || comment.message}
                                    </TableCell>
                                    <TableCell className="max-w-[250px] truncate">
                                        {comment.postTitle ? (
                                            <Link href={"#"} className="text-blue-600 hover:underline dark:text-blue-400">
                                                {comment.postTitle}
                                            </Link>
                                        ) : (
                                            <span className="text-muted-foreground">N/A</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge 
                                            className={!isPending
                                                ? "bg-green-600 hover:bg-green-700" 
                                                : "bg-amber-400 hover:bg-amber-500 text-black"
                                            }
                                        >
                                            {!isPending ? "Approved" : "Pending"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex justify-center gap-2">
                                            {isPending && (
                                                 <Button 
                                                    size="icon" 
                                                    className="h-8 w-8 bg-green-600 hover:bg-green-700 text-white rounded-md"
                                                    onClick={() => handleApprove(id)}
                                                    title="Approve"
                                                >
                                                    <Check className="h-4 w-4" />
                                                </Button>
                                            )}

                                            <Button 
                                                size="icon" 
                                                className="h-8 w-8 bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700 rounded-md dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
                                                onClick={() => confirmDelete(id)}
                                                title="Delete"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                                )
                            })
                        ) : (
                             <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No comments found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
             </div>

             {/* Pagination Controls */}
            <div className="flex items-center justify-between space-x-2 py-4 px-4">
                <div className="text-sm text-muted-foreground">
                     Showing {paginatedComments.length > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + itemsPerPage, filteredComments.length)} of {filteredComments.length} entries
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
                        disabled={currentPage === totalPages || totalPages === 0}
                    >
                        Next
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </CardContent>
      </Card>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this comment? This action cannot be undone.
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


