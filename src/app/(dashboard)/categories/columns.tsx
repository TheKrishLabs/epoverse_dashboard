"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Edit, Eye } from "lucide-react";
import Link from "next/link";
import { Category } from "@/services/post-service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const columns: ColumnDef<Category>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "slug",
    header: "Slug",
    cell: ({ row }) => {
        const slug = row.getValue("slug") as string;
        return <span className="text-muted-foreground">{slug || "N/A"}</span>;
    }
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const isActive = status === "Active" || status === "active" || status === "Published";
        
        if (!status) {
            return <Badge variant="secondary">Unknown</Badge>;
        }

        return (
            <Badge 
                className={isActive ? "bg-emerald-500 hover:bg-emerald-600 text-white" : "bg-zinc-500 hover:bg-zinc-600 text-white"}
            >
                {status}
            </Badge>
        )
    }
  },
  {
    id: "actions",
    header: "Action",
    cell: ({ row }) => {
      const category = row.original;
      const id = category._id;

      return (
        <div className="flex items-center gap-2">
           <Link href={`/categories/edit/${id}`}>
             <Button variant="ghost" size="icon" className="h-8 w-8 bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 rounded-md dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/40" title="Edit">
              <Edit className="h-4 w-4" />
            </Button>
           </Link>
          <Link href={`/categories/${id}/articles`}>
             <Button variant="ghost" size="icon" className="h-8 w-8 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 rounded-md dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/40" title="View Articles">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
          {/* <Button variant="ghost" size="icon" className="h-8 w-8 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-md dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40" title="Delete">
            <Trash2 className="h-4 w-4" />
          </Button> */}
        </div>
      );
    },
  },
];
