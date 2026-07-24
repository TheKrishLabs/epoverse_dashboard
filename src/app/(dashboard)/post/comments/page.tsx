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
  Trash2,
  Eye,
  Pencil
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
import { postService } from "@/services/post-service";


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

  // Toggle state
  const [toggleId, setToggleId] = useState<string | null>(null);
  const [isToggleReported, setIsToggleReported] = useState<boolean>(false);
  const [isToggleDialogOpen, setIsToggleDialogOpen] = useState(false);

  // View & Edit Modals
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedComment, setSelectedComment] = useState<CommentData | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editStatus, setEditStatus] = useState<string>("Pending");

  const loadComments = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch all comments
      const data = await commentService.fetchComments();

      console.log("RAW COMMENTS FROM BACKEND:", data); // Check your browser console!
      const commentsWithTitles = await Promise.all(data.map(async (comment) => {
        const articleIdRaw = comment.articleId || comment.article || comment.post || comment.postId;
        const articleIdStr = typeof articleIdRaw === 'object' ? (articleIdRaw._id || articleIdRaw.id) : articleIdRaw;

        let title = comment.postTitle || comment.articleId?.title || comment.articleId?.headline || comment.article?.title || comment.article?.headline || comment.post?.title || comment.post?.headline;

        // If title is missing but we have an ID, we try to fetch the article
        if (!title && articleIdStr && typeof articleIdStr === 'string') {
          try {
            // Try to fetch the article by ID
            const article = await postService.getArticleById(articleIdStr);
            if (article) {
              title = article.headline || article.title;
            } else {
              // If fetching article failed, maybe it's a post instead of an article
              const post = await postService.getPostById(articleIdStr);
              if (post) {
                title = post.title;
              }

            }
          } catch (e) {
            console.error("Could not fetch article/post for comment:", articleIdStr);
          }
        }

        if (title) {
          return { ...comment, postTitle: title };
        }
        return comment;
      }));

      setComments(commentsWithTitles);
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

    // Extract possible values
    const userName = comment.userName || comment.user?.name || comment.user?.username || comment.author?.name || "";
    const userEmail = comment.userEmail || comment.user?.email || comment.author?.email || "";
    const commentText = comment.content || comment.comment || comment.message || "";
    const postTitle = comment.postTitle || "";

    return (
      userName.toLowerCase().includes(searchLower) ||
      userEmail.toLowerCase().includes(searchLower) ||
      commentText.toLowerCase().includes(searchLower) ||
      postTitle.toLowerCase().includes(searchLower)
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
  const confirmToggle = (id: string, currentIsReported: boolean) => {
    setToggleId(id);
    setIsToggleReported(currentIsReported);
    setIsToggleDialogOpen(true);
  };

  const handleToggle = async () => {
    if (toggleId) {
      try {
        if (isToggleReported) {
          // If true, user clicked "Unreport" to unreport it
          await commentService.unreportComment(toggleId);
          setComments(prev => prev.map(c =>
            (c._id === toggleId || c.id === toggleId) ? { ...c, isReported: false } : c
          ));
          setSuccessMessage("Comment unreported successfully!");
        } else {
          // If false, user clicked "Report" to report it
          await commentService.reReportComment(toggleId);
          setComments(prev => prev.map(c =>
            (c._id === toggleId || c.id === toggleId) ? { ...c, isReported: true } : c
          ));
          setSuccessMessage("Comment reported successfully!");
        }
      } catch (error: any) {
        const errMsg = error.response?.data?.message || error.message || "Unknown error";
        setErrorMessage(isToggleReported ? `Failed to unreport comment: ${errMsg}` : `Failed to report comment: ${errMsg}`);
      }
      setIsToggleDialogOpen(false);
      setToggleId(null);
      setTimeout(() => setSuccessMessage(null), 3000);
      setTimeout(() => setErrorMessage(null), 3000);
    }
  };

  const openViewModal = async (comment: CommentData) => {
    setSelectedComment(comment);
    setIsViewModalOpen(true);
    
    // Fetch full comment data
    try {
      const id = comment._id || comment.id;
      if (id) {
        const fullComment = await commentService.getCommentById(id);
        if (fullComment) {
          setSelectedComment({ ...comment, ...fullComment });
        }
      }
    } catch (error) {
      console.error("Failed to fetch full comment details:", error);
    }
  };

  const handleEdit = (comment: CommentData) => {
    setSelectedComment(comment);
    const isPending = comment.status === "Pending" || comment.isReported;
    setEditStatus(isPending ? "Pending" : "Approved");
    setIsEditModalOpen(true);
  };

  const submitEdit = async () => {
    if (!selectedComment) return;
    const id = selectedComment._id || selectedComment.id;
    if (!id) return;

    try {
      if (editStatus === "Approved") {
        await commentService.unreportComment(id);

        setComments(prev => prev.map(c =>
          (c._id === id || c.id === id) ? {
            ...c,
            status: "Approved",
            isReported: false
          } : c
        ));

        setSuccessMessage(`Comment approved successfully!`);
        setIsEditModalOpen(false);
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setErrorMessage("Backend API does not support reverting comments back to Pending.");
        setIsEditModalOpen(false);
        setTimeout(() => setErrorMessage(null), 5000);
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || "Unknown error";
      setErrorMessage(`Failed to update comment status: ${msg}`);
      setTimeout(() => setErrorMessage(null), 5000);
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
                    const isReported = comment.isReported || (comment as any).isReport;

                    return (
                      <TableRow key={id} className="hover:bg-muted/50 dark:hover:bg-muted/10">
                        <TableCell>{startIndex + index + 1}</TableCell>
                        <TableCell>
                          <div className="font-medium">{comment.userName || comment.user?.fullName || comment.user?.name || comment.author?.name || "Unknown"}</div>
                          <div className="text-sm text-muted-foreground">{comment.userEmail || comment.user?.email || comment.author?.email || "No email"}</div>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate" title={comment.comment || comment.message || comment.content || comment.text || JSON.stringify(comment)}>
                          {comment.comment || comment.message || comment.content || comment.text || "No content"}
                        </TableCell>
                        <TableCell className="max-w-[250px] truncate">
                          {(() => {
                            const postId = comment.articleId?._id || comment.articleId?.id || comment.articleId || comment.post?._id || comment.post?.id || comment.postId || comment.article?._id || comment.article?.id;
                            const postTitle = comment.postTitle || comment.articleId?.headline || comment.articleId?.title || comment.article?.headline || comment.article?.title || comment.post?.headline || comment.post?.title;

                            if (postTitle) {
                              return (
                                <Link
                                  href={postId ? `/post/view/${typeof postId === 'object' ? postId._id || postId.id : postId}` : "#"}
                                  className="text-blue-600 hover:underline dark:text-blue-400 font-medium"
                                  title={postTitle}
                                >
                                  {postTitle}
                                </Link>
                              );
                            }
                            return (
                              <div className="text-muted-foreground text-xs">
                                N/A <br />
                                <span className="opacity-50 text-[10px] break-all">{JSON.stringify(comment).substring(0, 150)}</span>
                              </div>
                            );
                          })()}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            className={`h-8 font-medium w-full ${isReported ? "bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-300" : "bg-green-100 text-green-700 hover:bg-green-200 border-green-300"}`}
                            onClick={() => confirmToggle(id, isReported)}
                          >
                            {isReported ? "Unreport" : "Report"}
                          </Button>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-600 hover:text-blue-800 p-0 h-8 w-8"
                              onClick={() => openViewModal(comment)}
                              title="View"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>

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

      {/* Delete Confirmation Modal */}
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

      {/* Confirmation Dialog for Toggle */}
      <Dialog open={isToggleDialogOpen} onOpenChange={setIsToggleDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm {isToggleReported ? 'Report' : 'Unreport'}</DialogTitle>
            <DialogDescription>
              Are you sure you want to {isToggleReported ? 'report' : 'unreport'} this comment?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsToggleDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="default" onClick={handleToggle}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Comment Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>View Comment</DialogTitle>
          </DialogHeader>
          {selectedComment && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-4 gap-2 items-center">
                <span className="font-semibold text-sm text-right">User:</span>
                <span className="col-span-3 text-sm">{selectedComment.userName || selectedComment.user?.fullName || selectedComment.user?.name || selectedComment.author?.name || "Unknown"} ({selectedComment.userEmail || selectedComment.user?.email || selectedComment.author?.email || "No email"})</span>
              </div>
              <div className="grid grid-cols-4 gap-2 items-center">
                <span className="font-semibold text-sm text-right">Post:</span>
                <span className="col-span-3 text-sm">{selectedComment.postTitle || selectedComment.articleId?.title || selectedComment.article?.title || selectedComment.articleId?._id || selectedComment.articleId || "N/A"}</span>
              </div>
              <div className="grid grid-cols-4 gap-2 items-center">
                <span className="font-semibold text-sm text-right">Status:</span>
                <span className="col-span-3">
                  <Badge
                    className={(selectedComment.status !== "Approved" || selectedComment.isReported) ? "bg-amber-400 text-black" : "bg-green-600"}
                  >
                    {(selectedComment.status !== "Approved" || selectedComment.isReported) ? "Pending" : "Approved"}
                  </Badge>
                </span>
              </div>
              <hr className="my-2 border-muted" />
              <div>
                <span className="font-semibold text-sm block mb-2">Comment Message:</span>
                <p className="text-sm bg-muted p-3 rounded-md min-h-[60px] whitespace-pre-wrap">
                  {selectedComment.comment || selectedComment.message || selectedComment.content || selectedComment.text || "No content"}
                </p>
              </div>
              {(selectedComment.reportedReason || selectedComment.reportedMessages) && (
                <div>
                  <span className="font-semibold text-sm block mb-2 text-red-600">Reported Details:</span>
                  <p className="text-sm bg-red-50 text-red-800 p-3 rounded-md">
                    {selectedComment.reportedReason && <strong>Reason: </strong>} {selectedComment.reportedReason}
                    {selectedComment.reportedReason && selectedComment.reportedMessages && <br/>}
                    {selectedComment.reportedMessages && <strong>Message: </strong>} {selectedComment.reportedMessages}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Status Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Comment Status</DialogTitle>
            <DialogDescription>
              Change the moderation status of this comment.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                disabled={selectedComment?.status === "Approved" && !selectedComment?.isReported}
              >
                <option value="Approved">Approved</option>
                {(!selectedComment || (selectedComment.status !== "Approved" || selectedComment.isReported)) && (
                  <option value="Pending">Pending</option>
                )}
              </select>
            </div>
            <p className="text-xs text-muted-foreground">
              {selectedComment?.status === "Approved" && !selectedComment?.isReported
                ? "This comment is already approved. The backend does not support reverting an approved comment to pending."
                : "Changing to 'Approved' will make the comment visible to the public."}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button onClick={submitEdit} className="bg-blue-600 hover:bg-blue-700 text-white">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );


}
