"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Calendar } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AccessLog, accessLogService } from "@/services/access-log-service"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function AccessLogList() {
  const [logs, setLogs] = useState<AccessLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [range, setRange] = useState<string>("today")

  const fetchLogs = useCallback(async (selectedRange: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await accessLogService.getLogs(selectedRange)
      setLogs(data || [])
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError((err as { customMessage?: string }).customMessage || err.message)
      } else {
        setError("Failed to load access logs.")
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLogs(range)
  }, [range, fetchLogs])

  const columns = useMemo<ColumnDef<AccessLog>[]>(
    () => [
      {
        id: "serial",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="px-0 font-semibold"
            >
              Sl
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => <div className="text-center w-8">{row.index + 1}</div>,
        enableSorting: true,
        enableHiding: false,
      },
      {
        id: "employeeName",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="px-0 font-semibold"
            >
              Employee Name
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        accessorFn: (row) => row.employeeId?.fullName || "-",
        cell: ({ row }) => <div>{row.getValue("employeeName")}</div>,
      },
      {
        id: "role",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="px-0 font-semibold"
            >
              Role
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        accessorFn: (row) => row.roleId?.name || "-",
        cell: ({ row }) => <div>{row.getValue("role")}</div>,
      },
      {
        accessorKey: "logName",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="px-0 font-semibold"
            >
              Log Name
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => <div>{row.getValue("logName")}</div>,
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => <div className="max-w-[400px] whitespace-normal" title={row.getValue("description")}>{row.getValue("description")}</div>,
      },
      {
        accessorKey: "dateTime",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="px-0 font-semibold"
            >
              Date & Time
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => {
          const dateStr = row.getValue("dateTime") as string
          if (!dateStr) return <div>-</div>
          const date = new Date(dateStr)
          return <div>{date.toLocaleString()}</div>
        },
      },
    ],
    []
  )

  return (
    <div className="space-y-4 p-4 md:p-6 bg-white dark:bg-sidebar rounded-lg shadow-sm border border-border">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-foreground">Access Logs</h2>
        
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="last7days">Last 7 Days</SelectItem>
              <SelectItem value="last30days">Last 30 Days</SelectItem>
              <SelectItem value="thisMonth">This Month</SelectItem>
              <SelectItem value="lastMonth">Last Month</SelectItem>
            </SelectContent>
          </Select>
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
        <DataTable columns={columns} data={logs} />
      )}
    </div>
  )
}
