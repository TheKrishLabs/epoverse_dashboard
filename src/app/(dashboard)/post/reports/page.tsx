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
  AlertTriangle
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

  const loadReports = async () => {
    setIsLoading(true);
    try {
      const data = await reportService.fetchReports();
      setReports(data);
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
    const articleTitle = report.article?.title || report.article?.name || "";
    return (
      (report.reason || "").toLowerCase().includes(searchLower) ||
      (report.description || "").toLowerCase().includes(searchLower) ||
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

  // Actions
  const handleUnreport = async (id: string) => {
    try {
      await reportService.unreportArticle(id);
      setReports(prev => prev.filter(r => r._id !== id && r.id !== id));
      setSuccessMessage("Article unreported successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      setErrorMessage("Failed to unreport article.");
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
                            <TableHead className="font-bold w-[100px] text-center">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    Loading reports...
                                </TableCell>
                            </TableRow>
                        ) : paginatedReports.length > 0 ? (
                            paginatedReports.map((report, index) => {
                                const id = report._id || report.id || index.toString();
                                const articleTitle = report.article?.title || report.article?.name || "Unknown Article";
                                const articleLink = report.article?._id ? `/post/edit/${report.article._id}` : "#";
                                
                                return (
                                <TableRow key={id} className="hover:bg-muted/50 dark:hover:bg-muted/10">
                                    <TableCell>{startIndex + index + 1}</TableCell>
                                    <TableCell className="font-medium text-red-600 dark:text-red-400">
                                        <div className="flex items-center gap-1">
                                            <AlertTriangle className="h-4 w-4" />
                                            {report.reason || "N/A"}
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-[300px] truncate" title={report.description}>
                                        {report.description || "No description provided."}
                                    </TableCell>
                                    <TableCell className="max-w-[200px] truncate">
                                        {report.article ? (
                                            <Link href={articleLink} className="text-blue-600 hover:underline dark:text-blue-400">
                                                {articleTitle}
                                            </Link>
                                        ) : (
                                            <span className="text-muted-foreground">N/A</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex justify-center gap-2">
                                            <Button 
                                                size="sm" 
                                                className="bg-green-600 hover:bg-green-700 text-white rounded-md"
                                                onClick={() => handleUnreport(id)}
                                                title="Unreport Article"
                                            >
                                                Unreport
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
                                <TableCell colSpan={5} className="h-24 text-center">
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
    </div>
  );
}
