"use client";

import { useState, useEffect, useCallback } from "react";
import { Sparkles, X, ArrowLeft, Loader2, UploadCloud } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { postService, Category } from "@/services/post-service";
import { languageService, Language } from "@/services/language-service";
import { aiWriterService } from "@/services/ai-writer-service";
import { authService, User } from "@/services/auth-service";

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
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

import dynamic from "next/dynamic";

const CKEditorComponent = dynamic(() => import("@/components/ui/ck-editor"), { 
    ssr: false,
    loading: () => <div className="h-[400px] w-full bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded-lg" />
});

interface PostData {
    id?: string;
    language: string;
    category: string;
    subCategory: string;
    date?: Date;
    headLine: string;
    shortHead: string;
    content: string;
    reporter: string;
    image: string | null;
    settings: {
        latest: boolean;
        trending: boolean;
        breaking: boolean;
        feature: boolean;
        recommended: boolean;
        publish: boolean;
        schema: boolean;
        social: boolean;
    };
    seo: {
        customUrl: string;
        title: string;
        keyword: string;
        description: string;
        reference: string;
    };
}

interface PostFormProps {
    initialData?: PostData;
    isEditing?: boolean;
}

/*
const DEFAULT_DATA: PostData = {
    language: "",
    category: "",
    subCategory: "",
    headLine: "",
    shortHead: "",
    content: "",
    reporter: "",
    image: null,
    settings: {
        latest: false,
        breaking: false,
        feature: false,
        recommended: false,
        publish: false,
        schema: false,
        social: false
    },
    seo: {
        customUrl: "",
        title: "",
        keyword: "",
        description: "",
        reference: ""
    }
};
*/

