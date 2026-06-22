"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, FileText, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface ViewPageProps {
  params: Promise<{ id: string }>;
}

export default function ViewPage({ params }: ViewPageProps) {
    const { id } = use(params);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [pageDetail, setPageDetail] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadPage = async () => {
            try {
                const { pageService } = await import("@/services/page-service");
                const { languageService } = await import("@/services/language-service");
                
                const data = await pageService.getPageById(id);
                if (data) {
                    // Try to resolve language name
                    let langName = data.languageName || data.language;
                    if (data.language && typeof data.language === 'string') {
                        try {
                           const langs = await languageService.getLanguages();
                           // eslint-disable-next-line @typescript-eslint/no-explicit-any
                           const match = langs.find((l: any) => l._id === data.language || l.name === data.language);
                           if (match) langName = match.name;
                        } catch { /* ignore */ }
                    } else if (typeof data.language === 'object' && data.language !== null) {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        langName = (data.language as any).name || langName;
                    }
                    setPageDetail({ ...data, displayLanguage: langName });
                } else {
                    setError("Page not found");
                }
            } catch (err) {
                console.error("Failed to load page", err);
                setError("Failed to load page details");
            } finally {
                setLoading(false);
            }
        };
        loadPage();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8 min-h-[400px]">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error || !pageDetail) {
        return (
            <div className="p-8">
                <div className="bg-red-50 text-red-600 p-4 rounded-md border border-red-200">
                    {error || "Page not found"}
                </div>
            </div>
        );
    }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-x-4 mb-4">
        <div className="flex items-center space-x-4">
            <Link href="/page-builder/list">
                <Button variant="outline" size="sm">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to List
                </Button>
            </Link>
            <h2 className="text-3xl font-bold tracking-tight">View Page</h2>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
            <Card className="overflow-hidden border-none shadow-md">
                {(pageDetail.photo || pageDetail.videoUrl) && (
                    <div className="relative h-64 sm:h-80 w-full group overflow-hidden bg-muted flex items-center justify-center">
                        {pageDetail.photo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img 
                                src={pageDetail.photo} 
                                alt={pageDetail.title || "Page Image"} 
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center text-muted-foreground w-full h-full p-4">
                                <FileText className="h-16 w-16 mb-4 opacity-50" />
                                <span className="font-semibold text-lg">Video Content Provided</span>
                                <a href={pageDetail.videoUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline mt-2">View Video</a>
                            </div>
                        )}
                        <div className="absolute top-4 right-4 group-hover:opacity-100 opacity-90 transition-opacity">
                            <Badge className={(pageDetail.status === "Publish" || pageDetail.status === "Published") ? "bg-emerald-600 shadow-sm" : "bg-yellow-600 shadow-sm"}>
                                {pageDetail.status || "Draft"}
                            </Badge>
                        </div>
                    </div>
                )}
                {!pageDetail.photo && !pageDetail.videoUrl && (
                     <div className="absolute top-4 right-8 z-10">
                        <Badge className={(pageDetail.status === "Publish" || pageDetail.status === "Published") ? "bg-emerald-600 shadow-sm" : "bg-yellow-600 shadow-sm"}>
                            {pageDetail.status || "Draft"}
                        </Badge>
                     </div>
                )}
                <CardHeader className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><Globe className="h-4 w-4 text-emerald-600" /> <span className="font-medium text-emerald-800 dark:text-emerald-400">{pageDetail.displayLanguage || "Unknown Language"}</span></span>
                    </div>
                    <CardTitle className="text-3xl sm:text-4xl font-extrabold tracking-tight">{pageDetail.title || "Untitled Page"}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Separator className="my-6" />
                    {pageDetail.details ? (
                        <div 
                            className="prose dark:prose-invert max-w-none prose-emerald prose-headings:font-bold prose-p:leading-relaxed prose-img:rounded-xl" 
                            dangerouslySetInnerHTML={{ __html: pageDetail.details }} 
                        />
                    ) : (
                        <div className="py-8 text-center text-muted-foreground italic bg-muted/20 rounded-lg">
                            No content details available for this page.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>

        {/* Sidebar / Metadata */}
        <div className="space-y-6">
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg">Page Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                         <span className="text-sm text-muted-foreground flex items-center gap-2">
                            <Calendar className="h-4 w-4" /> Created Date
                         </span>
                         <span className="font-medium">{(pageDetail.createdAt ? new Date(pageDetail.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' }) : "N/A")}</span>
                    </div>
                </CardContent>
            </Card>

            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg">SEO & Discovery</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <span className="text-sm text-muted-foreground block mb-1 font-semibold text-xs uppercase tracking-wider">URL Slug</span>
                        <p className="font-mono text-xs bg-muted p-2 rounded break-all" title={pageDetail.slug}>{pageDetail.slug || "N/A"}</p>
                    </div>
                    
                    <div>
                        <span className="text-sm text-muted-foreground block mb-2 font-semibold text-xs uppercase tracking-wider">Keywords</span>
                        <div className="flex flex-wrap gap-1.5">
                            {(() => {
                                const keywords = pageDetail.metaKeywords;
                                if (!keywords) return <span className="text-xs text-muted-foreground italic">No keywords defined</span>;
                                const keywordArray = typeof keywords === 'string' ? keywords.split(",") : Array.isArray(keywords) ? keywords : [];
                                if (keywordArray.length === 0) return <span className="text-xs text-muted-foreground italic">No keywords defined</span>;
                                return keywordArray.map((k: string, i: number) => (
                                    <Badge key={i} variant="secondary" className="text-[10px] px-2 py-0 h-5 lowercase">{k.trim()}</Badge>
                                ));
                            })()}
                        </div>
                    </div>

                    <div>
                        <span className="text-sm text-muted-foreground block mb-1 font-semibold text-xs uppercase tracking-wider">Meta Description</span>
                        <p className="text-xs text-muted-foreground leading-relaxed bg-muted/40 p-2 rounded-md">
                            {pageDetail.metaDescription || <span className="italic">No meta description provided.</span>}
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
