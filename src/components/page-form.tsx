"use client";

import { useState, useEffect } from "react";
import { Loader2, ArrowLeft, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { pageService, PageData } from "@/services/page-service";
import { languageService, Language } from "@/services/language-service";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import dynamic from "next/dynamic";

const CKEditorComponent = dynamic(() => import("@/components/ui/ck-editor"), { 
    ssr: false,
    loading: () => <div className="h-[400px] w-full bg-gray-100 animate-pulse rounded-md" />
});

interface PageFormProps {
    initialData?: PageData;
    isEditing?: boolean;
}

export function PageForm({ initialData, isEditing = false }: PageFormProps) {
    const router = useRouter();

    const [languages, setLanguages] = useState<Language[]>([]);
    const [isLoadingLanguages, setIsLoadingLanguages] = useState(true);
    const [isLanguageError, setIsLanguageError] = useState(false);

    useEffect(() => {
        const fetchLanguages = async () => {
            setIsLoadingLanguages(true);
            setIsLanguageError(false);
            try {
                const langData = await languageService.getLanguages();
                setLanguages(langData);
            } catch (error) {
                console.error("Failed to load languages", error);
                setIsLanguageError(true);
            } finally {
                setIsLoadingLanguages(false);
            }
        };
        fetchLanguages();
    }, []);

    // Form State
    const [language, setLanguage] = useState(() => {
        if (!initialData?.language) return "";
        if (typeof initialData.language === 'object' && '_id' in initialData.language) {
            return (initialData.language as { _id: string })._id;
        }
        return initialData.language as string;
    });
    const [title, setTitle] = useState(initialData?.title || "");
    const [slug, setSlug] = useState(initialData?.slug || "");
    const [details, setDetails] = useState(initialData?.details || "");
    
    // Media State
    const [photoPreview, setPhotoPreview] = useState<string | null>(initialData?.photo || null);
    const [photoError, setPhotoError] = useState<string>("");
    const [videoUrl, setVideoUrl] = useState(initialData?.videoUrl || "");
    
    // SEO State
    const [metaKeywords, setMetaKeywords] = useState(initialData?.metaKeywords || "");
    const [metaDescription, setMetaDescription] = useState(initialData?.metaDescription || "");
    
    const [errors, setErrors] = useState<Record<string, boolean>>({});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (initialData) {
            setLanguage(() => {
                if (!initialData.language) return "";
                if (typeof initialData.language === 'object' && '_id' in initialData.language) {
                    return (initialData.language as { _id: string })._id;
                }
                return initialData.language as string;
            });
            setTitle(initialData.title || "");
            setSlug(initialData.slug || "");
            setDetails(initialData.details || "");
            setPhotoPreview(initialData.photo || null);
            setVideoUrl(initialData.videoUrl || "");
            setMetaKeywords(initialData.metaKeywords || "");
            setMetaDescription(initialData.metaDescription || "");
        }
    }, [initialData]);

    // Auto-generate slug when title changes
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value;
        setTitle(newTitle);
        // Only auto-generate if we are not editing or if the user hasn't heavily modified it
        if (!isEditing) {
            const newSlug = newTitle
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, "") // Remove non-word characters
                .replace(/[\s_-]+/g, "-") // Swap whitespace and underscores for hyphens
                .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
            setSlug(newSlug);
        }
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setPhotoError("");
        if (file) {
            // Validation: Max size 1MB (1 * 1024 * 1024 bytes)
            if (file.size > 1048576) {
                setPhotoError("Max size is 1mb");
                e.target.value = ""; // Reset input
                return;
            }
            
            // Validation: Allowed types
            const validTypes = ["image/jpeg", "image/jpg", "image/png"];
            if (!validTypes.includes(file.type)) {
                setPhotoError("Only Jpg, png, jpeg are allowed");
                e.target.value = "";
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removePhoto = () => setPhotoPreview(null);

    const handleSubmit = async () => {
        const newErrors: Record<string, boolean> = {};
        if (!language) newErrors.language = true;
        if (!title) newErrors.title = true;
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        
        // Ensure no photo validations are active
        if (photoError) return;

        setIsSaving(true);

        try {
            const serviceData = {
                language,
                title,
                slug,
                details,
                photo: photoPreview || null,
                videoUrl,
                metaKeywords,
                metaDescription,
            };

            const pageId = initialData?.id || initialData?._id;

            if (isEditing && pageId) {
                await pageService.updatePage(pageId, serviceData);
                alert("Page updated successfully!");
            } else {
                 await pageService.createPage(serviceData);
                 alert("Page saved successfully!");
            }
             router.push("/page-builder/list");
        } catch (error) {
            console.error("Failed to save page", error);
            alert("Failed to save page. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between space-y-2">
                 <div className="flex items-center gap-4">
                    {isEditing && (
                         <Link href="/page-builder/list">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                    )}
                    <h2 className="text-3xl font-bold tracking-tight">{isEditing ? "Edit Page" : "Add New Page"}</h2>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-2">
                    <Label className={cn(errors.language && "text-red-500")}>Language <span className="text-red-500">*</span></Label>
                    <Select onValueChange={setLanguage} value={language}>
                        <SelectTrigger className={cn(errors.language && "border-red-500")}>
                            <SelectValue placeholder="Select Language" />
                        </SelectTrigger>
                        <SelectContent>
                            {isLoadingLanguages ? (
                                <SelectItem value="loading" disabled>Loading languages...</SelectItem>
                            ) : isLanguageError ? (
                                <SelectItem value="error" disabled>Failed to load languages</SelectItem>
                            ) : languages.length > 0 ? (
                                languages.map((lang) => (
                                    <SelectItem key={lang._id} value={lang._id}>
                                        {lang.name}
                                    </SelectItem>
                                ))
                            ) : (
                                <SelectItem value="empty" disabled>No languages available</SelectItem>
                            )}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Photo</Label>
                    <Input type="file" onChange={handlePhotoChange} accept="image/jpeg, image/jpg, image/png" className="cursor-pointer" />
                    <p className="text-xs text-muted-foreground mt-1">N.B: Jpg png jpeg and max size is 1mb</p>
                    {photoError && <p className="text-xs text-red-500 mt-1">{photoError}</p>}
                    
                    {photoPreview && (
                         <div className="relative mt-2 w-32 h-20 rounded-md overflow-hidden border">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                            <Button
                                variant="destructive"
                                size="icon"
                                className="absolute top-1 right-1 h-5 w-5 rounded-full"
                                onClick={removePhoto}
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <Label>Video url</Label>
                    <Input placeholder="Video url" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
                </div>
            </div>

            <div className="space-y-2">
                <Label className={cn(errors.title && "text-red-500")}>Title <span className="text-red-500">*</span></Label>
                <Input 
                    placeholder="Title" 
                    value={title} 
                    onChange={handleTitleChange}
                    className={cn(errors.title && "border-red-500")}
                />
                 <div className="flex justify-end mt-1">
                    <span className="text-sm font-medium text-blue-600 cursor-pointer hover:underline" onClick={() => {
                        const newSlug = window.prompt("Edit Page Slug constraints manually:", slug);
                        if(newSlug) setSlug(newSlug);
                    }}>
                        Page slug: {slug}
                    </span>
                </div>
            </div>

            <div className="space-y-2">
                <Label>Details</Label>
                <div className="rounded-md border border-input bg-background w-full">
                    <CKEditorComponent value={details} onChange={setDetails} />
                </div>
            </div>

            <div className="space-y-6 pt-4">
                <div className="space-y-2">
                    <Label>Meta keywords</Label>
                    <Input placeholder="Meta keywords" value={metaKeywords} onChange={(e) => setMetaKeywords(e.target.value)} />
                </div>

                <div className="space-y-2">
                    <Label>Meta description</Label>
                    <Textarea 
                        placeholder="Meta description" 
                        value={metaDescription} 
                        onChange={(e) => setMetaDescription(e.target.value)}
                        className="min-h-[100px]"
                    />
                </div>
            </div>

            <div className="pt-4">
                <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white" onClick={handleSubmit} disabled={isSaving}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Save
                </Button>
            </div>
        </div>
    );
}
