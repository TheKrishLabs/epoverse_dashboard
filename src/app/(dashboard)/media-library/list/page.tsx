import { PhotoList } from "@/components/media/photo-list";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export default function PhotoListPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <PhotoList />
    </div>
  );
}
