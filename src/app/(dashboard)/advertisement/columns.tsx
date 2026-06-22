"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Edit, Trash2, CheckCircle2 } from "lucide-react";
import { Advertisement, advertisementService } from "@/services/advertisement-service";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface AdActionsProps {
    ad: Advertisement;
    onEdit: (ad: Advertisement) => void;
    onDeleted: () => void;
}

const AdActions = ({ ad, onEdit, onDeleted }: AdActionsProps) => {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this advertisement?")) return;
        
        setIsDeleting(true);
        try {
            await advertisementService.deleteAd(ad._id);
            onDeleted();
        } catch (error) {
            console.error("Failed to delete ad:", error);
            alert("Failed to delete advertisement.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 bg-green-50 text-green-600 hover:bg-green-100 rounded-sm"
                title="Edit"
                onClick={() => onEdit(ad)}
            >
                <Edit className="h-4 w-4" />
            </Button>
            <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 bg-red-50 text-red-600 hover:bg-red-100 rounded-sm"
                title="Delete"
                disabled={isDeleting}
                onClick={handleDelete}
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    );
};

export const createColumns = (onEdit: (ad: Advertisement) => void, onDeleted: () => void): ColumnDef<Advertisement>[] => [
  {
    id: "sl",
    header: "SI",
    cell: ({ row }) => {
      return <span>{row.index + 1}</span>;
    },
  },
  {
    accessorKey: "theme",
    header: "Theme",
  },
  {
    accessorKey: "page",
    header: "Page",
    cell: ({ row }) => {
      const page = row.getValue("page") as string;
      return <span className="capitalize">{page}</span>;
    }
  },
  {
    accessorKey: "position",
    header: "Ads position",
  },
  {
    accessorKey: "adType",
    header: "Ad Type",
    cell: ({ row }) => {
      const type = row.getValue("adType") as string;
      return <span className="capitalize">{type}</span>;
    }
  },
  {
    accessorKey: "language",
    header: "Language",
    cell: ({ row }) => {
      const lang = row.getValue("language") as unknown;
      if (typeof lang === 'object' && lang !== null && 'name' in lang) {
        return <span>{(lang as { name: string }).name}</span>;
      }
      return <span>{String(lang)}</span>;
    }
  },
  {
    accessorKey: "embedCode",
    header: "Embed code",
    cell: ({ row }) => {
      const embedCode = row.getValue("embedCode") as string;
      const imageUrl = row.original.imageUrl || embedCode;
      
      return (
        <div className="relative w-full h-[60px] min-w-[150px] border bg-gray-50 flex items-center justify-center overflow-hidden">
          {imageUrl && (imageUrl.startsWith('http') || imageUrl.startsWith('/')) ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img 
              src={imageUrl} 
              alt="Ad Banner" 
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            <span className="text-[10px] text-gray-400 p-1 truncate">{embedCode || "No image"}</span>
          )}
        </div>
      );
    }
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const isActive = status === 'Active';
      
      return (
        <div className="flex justify-center">
            {isActive ? (
                <div className="bg-emerald-500 rounded-sm p-1">
                     <CheckCircle2 className="h-4 w-4 text-white" />
                </div>
            ) : (
                <div className="bg-gray-400 rounded-sm p-1">
                     <CheckCircle2 className="h-4 w-4 text-white" />
                </div>
            )}
        </div>
      );
    }
  },
  {
    id: "actions",
    header: "Action",
    cell: ({ row }) => <AdActions ad={row.original} onEdit={onEdit} onDeleted={onDeleted} />,
  },
];
