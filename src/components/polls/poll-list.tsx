"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Plus, Edit, Trash2, ArrowUpDown, BarChart2, Download, FileSpreadsheet } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { PollData, pollService } from "@/services/poll-service"
import { languageService, Language } from "@/services/language-service"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function PollList() {
  const [polls, setPolls] = useState<PollData[]>([])
  const [languages, setLanguages] = useState<Language[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Delete Dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [pollToDelete, setPollToDelete] = useState<PollData | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [pollsData, langData] = await Promise.all([
         pollService.getPolls(),
         languageService.getLanguages()
      ])
      
      console.log("DEBUG: Polls Data Received:", pollsData);
      setPolls(pollsData || [])
      setLanguages(langData || [])
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError((err as { customMessage?: string }).customMessage || err.message)
      } else {
        setError("Failed to load data.")
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Helper function to map language ID to language name safely
  const getLanguageName = useCallback((langValue: unknown) => {
      if (!langValue) return 'Unknown';
      // If it's already an object with a name, use it
      if (typeof langValue === 'object' && 'name' in langValue) return String((langValue as Record<string, unknown>).name);
      // If it's a string (ID), lookup in the languages array
      if (typeof langValue === 'string') {
          const found = languages.find(l => l._id === langValue || l.name === langValue);
          if (found) return found.name;
      }
      return String(langValue); // Fallback to raw string if nothing matches
  }, [languages]);

  const handleDeleteClick = (poll: PollData) => {
    setPollToDelete(poll)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (pollToDelete && (pollToDelete.id || pollToDelete._id)) {
        setIsLoading(true);
      try {
        await pollService.deletePoll((pollToDelete.id || pollToDelete._id) as string)
        await fetchData()
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError((err as { customMessage?: string }).customMessage || err.message)
        } else {
          setError("Failed to delete poll.")
        }
        setIsLoading(false);
      } finally {
        setIsDeleteDialogOpen(false)
        setPollToDelete(null)
      }
    }
  }

  const toggleStatus = useCallback(async (poll: PollData) => {
    const pollId = poll.id || poll._id;
    if (!pollId) return;
    try {
        const newStatus = poll.status === 'Active' ? 'Inactive' : 'Active';
        // Optimistic UI approach or standard approach
        setPolls(current => current.map(p => (p.id === pollId || p._id === pollId) ? { ...p, status: newStatus } : p));
        await pollService.togglePollStatus(pollId);
    } catch (err) {
        console.error("Failed to toggle status", err);
        setError("Failed to toggle status");
        await fetchData(); // Revert back on error
    }
  }, [fetchData])

  const exportToCSV = () => {
      if (polls.length === 0) return;
      const headers = ["Question", "Vote Permission", "Language", "Status"];
      const csvContent = [
          headers.join(","),
          ...polls.map(p => `"${p.question.replace(/"/g, '""')}","${p.votePermission === 'all' ? 'All Users' : 'Registered Users'}","${getLanguageName(p.language)}","${p.status}"`)
      ].join("\n");

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "polls_export.csv");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const exportToExcel = () => {
      // Simplest method without third party heavy libraries: rendering slightly formatted HTML 
      // with Application/vnd.ms-excel Content Type. Very reliable for tables.
      if (polls.length === 0) return;
      
      let tableHtml = "<table><thead><tr><th>Question</th><th>Vote Permission</th><th>Language</th><th>Status</th></tr></thead><tbody>";
      polls.forEach(p => {
          tableHtml += `<tr><td>${p.question}</td><td>${p.votePermission === 'all' ? 'All Users' : 'Registered Users'}</td><td>${getLanguageName(p.language)}</td><td>${p.status}</td></tr>`;
      });
      tableHtml += "</tbody></table>";

      const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "polls_export.xls");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  }

  const columns = useMemo<ColumnDef<PollData>[]>(
    () => [
      {
        id: "serial",
        header: ({ column }) => {
            return (
              <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="px-0 font-bold hover:bg-transparent text-gray-800"
              >
                Sl
                <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-gray-400" />
              </Button>
            )
        },
        cell: ({ row }) => <div className="text-center w-8 text-gray-600">{row.index + 1}</div>,
      },
      {
        accessorKey: "question",
        header: ({ column }) => {
            return (
              <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="px-0 font-bold hover:bg-transparent text-gray-800"
              >
                Question
                <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-gray-400" />
              </Button>
            )
        },
        cell: ({ row }) => <div className="text-gray-800 py-2 max-w-[300px] truncate" title={row.getValue("question")}>{row.getValue("question")}</div>,
      },
      {
        accessorKey: "votePermission",
        header: ({ column }) => {
            return (
              <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="px-0 font-bold hover:bg-transparent text-gray-800"
              >
                Vote Permission
                <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-gray-400" />
              </Button>
            )
        },
        cell: ({ row }) => {
            const perm = row.getValue("votePermission") as string;
            return <div className="text-gray-600 font-medium">{perm === 'all' ? 'All users can vote' : 'Only registered users'}</div>;
        }
      },
      {
        accessorKey: "language",
        header: ({ column }) => {
            return (
              <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="px-0 font-bold hover:bg-transparent text-gray-800"
              >
                Language
                <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-gray-400" />
              </Button>
            )
        },
        cell: ({ row }) => {
            const displayValue = getLanguageName(row.getValue("language"));
            return <div className="text-gray-600 font-medium">{displayValue}</div>;
        }
      },
      {
        accessorKey: "status",
        header: ({ column }) => {
            return (
              <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="px-0 font-bold hover:bg-transparent text-gray-800"
              >
                Status
                <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-gray-400" />
              </Button>
            )
        },
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            return (
                <div className="flex items-center" >
                  <button 
                    onClick={() => toggleStatus(row.original)}
                    className="flex items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 rounded-sm overflow-hidden"
                    title={`Toggle ${status === 'Active' ? 'Inactive' : 'Active'}`}
                  >
                     <div className="flex items-center">
                        <Badge className={`${status === "Active" ? "bg-[#198754] flex items-center justify-center font-semibold text-[11px] px-2.5 py-0.5 rounded-full" : "bg-red-500 font-semibold flex items-center justify-center text-[11px] px-2.5 py-0.5 rounded-full"}`}>
                            {status || "Inactive"}
                        </Badge>
                     </div>
                  </button>
                </div>
            )
        }
      },
      {
        id: "actions",
        header: "Action",
        cell: ({ row }) => {
          const poll = row.original
          const pollId = poll.id || poll._id || "mock";
          return (
            <div className="flex items-center gap-1.5 flex-wrap min-w-[120px]">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 text-indigo-600 border border-indigo-200 hover:bg-indigo-100 p-1.5 rounded-sm"
                asChild
                title="View Results"
              >
                <Link href={`/polls/${pollId}/results`}>
                  <BarChart2 className="h-full w-full" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 p-1.5 rounded-sm"
                asChild
                title="Edit Poll"
              >
                <Link href={`/polls/${pollId}/edit`}>
                  <Edit className="h-full w-full" />
                </Link>
              </Button>
              <Button
                 variant="outline"
                 size="icon"
                 className="h-7 w-7 text-red-500 border border-red-200 hover:bg-red-100 p-1.5 rounded-sm"
                 onClick={() => handleDeleteClick(poll)}
                 title="Delete Poll"
              >
                 <Trash2 className="h-full w-full" />
              </Button>
            </div>
          )
        },
      },
    ],
    [toggleStatus, getLanguageName]
  )

  return (
    <div className="space-y-4 bg-white dark:bg-sidebar min-h-[calc(100vh-80px)] p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4">
        <h2 className="text-xl font-bold text-gray-800">Polls</h2>
        <div className="flex items-center gap-3">
             <Button 
                variant="outline"
                onClick={exportToCSV}
                className="h-9 px-3 text-sm font-medium border-gray-200 bg-white text-gray-700 hover:bg-gray-100 rounded-[3px] shadow-none"
             >
                <Download className="h-4 w-4 mr-1.5" /> CSV
             </Button>
             <Button 
                variant="outline"
                onClick={exportToExcel}
                className="h-9 px-3 text-sm font-medium border-gray-200 bg-white text-green-700 hover:bg-green-50 rounded-[3px] shadow-none border-green-200"
             >
                <FileSpreadsheet className="h-4 w-4 mr-1.5" /> Excel
             </Button>

            <Button 
                asChild
                className="bg-[#198754] hover:bg-[#157347] text-white rounded-[3px] h-9 px-4 font-medium tracking-wide shadow-none"
            >
                <Link href="/polls/add">
                    <Plus className="mr-1.5 h-4 w-4" /> New Poll
                </Link>
            </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="overflow-x-auto w-full">
            <DataTable columns={columns} data={polls} />
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the associated poll and remove its data including all accumulated votes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700"
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
