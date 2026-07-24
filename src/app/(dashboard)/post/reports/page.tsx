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
  AlertTriangle,
  Pencil,
  Eye
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
import { reportService, ReportData } from "@/services/report-service";
import { postService } from "@/services/post-service";

export default function ArticleReportsPage() {
  const [reports, setReports] = useState<ReportData[]>([]);
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

  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const loadReports = async () => {
    setIsLoading(true);
    try {
      const data = await reportService.fetchReports();

      const reportsWithTitles = [];
      for (const report of data) {
        let updatedReport = { ...report };
        
        // Fetch full report to ensure we have the description field for the table column
        const reportId = report._id || report.id;
        if (reportId) {
          try {
            const fullReport = await reportService.getReportById(reportId);
            if (fullReport) {
              updatedReport = { ...updatedReport, ...fullReport };
            }
          } catch (e) {
            console.error("Failed to fetch full report for id:", reportId);
          }
        }

        let title = updatedReport.article?.title || updatedReport.article?.headline || updatedReport.article?.name;

        const articleIdRaw = updatedReport.article;
        const articleIdStr = typeof articleIdRaw === 'object' ? (articleIdRaw._id || articleIdRaw.id) : articleIdRaw;

        if (!title && articleIdStr && typeof articleIdStr === 'string') {
          try {
            const { postService } = await import("@/services/post-service");
            const article = await postService.getArticleById(articleIdStr);
            if (article) {
              title = article.headline || article.title;
            } else {
              const post = await postService.getPostById(articleIdStr);
              if (post) {
                title = post.title;
              }
            }
          } catch (e) {
            console.error("Failed to fetch article for report:", articleIdStr);
          }
        }

        if (title) {
          (updatedReport as any).articleTitle = title;
        }
        reportsWithTitles.push(updatedReport);
      }

      setReports(reportsWithTitles);
    } catch (error) {
      setErrorMessage("Failed to load article reports.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  // Filter Logic
  const filteredReports = reports.filter(report => {
    const searchLower = searchQuery.toLowerCase();
    const articleTitle = (report as any).articleTitle || report.article?.title || report.article?.name || "";
    const desc = report.description || (report as any).message || (report as any).details || (report as any).text || (report as any).reportedMessages || "";
    return (
      (report.reason || "").toLowerCase().includes(searchLower) ||
      desc.toLowerCase().includes(searchLower) ||
      articleTitle.toLowerCase().includes(searchLower)
    );
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReports = filteredReports.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const confirmToggle = (id: string, currentIsReported: boolean) => {
    setToggleId(id);
    setIsToggleReported(currentIsReported);
    setIsToggleDialogOpen(true);
  };

  const handleToggle = async () => {
    if (toggleId) {
      try {
        const report = reports.find(r => r._id === toggleId || (r as any).id === toggleId);
        
        if (isToggleReported) {
          // If true, user clicked "Unreport" to unreport it
          await reportService.unreportArticle(toggleId);
          setReports(prev => prev.map(r => {
            if (r._id === toggleId || (r as any).id === toggleId) {
              return {
                ...r,
                article: {
                  ...(r.article || {}),
                  isReported: false
                }
              };
            }
            return r;
          }));
          
          if (selectedReport && (selectedReport._id === toggleId || (selectedReport as any).id === toggleId)) {
            setSelectedReport({
              ...selectedReport,
              article: {
                ...(selectedReport.article || {}),
                isReported: false
              }
            });
          }
          setSuccessMessage("Report unreported successfully!");
        } else {
          // If false, user clicked "Report" to report it
          await reportService.reReportArticle(toggleId);
          setReports(prev => prev.map(r => {
            if (r._id === toggleId || (r as any).id === toggleId) {
              return {
                ...r,
                article: {
                  ...(r.article || {}),
                  isReported: true
                }
              };
            }
            return r;
          }));
          
          if (selectedReport && (selectedReport._id === toggleId || (selectedReport as any).id === toggleId)) {
            setSelectedReport({
              ...selectedReport,
              article: {
                ...(selectedReport.article || {}),
                isReported: true
              }
            });
          }
          setSuccessMessage("Report reported successfully!");
        }
      } catch (error: any) {
        const errMsg = error.response?.data?.message || error.message || "Unknown error";
        setErrorMessage(isToggleReported ? `Failed to unreport: ${errMsg}` : `Failed to report: ${errMsg}`);
      }
      setIsToggleDialogOpen(false);
      setToggleId(null);
      setTimeout(() => setSuccessMessage(null), 3000);
      setTimeout(() => setErrorMessage(null), 3000);
    }
  };

  const openViewModal = async (report: ReportData) => {
    // Open modal immediately with base data to feel responsive
    setSelectedReport(report);
    setIsViewModalOpen(true);
    
    // Fetch full report data to get the description
    try {
      const id = report._id || report.id;
      let updatedReport = { ...report };
      
      if (id) {
        const fullReport = await reportService.getReportById(id);
        if (fullReport) {
          updatedReport = { ...updatedReport, ...fullReport };
        }
      }
      
      // The user indicated the description might only come when fetching the post by ID
      const articleId = updatedReport.article?._id || (updatedReport as any).articleId;
      if (articleId) {
        const fullArticle = await postService.getArticleById(articleId).catch(() => null);
        if (fullArticle) {
          updatedReport.article = { ...updatedReport.article, ...fullArticle };
        }
      }
      
      setSelectedReport(updatedReport);
    } catch (error) {
      console.error("Failed to fetch full report details:", error);
    }
  };

  const confirmDelete = (id: string) => {
    setDeleteId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await reportService.deleteReport(deleteId);
        setReports(prev => prev.filter(r => r._id !== deleteId && r.id !== deleteId));
        setSuccessMessage("Report deleted successfully!");
        setIsDeleteDialogOpen(false);
        setDeleteId(null);
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (error) {
        setErrorMessage("Failed to delete report.");
        setIsDeleteDialogOpen(false);
        setDeleteId(null);
        setTimeout(() => setErrorMessage(null), 3000);
      }
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Article Reports</h2>
      </div>

      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-2">
        </div>
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search reports..."
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
                  <TableHead className="font-bold">Reason</TableHead>
                  <TableHead className="font-bold">Description</TableHead>
                  <TableHead className="font-bold">Article</TableHead>
                  <TableHead className="font-bold w-[100px]">Status</TableHead>
                  <TableHead className="font-bold w-[100px] text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      Loading reports...
                    </TableCell>
                  </TableRow>
                ) : paginatedReports.length > 0 ? (
                  paginatedReports.map((report, index) => {
                    const id = report._id || report.id || index.toString();
                    const articleTitle = (report as any).articleTitle || report.article?.title || report.article?.name || "Unknown Article";

                    const articleIdRaw = report.article;
                    const articleIdStr = typeof articleIdRaw === 'object' ? (articleIdRaw._id || articleIdRaw.id) : articleIdRaw;
                    const articleLink = articleIdStr ? `/post/view/${articleIdStr}` : "#";

                    const desc = report.description || (report as any).message || (report as any).details || (report as any).text || (report as any).reportedMessages;
                    const isReported = report.article?.isReported ?? true;

                    return (
                      <TableRow key={id} className="hover:bg-muted/50 dark:hover:bg-muted/10">
                        <TableCell>{startIndex + index + 1}</TableCell>
                        <TableCell className="font-medium text-red-600 dark:text-red-400">
                          <div className="flex items-center gap-1">
                            <AlertTriangle className="h-4 w-4" />
                            {report.reason || "N/A"}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[300px] truncate" title={desc}>
                          {desc || "No description provided."}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {(report as any).articleTitle || report.article ? (
                            <Link href={articleLink} className="text-blue-600 hover:underline dark:text-blue-400 font-medium">
                              {articleTitle !== "Unknown Article" ? articleTitle : "View Article"}
                            </Link>
                          ) : (
                            <span className="text-muted-foreground">N/A</span>
                          )}
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
                              size="icon"
                              className="h-8 w-8 bg-blue-100 text-blue-600 hover:bg-blue-200 hover:text-blue-700 rounded-md dark:bg-blue-900/20 dark:text-blue-400"
                              onClick={() => openViewModal(report)}
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>

                            <Button
                              size="icon"
                              className="h-9 w-9 bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700 rounded-md dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
                              onClick={() => confirmDelete(id)}
                              title="Delete Report"
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
                      No reports found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between space-x-2 py-4 px-4">
            <div className="text-sm text-muted-foreground">
              Showing {paginatedReports.length > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + itemsPerPage, filteredReports.length)} of {filteredReports.length} entries
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

      {/* View Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Report Details</DialogTitle>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-4 gap-2 items-center">
                <span className="font-semibold text-sm text-right">Reason:</span>
                <span className="col-span-3 text-sm text-red-600 font-medium capitalize">{selectedReport.reason || "N/A"}</span>
              </div>
              <div className="grid grid-cols-4 gap-2 items-center">
                <span className="font-semibold text-sm text-right">Reporter:</span>
                <span className="col-span-3 text-sm">
                  {selectedReport.reportedBy?.email || "Unknown"}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2 items-center">
                <span className="font-semibold text-sm text-right">Article:</span>
                <span className="col-span-3 text-sm font-medium">
                  {(selectedReport as any).articleTitle || selectedReport.article?.title || selectedReport.article?.name || "Unknown Article"}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2 items-center">
                <span className="font-semibold text-sm text-right">Status:</span>
                <span className="col-span-3">
                  <Badge className={selectedReport.article?.isReported !== false ? "bg-amber-400 text-black" : "bg-green-600"}>
                    {selectedReport.article?.isReported !== false ? "Reported" : "Unreported"}
                  </Badge>
                </span>
              </div>
              <hr className="my-2 border-muted" />
              <div>
                <span className="font-semibold text-sm block mb-2">Report Description:</span>
                <p className="text-sm bg-muted p-3 rounded-md min-h-[60px] whitespace-pre-wrap">
                  {selectedReport.description || (selectedReport as any).message || (selectedReport as any).details || (selectedReport as any).text || (selectedReport as any).reportedMessages || "No description provided."}
                </p>
              </div>
              
              {selectedReport.article && (selectedReport.article.shortDescription || selectedReport.article.content) && (
                <>
                  <hr className="my-2 border-muted" />
                  <div>
                    <span className="font-semibold text-sm block mb-2">Post Content:</span>
                    <p className="text-sm bg-muted p-3 rounded-md min-h-[60px] whitespace-pre-wrap">
                      {selectedReport.article.shortDescription || selectedReport.article.content || "No content."}
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this report? This action cannot be undone.
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
              Are you sure you want to {isToggleReported ? 'report' : 'unreport'} this article?
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
    </div>
  );
}
