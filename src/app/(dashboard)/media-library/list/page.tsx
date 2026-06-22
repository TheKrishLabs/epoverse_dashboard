import { PhotoList } from "@/components/media/photo-list";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export default function PhotoListPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Photo List</h3>
            <p className="text-sm text-muted-foreground">
            Manage your uploaded photos.
            </p>
          </div>
          <Link href="/media-library/upload">
            <Button>
                <Plus className="mr-2 h-4 w-4" />
                Upload New
            </Button>
          </Link>
      </div>
      <PhotoList />
    </div>
  );
}
