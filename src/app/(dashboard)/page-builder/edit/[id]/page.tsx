"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { PageForm } from "@/components/page-form";
import { pageService, PageData } from "@/services/page-service";

export default function EditPagePage() {
  const params = useParams();
  const id = params.id as string;
  
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      pageService.getPageById(id)
        .then(data => {
            if (data) setPageData(data);
        })
        .catch(err => console.error("Failed to load page for edit", err))
        .finally(() => setLoading(false));
    } else {
        setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mr-2" />
        <p className="text-muted-foreground">Loading page data...</p>
      </div>
    );
  }

  if (!pageData) {
    return (
      <div className="flex-1 p-8">
        <p className="text-red-500">Page not found or failed to load.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <PageForm initialData={pageData} isEditing />
    </div>
  );
}
