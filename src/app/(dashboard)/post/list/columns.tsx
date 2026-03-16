
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Edit, Eye, Trash2 } from "lucide-react";
import Link from "next/link";
import { Article } from "@/services/post-service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";

/** Factory — call this to get columns with delete wired up */
export function createColumns(
  onDelete: (id: string, title: string) => void
): ColumnDef<Article>[] {
  return [
    {
      accessorFn: (row) => row.image || row.featuredImage,
      id: "image",
      header: "Image",
      cell: ({ row }) => {
        const img = row.getValue("image") as string;
        return (
          <Avatar className="h-10 w-10 border">
            <AvatarImage src={img} alt="Featured" className="object-cover" />
            <AvatarFallback>IMG</AvatarFallback>
          </Avatar>
        );
      },
    },
    {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      accessorFn: (row) => row.headline || row.title || (row as any).headLine,
      id: "title",
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
      accessorKey: "language",
      header: "Language",
      cell: ({ row }) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const lang = row.getValue("language") as any;
        const langName = typeof lang === "object" && lang ? lang.name : lang;
        return <span>{langName || "N/A"}</span>;
      },
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cat = row.getValue("category") as any;
        const catName = typeof cat === "object" && cat ? cat.name : cat;
        return (
          <Badge
            variant="outline"
            className="bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800"
          >
            {catName || "N/A"}
          </Badge>
        );
      },
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
        const dateStr = row.getValue("createdAt") as string;
        if (!dateStr) return <span>N/A</span>;
        return <span>{format(new Date(dateStr), "MMM dd, yyyy")}</span>;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        if (!status) return <Badge variant="secondary">Unknown</Badge>;
        const isPublish =
          status === "Publish" ||
          status === "Published" ||
          status === "published" ||
          status === "Active";
        return (
          <Badge
            className={
              isPublish
                ? "bg-emerald-500 hover:bg-emerald-600 text-white dark:bg-emerald-600"
                : "bg-yellow-500 hover:bg-yellow-600 text-white dark:bg-yellow-600"
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
      cell: ({ row }) => {
        const article = row.original;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const id = article._id || (article as any).id;
        const title = article.headline || article.title || "this article";

        return (
          <div className="flex items-center gap-2">
            {/* Edit */}
            <Link href={`/post/edit/${id}`}>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 rounded-md dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/40"
                title="Edit"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </Link>

            {/* Delete */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-md dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
              title="Delete"
              onClick={() => onDelete(id, title)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>

            {/* View */}
            <Link href={`/post/view/${id}`}>
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
      },
    },
  ];
}

// Keep a static export so any other file that imported `columns` directly still compiles
export const columns = createColumns(() => {});
