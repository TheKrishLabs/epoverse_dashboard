"use client"

import * as React from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical } from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface DraggableDataTableProps<TData> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<TData, any>[]
  data: TData[]
  onReorder: (newData: TData[]) => void
  getRowId: (row: TData) => string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SortableRow({ row, getRowId }: { row: any; getRowId: (row: any) => string }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: getRowId(row.original) })

  const transformString = CSS.Transform.toString(transform)
  const style = {
    transform: transformString ? `${transformString}${isDragging ? " scale(1.01)" : ""}` : undefined,
    transition: [transition, "box-shadow 200ms ease"].filter(Boolean).join(", "),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(isDragging ? { position: "relative", zIndex: 9999, backgroundColor: "var(--background)", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" } as any : {}),
  }

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`divide-x divide-gray-200 transition-colors cursor-grab active:cursor-grabbing [&_button]:cursor-pointer [&_a]:cursor-pointer ${
        isDragging ? "opacity-90" : "hover:bg-gray-50/50"
      }`}
    >
      <TableCell className="px-4 py-3 align-middle w-10 text-center">
        <div className="cursor-grab hover:text-gray-900 text-gray-500 inline-flex items-center justify-center">
          <GripVertical className="h-4 w-4" />
        </div>
      </TableCell>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {row.getVisibleCells().map((cell: any) => (
        <TableCell key={cell.id} className="px-4 py-3 align-middle">
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  )
}

export function DraggableDataTable<TData>({
  columns,
  data,
  onReorder,
  getRowId,
}: DraggableDataTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (originalRow, index) => getRowId(originalRow) || String(index),
  })

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 500,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = data.findIndex((item) => getRowId(item) === active.id)
      const newIndex = data.findIndex((item) => getRowId(item) === over?.id)
      
      const newData = arrayMove(data, oldIndex, newIndex)
      onReorder(newData)
    }
  }

  return (
    <div className="space-y-4">
      <div className="border border-gray-200 bg-white dark:bg-sidebar dark:border-border overflow-hidden rounded-none shadow-sm">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <Table className="divide-y divide-gray-200">
            <TableHeader className="bg-[#fcfcfc] border-b border-gray-200">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="divide-x divide-gray-200">
                  <TableHead className="w-10 text-center px-4 py-3 align-middle">
                     {/* Empty header for drag handle */}
                  </TableHead>
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
              <SortableContext
                items={data.map((item) => getRowId(item))}
                strategy={verticalListSortingStrategy}
              >
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <SortableRow key={row.id} row={row} getRowId={getRowId} />
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length + 1}
                      className="h-24 text-center text-gray-500"
                    >
                      No categories found.
                    </TableCell>
                  </TableRow>
                )}
              </SortableContext>
            </TableBody>
          </Table>
        </DndContext>
      </div>
    </div>
  )
}
