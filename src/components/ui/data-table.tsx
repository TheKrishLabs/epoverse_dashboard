
"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"


import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
             <div className="flex items-center space-x-2">
                <span className="text-sm">Show</span>
                <Select
                  value={`${table.getState().pagination.pageSize}`}
                  onValueChange={(value) => {
                    table.setPageSize(Number(value))
                  }}
                >
                  <SelectTrigger className="h-8 w-[70px]">
                    <SelectValue placeholder={table.getState().pagination.pageSize} />
                  </SelectTrigger>
                  <SelectContent side="top">
                    {[10, 25, 50, 100].map((pageSize) => (
                      <SelectItem key={pageSize} value={`${pageSize}`}>
                        {pageSize}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-sm">entries</span>
              </div>
          </div>



           <div className="flex items-center space-x-2">
                <span className="text-sm">Search:</span>
                <Input
                placeholder="Search..."
                value={globalFilter ?? ""}
                onChange={(event) => setGlobalFilter(event.target.value)}
                className="h-8 w-[150px] lg:w-[250px]"
                />
            </div>
      </div>
      
      <div className="border border-gray-200 bg-white dark:bg-sidebar dark:border-border overflow-hidden rounded-none shadow-sm">
        <Table className="divide-y divide-gray-200">
          <TableHeader className="bg-[#fcfcfc] border-b border-gray-200">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="divide-x divide-gray-200">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="text-gray-800 font-bold px-4 py-3 align-middle">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="divide-y divide-gray-200">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="divide-x divide-gray-200 hover:bg-gray-50/50 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-4 py-3 align-middle">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-gray-500"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="text-sm text-gray-600">
             Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)} of {table.getFilteredRowModel().rows.length} entries
        </div>
        <div className="flex items-center space-x-1">
          <Button
            variant="outline"
            className="h-9 px-3 text-sm font-medium border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 rounded-[3px] shadow-none disabled:opacity-50"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
           <div className="flex items-center space-x-1">
             {Array.from({ length: table.getPageCount() }, (_, i) => (
                  <Button
                    key={i}
                     variant={table.getState().pagination.pageIndex === i ? "default" : "outline"}
                     className={`h-9 w-9 p-0 text-sm font-medium rounded-[3px] shadow-none ${table.getState().pagination.pageIndex === i ? "bg-[#198754] hover:bg-[#157347] text-white border-[#198754]" : "border-gray-200 bg-white text-gray-700 hover:bg-gray-100"}`}
                     onClick={() => table.setPageIndex(i)}
                   >
                         {i + 1}
                   </Button>
             ))}
           </div>
          <Button
            variant="outline"
             className="h-9 px-3 text-sm font-medium border-gray-200 bg-white text-gray-700 hover:bg-gray-100 rounded-[3px] shadow-none disabled:opacity-50"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
