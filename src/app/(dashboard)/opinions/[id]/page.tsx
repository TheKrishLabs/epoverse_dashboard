
"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, User, Globe, Eye, BadgeInfo, Tag, Layout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { opinionService, OpinionData } from "@/services/opinion-service";
import { languageService, Language } from "@/services/language-service";
import { format } from "date-fns";

interface ViewOpinionPageProps {
  params: Promise<{ id: string }>;
}

export default function ViewOpinionPage({ params }: ViewOpinionPageProps) {
    const { id } = use(params);
    const [opinion, setOpinion] = useState<OpinionData | null>(null);
    const [languages, setLanguages] = useState<Language[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [opinionData, langData] = await Promise.all([
                    opinionService.getOpinionById(id),
                    languageService.getLanguages()
                ]);

                if (opinionData) {
                    setOpinion(opinionData);
                } else {
                    setError("Opinion not found");
                }
                setLanguages(langData || []);
            } catch (err) {
                console.error("Failed to load opinion", err);
                setError("Failed to load opinion details");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id]);

    const getLanguageName = (lang: string | { _id: string; name: string }) => {
        if (typeof lang === 'object' && lang && lang.name) return lang.name;
        if (typeof lang === 'string' && lang) {
            const found = languages.find(l => l._id === lang || l.name === lang);
            return found ? found.name : lang;
        }
        return "Unknown";
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8 min-h-[400px]">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error || !opinion) {
        return (
            <div className="p-8">
                <div className="bg-red-50 text-red-600 p-4 rounded-md flex items-center gap-2">
                    <BadgeInfo className="h-5 w-5" />
                    {error || "Opinion not found"}
                </div>
                <Link href="/opinions" className="mt-4 block">
                    <Button variant="outline" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
                    </Button>
                </Link>
            </div>
        );
    }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
            <Link href="/opinions">
                <Button variant="outline" size="icon" className="h-9 w-9">
                    <ArrowLeft className="h-4 w-4" />
                </Button>
            </Link>
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-gray-800">Opinion Details</h2>
                <p className="text-sm text-muted-foreground">Viewing data for: {opinion.name}</p>
            </div>
        </div>
        <div className="flex items-center gap-2">
            <Link href={`/opinions/${id}/edit`}>
                <Button variant="outline" size="sm" className="text-emerald-600 border-emerald-200 hover:bg-emerald-50">
                    <Eye className="mr-2 h-4 w-4" /> Edit Opinion
                </Button>
            </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
            <Card className="overflow-hidden border-none shadow-sm bg-white">
                <CardHeader className="bg-emerald-50/50 pb-8">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        {opinion.photo1 ? (
                            <div className="relative h-32 w-32 rounded-xl overflow-hidden shadow-md shrink-0 bg-white">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img 
                                    src={opinion.photo1} 
                                    alt={opinion.name} 
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ) : (
                            <div className="h-32 w-32 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                                <User className="h-12 w-12 text-emerald-300" />
                            </div>
                        )}
                        <div className="space-y-2 pt-2">
                            <div className="flex items-center gap-3 flex-wrap">
                                <Badge className={opinion.status === "Active" ? "bg-emerald-600" : "bg-red-500"}>
                                    {opinion.status || "Inactive"}
                                </Badge>
                                <Badge variant="outline" className="bg-white">
                                    <Globe className="mr-1 h-3 w-3 text-blue-500" /> {getLanguageName(opinion.language)}
                                </Badge>
                            </div>
                            <CardTitle className="text-3xl font-extrabold text-gray-900">{opinion.name}</CardTitle>
                            {opinion.designation && (
                                <p className="text-lg font-medium text-emerald-700">{opinion.designation}</p>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-8">
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 mb-3 leading-tight">
                                {opinion.headline}
                            </h3>
                            <Separator className="my-6" />
                            <div 
                                className="prose prose-emerald dark:prose-invert max-w-none text-gray-700 leading-relaxed" 
                                dangerouslySetInnerHTML={{ __html: opinion.details || "" }} 
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Photo Gallery if photo2 exists */}
            {opinion.photo2 && (
                <Card className="border-none shadow-sm bg-white">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Layout className="h-5 w-5 text-emerald-500" /> Additional Media
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                         <div className="relative h-64 w-full rounded-lg overflow-hidden bg-gray-50 border">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                                src={opinion.photo2} 
                                alt="Secondary reference" 
                                className="w-full h-full object-contain"
                            />
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>

        {/* Sidebar / Metadata */}
        <div className="space-y-6">
            <Card className="border-none shadow-sm bg-white">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 font-bold">
                        <BadgeInfo className="h-5 w-5 text-emerald-500" /> General Info
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                    <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-gray-50/50">
                         <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Slug / URL</span>
                         <span className="text-sm font-medium break-all text-gray-800 bg-white p-2 rounded border border-gray-100">{opinion.slug || opinion.customUrl || "N/A"}</span>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                        <div className="flex items-center justify-between px-1">
                            <span className="text-sm text-muted-foreground flex items-center gap-2">
                                <Calendar className="h-4 w-4" /> Created
                            </span>
                            <span className="text-sm font-bold text-gray-700">
                                {opinion.createdAt ? format(new Date(opinion.createdAt), "dd MMM yyyy") : "N/A"}
                            </span>
                        </div>
                        <div className="flex items-center justify-between px-1">
                            <span className="text-sm text-muted-foreground flex items-center gap-2">
                                <Tag className="h-4 w-4" /> Latest
                            </span>
                            <Badge variant={opinion.isLatest ? "default" : "secondary"} className="h-5">
                                {opinion.isLatest ? "Yes" : "No"}
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-white">
                 <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 font-bold text-gray-800">
                        <Layout className="h-5 w-5 text-emerald-500" /> SEO & Discovery
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">Meta Keywords</span>
                         <div className="flex flex-wrap gap-1.5">
                            {(() => {
                                const keywords = opinion.metaKeywords;
                                if (!keywords || (Array.isArray(keywords) && keywords.length === 0)) return <span className="text-sm text-muted-foreground italic">No keywords set</span>;
                                const keywordArray = Array.isArray(keywords) ? keywords : typeof keywords === 'string' ? (keywords as string).split(",") : [];
                                return keywordArray.map((k: string, i: number) => (
                                    <Badge key={i} variant="secondary" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-100">{k.trim()}</Badge>
                                ));
                            })()}
                         </div>
                    </div>
                     <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">Meta Description</span>
                        <div className="p-3 rounded-lg bg-gray-50 text-sm text-gray-600 italic leading-relaxed border border-gray-100">
                            {opinion.metaDescription || "No meta description provided for this opinion."}
                        </div>
                    </div>
                    {opinion.imageTitle && (
                         <div>
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">Image Title</span>
                            <p className="text-sm font-medium text-gray-700">{opinion.imageTitle}</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
