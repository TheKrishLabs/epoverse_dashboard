"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Plus, Edit, Trash2, ArrowUpDown, Eye, ToggleLeft, ToggleRight, Filter } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { OpinionData, opinionService } from "@/services/opinion-service"
import { languageService, Language } from "@/services/language-service"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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

export function OpinionList() {
  const [opinions, setOpinions] = useState<OpinionData[]>([])
  const [languages, setLanguages] = useState<Language[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all")
  
  // Delete Dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [opinionToDelete, setOpinionToDelete] = useState<OpinionData | null>(null)

  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [opinionsResponse, langData] = await Promise.all([
         opinionService.getAllOpinions(),
         languageService.getLanguages()
      ])
      setOpinions(opinionsResponse?.data || [])
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
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleDeleteClick = (opinion: OpinionData) => {
    setOpinionToDelete(opinion)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (opinionToDelete && (opinionToDelete.id || opinionToDelete._id)) {
        setIsLoading(true);
      try {
        await opinionService.deleteOpinion((opinionToDelete.id || opinionToDelete._id) as string)
        await fetchData()
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError((err as { customMessage?: string }).customMessage || err.message)
        } else {
          setError("Failed to delete opinion.")
        }
        setIsLoading(false);
      } finally {
        setIsDeleteDialogOpen(false)
        setOpinionToDelete(null)
      }
    }
  }

  const toggleStatus = useCallback(async (opinion: OpinionData) => {
    const opinionId = opinion.id || opinion._id;
    if (!opinionId) return;
    try {
        const newStatus = opinion.status === 'Active' ? 'Inactive' : 'Active';
        await opinionService.updateOpinion(opinionId, { status: newStatus });
        await fetchData();
    } catch (err) {
        console.error("Failed to toggle status", err);
        setError("Failed to toggle status");
    }
  }, [])

  const filteredOpinions = useMemo(() => {
      if (selectedLanguage === "all") return opinions;
      return opinions.filter((op) => op.language === selectedLanguage);
  }, [opinions, selectedLanguage])

  const columns = useMemo<ColumnDef<OpinionData>[]>(
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
        accessorKey: "name",
        header: ({ column }) => {
            return (
              <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="px-0 font-bold hover:bg-transparent text-gray-800"
              >
                Name
                <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-gray-400" />
              </Button>
            )
        },
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
            const lang = row.getValue("language") as string | { _id: string; name: string };
            const displayValue = typeof lang === "object" && lang !== null ? lang.name : lang;
            return <div className="text-gray-700">{displayValue || "N/A"}</div>;
        }
      },
      {
        accessorKey: "headline",
        header: ({ column }) => {
            return (
              <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="px-0 font-bold hover:bg-transparent text-gray-800"
              >
                Headline
                <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-gray-400" />
              </Button>
            )
        },
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => {
            return (
              <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="px-0 font-bold hover:bg-transparent text-gray-800"
              >
                Created Date
                <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-gray-400" />
              </Button>
            )
        },
        cell: ({ row }) => {
            const dateStr = row.getValue("createdAt") as string;
            if(!dateStr) return null;
            const date = new Date(dateStr);
            return <div className="text-[13px] text-gray-700 font-medium">{date.toLocaleDateString('en-GB')}</div>;
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
                <div className="flex items-center">
                  <Badge className={status === "Active" ? "bg-[#198754] flex items-center justify-center font-semibold text-[11px] px-2.5 py-0.5 rounded-full" : "bg-red-500 font-semibold flex items-center justify-center text-[11px] px-2.5 py-0.5 rounded-full"}>
                    {status || "Inactive"}
                  </Badge>
                </div>
            )
        }
      },
      {
        id: "actions",
        header: ({ column }) => {
            return (
              <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="px-0 font-bold hover:bg-transparent text-gray-800"
              >
                Action
                <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-gray-400" />
              </Button>
            )
        },
        cell: ({ row }) => {
          const opinion = row.original
          const opinionId = opinion.id || opinion._id;
          return (
            <div className="flex items-center gap-1.5 flex-wrap min-w-[120px]">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 text-blue-600 border border-blue-200 hover:bg-blue-100 p-1.5 rounded-sm"
                onClick={() => toggleStatus(opinion)}
                title="Toggle Status"
              >
                {opinion.status === 'Active' ? <ToggleRight className="h-full w-full" /> : <ToggleLeft className="h-full w-full" />}
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 text-gray-600 border border-gray-200 hover:bg-gray-100 p-1.5 rounded-sm"
                asChild
              >
                <Link href={`/opinions/${opinionId}`}>
                  <Eye className="h-full w-full" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 p-1.5 rounded-sm"
                asChild
              >
                <Link href={`/opinions/${opinionId}/edit`}>
                  <Edit className="h-full w-full" />
                </Link>
              </Button>
              <Button
                 variant="outline"
                 size="icon"
                 className="h-7 w-7 text-red-500 border border-red-200 hover:bg-red-100 p-1.5 rounded-sm"
                 onClick={() => handleDeleteClick(opinion)}
                 title="Delete Opinion"
              >
                 <Trash2 className="h-full w-full" />
              </Button>
            </div>
          )
        },
      },
    ],
    [toggleStatus]
  )

  return (
    <div className="space-y-4 bg-white dark:bg-sidebar min-h-[calc(100vh-80px)]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4">
        <h2 className="text-xl font-bold text-gray-800">Opinion list</h2>
        <div className="flex items-center gap-3">
             <div className="flex items-center space-x-2">
                 <Filter className="h-4 w-4 text-gray-500" />
                 <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger className="w-[180px] h-9">
                        <SelectValue placeholder="Filter by Language" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Languages</SelectItem>
                        {languages.map((lang) => (
                            <SelectItem key={lang._id} value={lang.name}>{lang.name}</SelectItem>
                        ))}
                    </SelectContent>
                 </Select>
             </div>
            <Button 
            asChild
            className="bg-[#198754] hover:bg-[#157347] text-white rounded-[3px] h-9 px-4 font-medium tracking-wide shadow-none"
            >
            <Link href="/opinions/add">
                <Plus className="mr-1.5 h-4 w-4" /> Add Opinion
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
            <DataTable columns={columns} data={filteredOpinions} />
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the associated opinion and remove its data.
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
