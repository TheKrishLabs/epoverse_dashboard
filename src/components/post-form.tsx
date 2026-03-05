
"use client";

import { useState, useEffect, useCallback } from "react";
import { Sparkles, X, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { postService, Category } from "@/services/post-service";
import { authService } from "@/services/auth-service";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

import { RichTextEditor } from "@/components/ui/rich-text-editor";

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
    // const data = initialData || DEFAULT_DATA;

    // Initialize state from initialData (which might be flat PostData from service or nested local PostData)
    // We need to handle both or standardize. 
    // Since we are moving to service, initialData passed from Edit page will likely be PostData from service.
    // Let's assume initialData is any for now to handle mapping safely or update interface.
    // But better to update the interface to match what we expect.
    
    // Actually, let's look at how we use it. 
    // If we passed PostData from service, we need to map it back to form state.
    
    const [languages, setLanguages] = useState<Language[]>([]);
    const [isLoadingLanguages, setIsLoadingLanguages] = useState(true);
    const [isLanguageError, setIsLanguageError] = useState(false);

    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);
    const [isCategoryError, setIsCategoryError] = useState(false);
    
    // Fetch initial data
    useEffect(() => {
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
                // We might want to handle errors individually, but for now this catches if *any* fails. 
                // To handle individually, we'd wrap api calls or check which failed. 
                // Simple approach: set both errors if one fails, or refine logic.
                // Let's refine logic slightly to allow one to succeed if the other fails?
                // Promise.all rejects if any rejects.
                // For robust UI, better to use allSettled or catch individually.
                // Reverting to individual blocks or just setting error generic.
                setIsLanguageError(true); 
                setIsCategoryError(true);
            } finally {
                setIsLoadingLanguages(false);
                setIsLoadingCategories(false);
            }
        };
        fetchData();
    }, []);

    /* const [date, setDate] = useState<Date | undefined>(
        initialData?.date ? new Date(initialData.date) : 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (initialData as any)?.releaseDate ? new Date((initialData as any).releaseDate) : 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (initialData as any)?.createdAt ? new Date((initialData as any).createdAt) : undefined
    ); */
    const [content, setContent] = useState(initialData?.content || "");
    const handleContentChange = useCallback((newContent: string) => {
        setContent(newContent);
    }, []);
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(
        // Use initial string URL if editing, otherwise null
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        initialData?.image || (initialData as any)?.featuredImage || null
    );
    
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
    // const [subCategory, setSubCategory] = useState(initialData?.subCategory || "");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [headLine, setHeadLine] = useState(initialData?.headLine || (initialData as any)?.headline || (initialData as any)?.title || "");
    const [shortHead, setShortHead] = useState(initialData?.shortHead || "");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [reporter, setReporter] = useState(initialData?.reporter || (initialData as any)?.postBy || "");

    useEffect(() => {
        // Fetch the logged-in user to display as the Content Writer
        const user = authService.getUser();
        if (user && (user.name || user.fullName)) {
            setReporter(user.fullName || user.name || "Current User");
        }
    }, []);
    
    // SEO & Settings State
    const [settings, setSettings] = useState(initialData?.settings || {
        latest: false,
        Trending: false,
        // feature: false,
        recommended: false,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        publish: (initialData as any)?.status === "Publish" || (initialData as any)?.status === "published",
    });
    const [seo, setSeo] = useState(initialData?.seo || {
        customUrl: "",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        title: (initialData as any)?.seoTitle || "",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        keyword: (initialData as any)?.seoKeywords || "",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        description: (initialData as any)?.seoDescription || "",
        reference: ""
    });

    const [errors, setErrors] = useState<Record<string, boolean>>({});

    const removeImage = useCallback(() => {
        setImagePreviewUrl(null);
    }, []);

    const handleSettingChange = useCallback((key: keyof typeof settings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    }, []);
    
    const [isSaving, setIsSaving] = useState(false);

    const handleSeoChange = useCallback((key: keyof typeof seo, value: string) => {
         setSeo(prev => ({ ...prev, [key]: value }));
    }, []);

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

        if (!imagePreviewUrl) {
             alert("A 'Featured Image' URL is required. Please provide one.");
             return;
        }

        setIsSaving(true);

        try {
            // Generate a slug from the headline and append a unique identifier to prevent 409 DB Conflicts on unique indexes
            const baseSlug = seo.customUrl || headLine
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)+/g, '');
            const generatedSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 8)}`;

            // Convert tags/keywords to arrays safely
            const keywordList = seo.keyword.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);

            // Map form data strictly to Add Article API requirements
            const payload = {
                headline: headLine, 
                shortHead: shortHead, // Added short info back to the payload
                content: content,
                category: category,
                language: language,
                slug: generatedSlug,
                status: settings.publish ? "published" : "draft",
                thumbnail: imagePreviewUrl || undefined,
                image: imagePreviewUrl || undefined,
                imageAlt: "featured image", // Optional: Add a field for alt text later
                tags: keywordList, // Assuming we use SEO keywords for tags currently
                metaKeywords: keywordList,
                metaDescription: seo.description,
                isLatest: settings.latest
            };

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const origData: any = initialData;
            if (isEditing && (origData?.id || origData?._id)) {
                const updateId = origData.id || origData._id;
                await import("@/services/post-service").then(mod => mod.postService.updateArticle(updateId, payload));
                alert("Article updated successfully!");
            } else {
                 await import("@/services/post-service").then(mod => mod.postService.createArticle(payload));
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
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 space-y-2 sm:space-y-0">
                 <div className="flex items-center gap-4">
                    {isEditing && (
                         <Link href="/post/list">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                    )}
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{isEditing ? "Edit Post" : "Add Post"}</h2>
                </div>
            </div>

            {/* Basic Information Section */}
            <div className="grid gap-6 sm:gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                {errors.language && <span className="text-xs text-red-500">Required</span>}
            </div>
            <div className="space-y-2">
                <Label className={cn(errors.category && "text-red-500")}>Category <span className="text-red-500">*</span></Label>
                <Select onValueChange={setCategory} value={category}>
                <SelectTrigger className={cn(errors.category && "border-red-500")}>
                    <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                    {isLoadingCategories ? (
                        <SelectItem value="loading" disabled>Loading categories...</SelectItem>
                    ) : isCategoryError ? (
                        <SelectItem value="error" disabled>Failed to load categories</SelectItem>
                    ) : categories.length > 0 ? (
                        categories.map((cat) => (
                            <SelectItem key={cat._id} value={cat._id}>
                                {cat.name}
                            </SelectItem>
                        ))
                    ) : (
                        <SelectItem value="empty" disabled>No categories available</SelectItem>
                    )}
                </SelectContent>
                </Select>
                {errors.category && <span className="text-xs text-red-500">Required</span>}
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
            
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label>Category Position</Label>
                    <Select>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Position" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="top">Top</SelectItem>
                            <SelectItem value="feature">Feature</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Home Position</Label>
                    <Select>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Position" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="top">Hero</SelectItem>
                            <SelectItem value="sidebar">Sidebar</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
                <Label>Short Info</Label>
                <Input 
                    placeholder="Enter short Details" 
                    value={shortHead}
                    onChange={(e) => setShortHead(e.target.value)}
                />
            </div>
            
            <div className="space-y-2">
                <Label className={cn(errors.headLine && "text-red-500")}>Head Line <span className="text-red-500">*</span></Label>
                <Input 
                    placeholder="Enter main headline" 
                    value={headLine} 
                    onChange={(e) => setHeadLine(e.target.value)}
                    className={cn(errors.headLine && "border-red-500")}
                />
                {errors.headLine && <span className="text-xs text-red-500">Required</span>}
            </div>

            {/* Details Section */}
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <Label>Details</Label>
                    <Button variant="outline" size="sm" className="h-8">
                        <Sparkles className="mr-2 h-4 w-4" />
                        AI Writer
                    </Button>
                </div>
                <div className="h-[400px] sm:h-96 pb-12 mb-20"> {/* Extended height for rich editor */}
                    <RichTextEditor value={content} onChange={handleContentChange} />
                </div>
            </div>

            {/* Media Section */}
            <div className="space-y-2 pt-8">
                <h3 className="text-lg font-medium">Media</h3>
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label>Image URL</Label>
                        <Input 
                            placeholder="https://example.com/image.jpg"
                            value={imagePreviewUrl || ""}
                            onChange={(e) => setImagePreviewUrl(e.target.value)}
                        />
                        {imagePreviewUrl && (
                            <div className="relative mt-2 w-full sm:w-40 h-32 sm:h-24 rounded-md overflow-hidden border bg-muted flex items-center justify-center">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={imagePreviewUrl} alt="Preview" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-1 right-1 h-6 w-6"
                                    onClick={removeImage}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </div>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label>Video URL</Label>
                        <Input placeholder="https://youtube.com/..." />
                    </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label>Image Alt</Label>
                        <Input placeholder="Alt text" />
                    </div>
                    <div className="space-y-2">
                        <Label>Image Title</Label>
                        <Input placeholder="Image title" />
                    </div>
                </div>
            </div>

            {/* SEO Section */}
            <div className="space-y-2">
                <h3 className="text-lg font-medium">SEO</h3>
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label>Custom URL</Label>
                        <Input 
                            placeholder="custom-url-slug" 
                            value={seo.customUrl}
                            onChange={(e) => handleSeoChange("customUrl", e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>SEO Title</Label>
                        <Input 
                            placeholder="SEO Title" 
                            value={seo.title}
                            onChange={(e) => handleSeoChange("title", e.target.value)}
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label>Meta Keyword</Label>
                    <Input 
                        placeholder="keyword1, keyword2" 
                        value={seo.keyword}
                        onChange={(e) => handleSeoChange("keyword", e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Meta Description</Label>
                    <Textarea 
                        placeholder="Meta description..." 
                        value={seo.description}
                        onChange={(e) => handleSeoChange("description", e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Reference</Label>
                    <Input 
                        placeholder="Source reference" 
                        value={seo.reference}
                        onChange={(e) => handleSeoChange("reference", e.target.value)}
                    />
                </div>
            </div>

            {/* Reporter Section */}
            <div className="space-y-2">
                <Label>Content Writer</Label>
                <Input 
                    value={reporter || "Current User"} // Fallback or rely on parent component mapping the logged-in user to initialData
                    readOnly
                    className="bg-gray-50 text-gray-500 cursor-not-allowed"
                />
            </div>

            {/* Post Settings */}
            <div className="space-y-2">
                <h3 className="text-lg font-medium">Post Settings</h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {Object.keys(settings).map((key) => (
                         <div key={key} className="flex items-center space-x-2">
                            <Checkbox 
                                id={key} 
                                checked={settings[key as keyof typeof settings]} 
                                onCheckedChange={() => handleSettingChange(key as keyof typeof settings)}
                            />
                            <Label htmlFor={key} className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()} {key === 'social' ? 'Post' : ''}</Label>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-4 pt-4 pb-10">
                <Link href="/post/list" className="w-full sm:w-auto">
                    <Button variant="outline" size="lg" className="w-full">Cancel</Button>
                </Link>
                <Button size="lg" onClick={handleSubmit} disabled={isSaving} className="w-full sm:w-auto">
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {isSaving ? "Saving..." : (isEditing ? "Update Post" : "Save Post")}
                </Button>
            </div>
        </div>
    );
}