export function PostForm({ initialData, isEditing = false }: PostFormProps) {
    const router = useRouter();

    const [languages, setLanguages] = useState<Language[]>([]);
    const [isLoadingLanguages, setIsLoadingLanguages] = useState(true);
    const [isLanguageError, setIsLanguageError] = useState(false);

    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);
    const [isCategoryError, setIsCategoryError] = useState(false);
    
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    // Fetch initial data
    useEffect(() => {
        setCurrentUser(authService.getUser());
        const fetchData = async () => {
            setIsLoadingLanguages(true);
            setIsLanguageError(false);
            setIsLoadingCategories(true);
            setIsCategoryError(false);

            try {
                const [langData, catData] = await Promise.all([
                    languageService.getLanguages(),
                    postService.getCategories()
                ]);
                console.log("Languages:", langData);
                setLanguages(langData);
                console.log("Categories:", catData);
                setCategories(catData);
            } catch (error) {
                console.error("Failed to load initial data", error);
                setIsLanguageError(true); 
                setIsCategoryError(true);
            } finally {
                setIsLoadingLanguages(false);
                setIsLoadingCategories(false);
            }
        };
        fetchData();
    }, []);

    const [content, setContent] = useState(initialData?.content || "");
    const handleContentChange = useCallback((newContent: string) => {
        setContent(newContent);
    }, []);
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        initialData?.image || (initialData as any)?.featuredImage || null
    );
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageError, setImageError] = useState<string | null>(null);
    
    // Form State
    const [language, setLanguage] = useState(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const langData: any = initialData?.language;
        return typeof langData === 'object' && langData ? langData._id : (langData || "");
    });
    const [category, setCategory] = useState(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const catData: any = initialData?.category;
        return typeof catData === 'object' && catData ? catData._id : (catData || "");
    });
    const [headLine, setHeadLine] = useState(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const d = initialData as any;
        return d?.headline || d?.headLine || d?.title || "";
    });
    const [shortHead, setShortHead] = useState(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const d = initialData as any;
        return d?.shortDescription || d?.shortHead || d?.shortInfo || "";
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [reporter] = useState(initialData?.reporter || (initialData as any)?.postBy || "");

    // Position State (functional bound state variables)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [categoryPosition, setCategoryPosition] = useState((initialData as any)?.categoryPosition || "");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [homePosition, setHomePosition] = useState((initialData as any)?.homePosition || "");

    // SEO & Settings State
    const [settings, setSettings] = useState(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const d = initialData as any;
        return {
            latest: d?.isLatest || d?.settings?.latest || false,
            trending: d?.isTrending || d?.settings?.trending || false,
            recommended: d?.settings?.recommended || false,
            publish: d?.status === "published" || d?.status === "Publish" || d?.settings?.publish || false,
        };
    });
    
    const [seo, setSeo] = useState(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const d = initialData as any;
        
        // Handle tags/keywords which could be arrays or comma-string
        let keywords = d?.seoKeywords || d?.metaKeywords || d?.tags || "";
        if (Array.isArray(keywords)) {
            keywords = keywords.join(", ");
        }

        return {
            customUrl: d?.slug || d?.seo?.customUrl || "",
            title: d?.seoTitle || d?.seo?.title || "",
            keyword: keywords,
            description: d?.metaDescription || d?.seoDescription || d?.seo?.description || "",
            reference: d?.seo?.reference || ""
        };
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [imageAlt, setImageAlt] = useState((initialData as any)?.imageAlt || "");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [imageTitle, setImageTitle] = useState((initialData as any)?.imageTitle || "");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [thumbnail, setThumbnail] = useState((initialData as any)?.thumbnail || "");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [videoUrl, setVideoUrl] = useState((initialData as any)?.videoUrl || "");

    const [errors, setErrors] = useState<Record<string, boolean>>({});

    const removeImage = useCallback(() => {
        setImagePreviewUrl(null);
        setImageFile(null);
        setImageError(null);
    }, []);

    const handlePhotoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setImageError(null);
        
        if (file) {
            const objectUrl = URL.createObjectURL(file);
            setImagePreviewUrl(objectUrl);
            setImageFile(file);
        }
    }, []);

    const handleSettingChange = useCallback((key: keyof typeof settings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    }, []);
    
    const [isSaving, setIsSaving] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleSeoChange = useCallback((key: keyof typeof seo, value: string) => {
         setSeo(prev => ({ ...prev, [key]: value }));
    }, []);

    const handleAiGenerate = async () => {
        if (!headLine) {
            alert("Please provide a Head Line to generate AI content.");
            return;
        }
        setIsGenerating(true);
        try {
            const generatedText = await aiWriterService.generateContent(headLine);
            let htmlContent = generatedText;
            if (!generatedText.startsWith("<")) {
                htmlContent = generatedText.split('\n\n').filter(p => p.trim()).map(p => `<p>${p.replace(/\n/g, '<br/>')}</p>`).join('');
            }
            if (!content || content.trim() === "") {
                setContent(htmlContent);
            } else {
                setContent(content + htmlContent);
            }
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : "Failed to generate AI content";
            alert(msg);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSubmit = async () => {
        const newErrors: Record<string, boolean> = {};
        if (!language) newErrors.language = true;
        if (!category) newErrors.category = true;
        if (!headLine) newErrors.headLine = true;
        if (!content) newErrors.content = true;

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            alert("Please fill out all required fields marked with *.");
            return;
        }

        if (!imagePreviewUrl && !imageFile) {
             alert("A 'Featured Image' (URL or Upload) is required. Please provide one.");
             return;
        }

        setIsSaving(true);

        try {
            // Generate a slug from the headline if not editing or custom slug provided
            let generatedSlug = "";
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const origData: any = initialData;
            
            if (isEditing && (origData?.slug)) {
                // If editing and we have a slug, keep it unless customUrl is explicitly changed
                generatedSlug = seo.customUrl || origData.slug;
            } else {
                const baseSlug = seo.customUrl || headLine
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)+/g, '');
                
                // Add random suffix only for new posts to avoid collisions
                generatedSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 8)}`;
            }

            // Convert tags/keywords to arrays safely
            const keywordList = seo.keyword.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);

            const formData = new FormData();
            formData.append("headline", headLine);
            formData.append("shortDescription", shortHead);
            formData.append("content", content);
            formData.append("category", category);
            formData.append("language", language);
            formData.append("slug", generatedSlug);
            formData.append("status", settings.publish ? "published" : "draft");
            
            if (imageFile) {
                formData.append("image", imageFile);
            } else if (imagePreviewUrl) {
                formData.append("image", imagePreviewUrl);
            }

            if (imageAlt) formData.append("imageAlt", imageAlt);
            if (imageTitle) formData.append("imageTitle", imageTitle);
            if (thumbnail) formData.append("thumbnail", thumbnail);
            if (videoUrl) formData.append("videoUrl", videoUrl);

            if (categoryPosition) formData.append("categoryPosition", categoryPosition);
            if (homePosition) formData.append("homePosition", homePosition);
            
            if (seo.description) formData.append("metaDescription", seo.description);
            formData.append("isLatest", String(settings.latest));
            formData.append("isTrending", String(settings.trending));
            formData.append("trending", String(settings.trending));
            
            // Tags and Meta Keywords
            if (keywordList.length > 0) {
                keywordList.forEach((k: string) => {
                    formData.append("tags", k);
                    formData.append("metaKeywords", k);
                });
            }

            if (isEditing && (origData?.id || origData?._id)) {
                const updateId = origData.id || origData._id;
                await postService.updateArticle(updateId, formData);
                alert("Article updated successfully!");
            } else {
                 await postService.createArticle(formData);
                 alert("Article saved successfully!");
            }
             router.push("/post/list");
        } catch (error) {
            console.error("Failed to save post", error);
            alert("Failed to save post. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="mx-auto w-full select-none pb-24">
            
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-2 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-4">
                    {isEditing && (
                        <Link href="/post/list">
                            <Button variant="ghost" size="icon" className="rounded-full border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 h-9 w-9">
                                <ArrowLeft className="h-4 w-4 text-zinc-800 dark:text-zinc-200" />
                            </Button>
                        </Link>
                    )}
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                            {isEditing ? "Edit Post" : "Add Post"}
                        </h2>
                    </div>
                </div>
            </div>

            <div className="space-y-10">
                
                {/* Categorization */}
                <div className="space-y-6 pt-4">
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Categorization</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                        {/* Language Selector */}
                        <div className="space-y-2">
                            <Label className={cn("text-sm font-semibold text-zinc-800 dark:text-zinc-200", errors.language && "text-zinc-950 dark:text-zinc-50 underline decoration-2")}>
                                Language <span className="text-red-500 font-normal">{errors.language ? "(Required)" : "*"}</span>
                            </Label>
                            <Select onValueChange={setLanguage} value={language}>
                                <SelectTrigger className={cn("bg-transparent border-zinc-200 dark:border-zinc-800 focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100", errors.language && "border-zinc-950 dark:border-zinc-50 border-2")}>
                                    <SelectValue placeholder="Select Language" />
                                </SelectTrigger>
                                <SelectContent>
                                    {isLoadingLanguages ? (
                                        <SelectItem value="loading" disabled>Loading...</SelectItem>
                                    ) : isLanguageError ? (
                                        <SelectItem value="error" disabled>Error loading</SelectItem>
                                    ) : languages.length > 0 ? (
                                        languages.map((lang) => (
                                            <SelectItem key={lang._id} value={lang._id}>
                                                {lang.name}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <SelectItem value="empty" disabled>No languages</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Category Selector */}
                        <div className="space-y-2">
                            <Label className={cn("text-sm font-semibold text-zinc-800 dark:text-zinc-200", errors.category && "text-zinc-955 dark:text-zinc-50 underline decoration-2")}>
                                Category <span className="text-red-500 font-normal">{errors.category ? "(Required)" : "*"}</span>
                            </Label>
                            <Select onValueChange={setCategory} value={category}>
                                <SelectTrigger className={cn("bg-transparent border-zinc-200 dark:border-zinc-800 focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100", errors.category && "border-zinc-950 dark:border-zinc-50 border-2")}>
                                    <SelectValue placeholder="Select Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {isLoadingCategories ? (
                                        <SelectItem value="loading" disabled>Loading...</SelectItem>
                                    ) : isCategoryError ? (
                                        <SelectItem value="error" disabled>Error loading</SelectItem>
                                    ) : categories.length > 0 ? (
                                        categories.map((cat) => (
                                            <SelectItem key={cat._id} value={cat._id}>
                                                {cat.name}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <SelectItem value="empty" disabled>No categories</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
               {/* {errors.category && <span className="text-xs text-red-500">Required</span>}
            </div>
            {/* <div className="space-y-2">
                <Label>Sub Category</Label>
                <Select value={subCategory} onValueChange={setSubCategory}>
                <SelectTrigger>
                    <SelectValue placeholder="Select Sub Category" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="ai">AI</SelectItem>
                    <SelectItem value="web">Web Dev</SelectItem>
                </SelectContent>
                </Select>
            </div> */}
            {/* <div className="space-y-2">
                <Label className={cn(errors.date && "text-red-500")}>Release Date <span className="text-red-500">*</span></Label>
                <Popover>
                <PopoverTrigger asChild>
                    <Button
                    variant={"outline"}
                    className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground",
                        errors.date && "border-red-500 text-red-500"
                    )}
                    >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                    <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    />
                </PopoverContent>
                </Popover>
                {errors.date && <span className="text-xs text-red-500">Required</span>}
            </div> */}
                        </div>

                        {/* Category Position */}
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Category position</Label>
                            <Select onValueChange={setCategoryPosition} value={categoryPosition}>
                                <SelectTrigger className="bg-transparent border-zinc-200 dark:border-zinc-800 focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100">
                                    <SelectValue placeholder="Select Position" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="top">Top Feed</SelectItem>
                                    <SelectItem value="feature">Featured Spot</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Home Position */}
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Home Position</Label>
                            <Select onValueChange={setHomePosition} value={homePosition}>
                                <SelectTrigger className="bg-transparent border-zinc-200 dark:border-zinc-800 focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100">
                                    <SelectValue placeholder="Select Position" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="top">Hero </SelectItem>
                                    <SelectItem value="sidebar">Sidebar</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-2" />

                <div className="space-y-6">
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Content</h3>
                    
                    {/* Short Info */}
                    <div className="space-y-2">
                        <Label className={cn("text-sm font-semibold text-zinc-800 dark:text-zinc-200", errors.headLine && "text-zinc-950 dark:text-zinc-50 underline decoration-2")}>
                            Short Info 
                        </Label>
                        <Input 
                            placeholder="Enter short detail..." 
                            value={headLine} 
                            onChange={(e) => setHeadLine(e.target.value)}
                            className={cn(
                                "text-lg font-bold placeholder:text-zinc-400 bg-transparent border-zinc-200 dark:border-zinc-800 focus-visible:ring-1 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-50 focus-visible:border-zinc-950 dark:focus-visible:border-zinc-50 py-6",
                                errors.headLine && "border-zinc-950 dark:border-zinc-50 border-2"
                            )}
                        />
                    </div>

                    {/* Head Line*/}
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Head Line <span className="text-red-500">*</span></Label>
                        <Input 
                            placeholder="Enter main headline..." 
                            value={shortHead}
                            onChange={(e) => setShortHead(e.target.value)}
                            className="bg-transparent border-zinc-200 dark:border-zinc-800 focus-visible:ring-1 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-50"
                        />
                    </div>

                    {/* Detail */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center pb-1">
                            <Label className={cn("text-sm font-semibold text-zinc-800 dark:text-zinc-200", errors.content && "text-zinc-955 dark:text-zinc-50 underline decoration-2")}>
                                Detail <span className="text-red-500 font-normal">{errors.content ? "(Required)" : "*"}</span>
                            </Label>
                            <Button
                                type="button"
                                size="sm"
                                onClick={handleAiGenerate}
                                disabled={isGenerating}
                                className="h-8 bg-zinc-900 hover:bg-zinc-800 text-zinc-50 dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm gap-1.5 px-3"
                            >
                                {isGenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                                {isGenerating ? "AI writing..." : "AI Writer"}
                            </Button>
                        </div>
                        <div className={cn("rounded-lg overflow-hidden", errors.content && "border-2 border-zinc-950 dark:border-zinc-50")}>
                            <CKEditorComponent value={content} onChange={handleContentChange} />
                        </div>
                    </div>
                </div>

                <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-2" />

                <div className="space-y-6">
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Media</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-center">
                        {/* Upload Image box */}
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Upload Image</Label>
                            <Input 
                                type="file" 
                                id="featured-image-upload"
                                className="hidden"
                                onChange={handlePhotoChange} 
                                accept="image/jpeg, image/jpg, image/png, image/webp" 
                            />
                            <Label 
                                htmlFor="featured-image-upload" 
                                className="flex items-center justify-center gap-2 cursor-pointer border border-dashed border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900 px-4 py-3 rounded-lg text-sm font-medium transition-all text-zinc-500 hover:text-zinc-755 dark:text-zinc-400 dark:hover:text-zinc-300"
                            >
                                <UploadCloud className="h-4 w-4 text-zinc-400" />
                                <span>Choose Image File</span>
                            </Label>
                            {imageError && <p className="text-xs text-zinc-950 dark:text-zinc-50 font-bold mt-1">{imageError}</p>}
                        </div>

                        {/* OR separator */}
                        <div className="flex md:flex-col items-center justify-center gap-2 md:h-12 py-2">
                            <div className="h-px w-full md:w-px md:h-full bg-zinc-200 dark:bg-zinc-850 flex-1"></div>
                            <span className="text-xs font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-widest px-2 pt-5">-----OR-----</span>
                            <div className="h-px w-full md:w-px md:h-full bg-zinc-200 dark:bg-zinc-850 flex-1"></div>
                        </div>

                        {/* URL Input */}
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Image URL</Label>
                            <Input 
                                placeholder="https://example.com/image.jpg"
                                value={!imageFile ? (imagePreviewUrl || "") : ""}
                                onChange={(e) => {
                                    setImageFile(null);
                                    setImagePreviewUrl(e.target.value);
                                }}
                                className="bg-transparent border-zinc-200 dark:border-zinc-800 focus-visible:ring-1 focus-visible:ring-zinc-950"
                            />
                        </div>
                    </div>

                    {/* Unified Preview if present */}
                    {imagePreviewUrl && (
                        <div className="space-y-1 max-w-md">
                            <Label className="text-xs text-zinc-400 block font-semibold">Image preview</Label>
                            <div className="relative w-full h-48 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 flex items-center justify-center">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={imagePreviewUrl} alt="Preview" className="w-full h-full object-cover" />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-2 right-2 h-7 w-7 rounded-full bg-zinc-950/80 hover:bg-zinc-900/90 text-zinc-50 border border-zinc-800"
                                    onClick={removeImage}
                                    type="button"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Rest of Media details - in a horizontal 3-column grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-1.5">
                            <Label className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Thumbnail URL (Optional)</Label>
                            <Input 
                                placeholder="https://example.com/thumbnail.jpg" 
                                value={thumbnail}
                                onChange={(e) => setThumbnail(e.target.value)}
                                className="bg-transparent border-zinc-200 dark:border-zinc-800"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Video link</Label>
                            <Input 
                                placeholder="https://youtube.com/..." 
                                value={videoUrl}
                                onChange={(e) => setVideoUrl(e.target.value)}
                                className="bg-transparent border-zinc-200 dark:border-zinc-800"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Image alt text</Label>
                            <Input 
                                placeholder="Alt description for SEO" 
                                value={imageAlt}
                                onChange={(e) => setImageAlt(e.target.value)}
                                className="bg-transparent border-zinc-200 dark:border-zinc-800"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Image title</Label>
                        <Input 
                            placeholder="Image title" 
                            value={imageTitle}
                            onChange={(e) => setImageTitle(e.target.value)}
                            className="bg-transparent border-zinc-200 dark:border-zinc-800"
                        />
                    </div>
                </div>

                <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-2" />

                <div className="space-y-6">
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">SEO</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-1.5">
                            <Label className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Custom URL</Label>
                            <Input 
                                placeholder="custom-slug-here" 
                                value={seo.customUrl}
                                onChange={(e) => handleSeoChange("customUrl", e.target.value)}
                                className="bg-transparent border-zinc-200 dark:border-zinc-800"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">SEO Title Tag</Label>
                            <Input 
                                placeholder="SEO title metadata..." 
                                value={seo.title}
                                onChange={(e) => handleSeoChange("title", e.target.value)}
                                className="bg-transparent border-zinc-200 dark:border-zinc-800"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Meta keywords</Label>
                            <Input 
                                placeholder="keywords separated by commas" 
                                value={seo.keyword}
                                onChange={(e) => handleSeoChange("keyword", e.target.value)}
                                className="bg-transparent border-zinc-200 dark:border-zinc-800"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Meta description</Label>
                        <Textarea 
                            placeholder="Write a short search description snippet..." 
                            value={seo.description}
                            onChange={(e) => handleSeoChange("description", e.target.value)}
                            className="bg-transparent border-zinc-200 dark:border-zinc-800 min-h-[80px]"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Reference / credits</Label>
                        <Input 
                            placeholder="Citations or reference source links..." 
                            value={seo.reference}
                            onChange={(e) => handleSeoChange("reference", e.target.value)}
                            className="bg-transparent border-zinc-200 dark:border-zinc-800"
                        />
                    </div>
                </div>

                <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-2" />

                <div className="space-y-6">
                    
                    <div className="space-y-1.5 max-w-sm">
                        <Label className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Content writer</Label>
                        <Input 
                            value={reporter || currentUser?.name || currentUser?.fullName || currentUser?.email || "Current User"} 
                            readOnly
                            className="bg-zinc-50 dark:bg-zinc-900/50 text-zinc-550 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 cursor-not-allowed"
                        />
                    </div>
                </div>

                <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-2" />

                <div className="space-y-6">
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Post Settings</h3>
                    
                    <div className="flex flex-wrap gap-6 items-center">
                        {/* Publish story */}
                        <div className="flex items-center space-x-2">
                            <Checkbox 
                                id="publish" 
                                checked={settings.publish} 
                                onCheckedChange={() => handleSettingChange("publish")}
                                className="border-zinc-400 dark:border-zinc-650 bg-white dark:bg-transparent data-[state=checked]:bg-transparent dark:data-[state=checked]:bg-white data-[state=checked]:border-zinc-400 dark:data-[state=checked]:border-white data-[state=checked]:text-zinc-950 dark:data-[state=checked]:text-black"
                            />
                            <Label htmlFor="publish" className="text-sm font-medium cursor-pointer text-zinc-800 dark:text-zinc-200">
                                Publish
                            </Label>
                        </div>

                        {/* Latest update */}
                        <div className="flex items-center space-x-2">
                            <Checkbox 
                                id="latest" 
                                checked={settings.latest} 
                                onCheckedChange={() => handleSettingChange("latest")}
                                className="border-zinc-400 dark:border-zinc-650 bg-white dark:bg-transparent data-[state=checked]:bg-transparent dark:data-[state=checked]:bg-white data-[state=checked]:border-zinc-400 dark:data-[state=checked]:border-white data-[state=checked]:text-zinc-955 dark:data-[state=checked]:text-black"
                            />
                            <Label htmlFor="latest" className="text-sm font-medium cursor-pointer text-zinc-800 dark:text-zinc-200">
                                Latest
                            </Label>
                        </div>

                        {/* Trending story */}
                        <div className="flex items-center space-x-2">
                            <Checkbox 
                                id="trending" 
                                checked={settings.trending} 
                                onCheckedChange={() => handleSettingChange("trending")}
                                className="border-zinc-400 dark:border-zinc-650 bg-white dark:bg-transparent data-[state=checked]:bg-transparent dark:data-[state=checked]:bg-white data-[state=checked]:border-zinc-400 dark:data-[state=checked]:border-white data-[state=checked]:text-zinc-955 dark:data-[state=checked]:text-black"
                            />
                            <Label htmlFor="trending" className="text-sm font-medium cursor-pointer text-zinc-800 dark:text-zinc-200">
                                Trending
                            </Label>
                        </div>

                        {/* Draft backup */}
                        <div className="flex items-center space-x-2">
                            <Checkbox 
                                id="recommended" 
                                checked={settings.recommended} 
                                onCheckedChange={() => handleSettingChange("recommended")}
                                className="border-zinc-400 dark:border-zinc-650 bg-white dark:bg-transparent data-[state=checked]:bg-transparent dark:data-[state=checked]:bg-white data-[state=checked]:border-zinc-400 dark:data-[state=checked]:border-white data-[state=checked]:text-zinc-955 dark:data-[state=checked]:text-black"
                            />
                            <Label htmlFor="recommended" className="text-sm font-medium cursor-pointer text-zinc-800 dark:text-zinc-200">
                                Save As Draft
                            </Label>
                        </div>
                    </div>
                </div>

            </div>

            {/* Bottom Actions Row (Horizontal alignment) */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-8 mt-4 border-t border-zinc-200 dark:border-zinc-800">
                <Link href="/post/list" className="w-full sm:w-auto">
                    <Button variant="outline" className="w-full border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                        Cancel
                    </Button>
                </Link>
                <Button 
                    onClick={handleSubmit} 
                    disabled={isSaving} 
                    className="w-full sm:w-auto bg-zinc-950 text-zinc-50 hover:bg-zinc-900 dark:bg-zinc-50 dark:text-zinc-955 dark:hover:bg-zinc-200 font-semibold px-8 shadow-sm flex items-center justify-center gap-2"
                >
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {isSaving ? "Saving Post..." : (isEditing ? "Update Post" : "Save Post")}
                </Button>
            </div>
        </div>
    );
}
