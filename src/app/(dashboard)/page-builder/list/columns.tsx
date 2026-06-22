"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Edit, Eye, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import { PageData, pageService } from "@/services/page-service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// ─── Stateful Delete Button ───────────────────────────────────────────────────
function PageActions({ page, onDeleted }: { page: PageData; onDeleted: () => void }) {
  const id = page.id || page._id || "";
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${page.title}"? This action cannot be undone.`)) return;

    setIsDeleting(true);
    try {
      await pageService.deletePage(id);
      onDeleted(); // re-fetch parent list
    } catch (err) {
      console.error("Failed to delete page:", err);
      alert("Failed to delete the page. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Link href={`/page-builder/edit/${id}`}>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 rounded-md dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/40"
          title="Edit"
        >
          <Edit className="h-4 w-4" />
        </Button>
      </Link>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-md dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
        title="Delete"
        onClick={handleDelete}
        disabled={isDeleting}
      >
        {isDeleting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
      </Button>

      <Link href={`/page-builder/view/${id}`}>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 rounded-md dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/40"
          title="View"
        >
          <Eye className="h-4 w-4" />
        </Button>
      </Link>
    </div>
  );
}

// ─── Column Definitions ───────────────────────────────────────────────────────
export const columns = (onDeleted: () => void): ColumnDef<PageData>[] => [
  {
    id: "sl",
    header: "Sl",
    cell: ({ row }) => <div className="w-[30px]">{row.index + 1}</div>,
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Title
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "languageName",
    header: "Language",
    cell: ({ row }) => {
      const displayLang = row.getValue("languageName") as string;
      return (
        <Badge variant="outline" className="bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800 dark:hover:bg-emerald-900/50">
          {displayLang}
        </Badge>
      );
    },
  },
  {
    accessorKey: "slug",
    header: "Slug",
    cell: ({ row }) => <span className="text-muted-foreground">{row.getValue("slug")}</span>,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Created Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as string;
      if (!date) return <span className="text-muted-foreground">-</span>;
      return new Date(date).toLocaleDateString();
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = (row.getValue("status") as string) || "Draft";
      const isPublish = status === "Publish";
      return (
        <Badge
          className={
            isPublish
              ? "bg-emerald-500 hover:bg-emerald-600 text-white dark:bg-emerald-600 dark:hover:bg-emerald-700"
              : "bg-yellow-500 hover:bg-yellow-600 text-white dark:bg-yellow-600 dark:hover:bg-yellow-700"
          }
        >
          {status}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Action",
    cell: ({ row }) => <PageActions page={row.original} onDeleted={onDeleted} />,
  },
];
