"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Settings, ArrowUpDown, Download, FileSpreadsheet, Edit } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { MenuData, menuService } from "@/services/menu-service"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { MenuFormDialog } from "./menu-form-dialog"

export function MenuList() {
  const [menus, setMenus] = useState<MenuData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await menuService.getMenus()
      console.log("DEBUG: Menus Component Data:", data);
      setMenus(data || [])
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError((err as { customMessage?: string }).customMessage || err.message)
      } else {
        setError("Failed to load menus.")
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const exportToCSV = () => {
      if (menus.length === 0) return;
      const headers = ["Name", "Status"];
      const csvContent = [
          headers.join(","),
          ...menus.map(m => `"${m.name.replace(/"/g, '""')}","${m.status}"`)
      ].join("\n");

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "menus_export.csv");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const exportToExcel = () => {
      if (menus.length === 0) return;
      
      let tableHtml = "<table><thead><tr><th>Name</th><th>Status</th></tr></thead><tbody>";
      menus.forEach(m => {
          tableHtml += `<tr><td>${m.name}</td><td>${m.status}</td></tr>`;
      });
      tableHtml += "</tbody></table>";

      const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "menus_export.xls");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  }

  const columns = useMemo<ColumnDef<MenuData>[]>(
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
        cell: ({ row }) => <div className="text-gray-800 py-2 font-medium">{row.getValue("name")}</div>,
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
            // Matches requirement formatting: UI visual reference suggests green for publish, gray/red for draft
            return (
              <Badge variant={status === "Publish" ? "default" : "secondary"} className={status === 'Publish' ? 'bg-[#198754] hover:bg-[#157347]' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}>
                {status}
              </Badge>
            )
        },
      },
      {
        id: "action",
        header: () => <div className="font-bold text-gray-800">Action</div>,
        cell: ({ row }) => {
          const menuId = row.original.id || row.original._id;
          return (
            <div className="flex gap-2 items-center">
              <MenuFormDialog 
                mode="edit" 
                initialData={row.original} 
                onSuccess={fetchData}
                trigger={
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 text-green-600 border border-green-200 hover:bg-green-50 p-1.5 rounded-sm"
                    title="Edit Menu Details"
                  >
                    <Edit className="h-full w-full" />
                  </Button>
                }
              />
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 text-gray-600 border border-gray-200 hover:bg-gray-100 p-1.5 rounded-sm"
                asChild
                title="Manage Menu Items"
              >
                <Link href={`/menus/${menuId}/builder`}>
                  <Settings className="h-full w-full" />
                </Link>
              </Button>
            </div>
          )
        },
      },
    ],
    [fetchData]
  )

  return (
    <div className="space-y-4 bg-white min-h-[calc(100vh-80px)] p-6 rounded-md shadow-sm border border-gray-200">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4">
        <h2 className="text-xl font-bold text-gray-800">Menu List</h2>
        <div className="flex items-center gap-3">
             <MenuFormDialog onSuccess={fetchData} />
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
            <DataTable columns={columns} data={menus} />
        </div>
      )}
    </div>
  )
}
