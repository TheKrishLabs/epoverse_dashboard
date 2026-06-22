"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon, Loader2, ArrowLeft, X } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { videoPostService, VideoPostData } from "@/services/video-post-service";
import { languageService, Language } from "@/services/language-service";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
import "react-quill-new/dist/quill.snow.css";

interface VideoPostFormProps {
    initialData?: VideoPostData;
    isEditing?: boolean;
}

export function VideoPostForm({ initialData, isEditing = false }: VideoPostFormProps) {
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
    const [language, setLanguage] = useState(initialData?.language || "");
    const [reporter, setReporter] = useState(initialData?.reporter || "");
    const [date, setDate] = useState<Date | undefined>(
        initialData?.releaseDate ? new Date(initialData.releaseDate) : undefined
    );
    const [headLine, setHeadLine] = useState(initialData?.headLine || "");
    const [details, setDetails] = useState(initialData?.details || "");
    
    // Media State
    const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image || null);
    const [videoPreview, setVideoPreview] = useState<string | null>(initialData?.video || null);
    
    // SEO / Extra State
    const [imageAlt, setImageAlt] = useState(initialData?.imageAlt || "");
    const [imageTitle, setImageTitle] = useState(initialData?.imageTitle || "");
    const [videoUrl, setVideoUrl] = useState(initialData?.videoUrl || "");
    const [customUrl, setCustomUrl] = useState(initialData?.customUrl || "");
    const [reference, setReference] = useState(initialData?.reference || "");
    const [metaKeyword, setMetaKeyword] = useState(initialData?.metaKeyword || "");
    const [metaDescription, setMetaDescription] = useState(initialData?.metaDescription || "");
    const [customUrlError, setCustomUrlError] = useState("");

    const [errors, setErrors] = useState<Record<string, boolean>>({});
    const [isSaving, setIsSaving] = useState(false);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => setImagePreview(null);

    const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setVideoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCustomUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setCustomUrl(val);
        // Validating custom URL for special characters (allow basic slugs: alphanumeric and hyphens)
        if (/[^a-zA-Z0-9-]/.test(val)) {
            setCustomUrlError("Special character (e.g .,@$$) not allowed in this field");
        } else {
            setCustomUrlError("");
        }
    };

    const handleSubmit = async () => {
        const newErrors: Record<string, boolean> = {};
        if (!language) newErrors.language = true;
        if (!reporter) newErrors.reporter = true;
        if (!date) newErrors.date = true;
        if (!headLine) newErrors.headLine = true;
        if (!details || details === "<p><br></p>") newErrors.details = true;
        if (customUrlError) return; // Prevent submission if URL has invalid characters.

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsSaving(true);

        try {
            const serviceData = {
                language,
                reporter,
                releaseDate: date ? format(date, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
                headLine,
                details,
                image: imagePreview || null,
                video: videoPreview || null,
                videoUrl,
                imageAlt,
                imageTitle,
                customUrl,
                reference,
                metaKeyword,
                metaDescription,
            };

            if (isEditing && initialData?.id) {
                await videoPostService.updateVideoPost(initialData.id, serviceData);
                alert("Video post updated successfully!");
            } else {
                 await videoPostService.createVideoPost(serviceData);
                 alert("Video post saved successfully!");
            }
             router.push("/video-post/list"); // Ensure this matches listing route
        } catch (error) {
            console.error("Failed to save video post", error);
            alert("Failed to save video post. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between space-y-2">
                 <div className="flex items-center gap-4">
                    {isEditing && (
                         <Link href="/video-post/list">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                    )}
                    <h2 className="text-3xl font-bold tracking-tight">{isEditing ? "Edit Video Post" : "Add New Video Post"}</h2>
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
                                    <SelectItem key={lang._id} value={lang.name}>
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
                    <Label className={cn(errors.reporter && "text-red-500")}>Reporter <span className="text-red-500">*</span></Label>
                    <Select onValueChange={setReporter} value={reporter}>
                        <SelectTrigger className={cn(errors.reporter && "border-red-500")}>
                            <SelectValue placeholder="Select Reporter" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="john">John Doe</SelectItem>
                            <SelectItem value="jane">Jane Smith</SelectItem>
                            <SelectItem value="add_new">+ Add New</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
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
                                {date ? format(date, "yyyy-MM-dd") : <span>Pick a date</span>}
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
                </div>
            </div>

            <div className="space-y-2">
                <Label className={cn(errors.headLine && "text-red-500")}>Head Line <span className="text-red-500">*</span></Label>
                <Input 
                    placeholder="Enter Head Line" 
                    value={headLine} 
                    onChange={(e) => setHeadLine(e.target.value)}
                    className={cn(errors.headLine && "border-red-500")}
                />
            </div>

            <div className="space-y-2">
                <Label className={cn(errors.details && "text-red-500")}>Details <span className="text-red-500">*</span></Label>
                <div className={cn("h-64 pb-12 rounded-md", errors.details && "border border-red-500")}>
                    <ReactQuill theme="snow" value={details} onChange={setDetails} className="h-full" />
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 pt-8">
                <div className="space-y-2">
                    <Label>Image</Label>
                    <Input type="file" onChange={handleImageChange} accept="image/*" className="cursor-pointer" />
                    <div className="mt-2 h-48 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden border">
                        {imagePreview ? (
                            <div className="relative w-full h-full">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={imagePreview} alt="Image Preview" className="w-full h-full object-contain" />
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-2 right-2 h-6 w-6"
                                    onClick={removeImage}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <span className="text-gray-400">File not chosen</span>
                        )}
                    </div>
                </div>
                
                <div className="space-y-2">
                    <Label>Video</Label>
                    <Input type="file" onChange={handleVideoChange} accept="video/*" className="cursor-pointer" />
                    <div className="mt-2 h-48 bg-black rounded-md flex items-center justify-center overflow-hidden">
                        {videoPreview ? (
                            <video src={videoPreview} controls className="w-full h-full object-contain" />
                        ) : (
                            <span className="text-gray-400">File not chosen</span>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Image Alt</Label>
                            <Input placeholder="Image Alt" value={imageAlt} onChange={(e) => setImageAlt(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Image Title</Label>
                            <Input placeholder="Image Title" value={imageTitle} onChange={(e) => setImageTitle(e.target.value)} />
                        </div>
                    </div>
                </div>
                
                <div className="space-y-2">
                    <Label>Or Video Url</Label>
                    <Input placeholder="https://www.youtube.com/watch?v=..." value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-2">
                    <Label>Custom Url</Label>
                    <Input 
                        placeholder="example-url" 
                        value={customUrl} 
                        onChange={handleCustomUrlChange} 
                        className={cn(customUrlError && "border-red-500")}
                    />
                    {customUrlError && <p className="text-xs text-red-500">{customUrlError}</p>}
                </div>
                <div className="space-y-2">
                    <Label>Reference</Label>
                    <Input placeholder="Enter Reference" value={reference} onChange={(e) => setReference(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label>Meta Keyword</Label>
                    <Input placeholder="Keyword1,Keyword2" value={metaKeyword} onChange={(e) => setMetaKeyword(e.target.value)} />
                </div>
            </div>

            <div className="space-y-2">
                <Label>Meta Description</Label>
                <Textarea 
                    placeholder="Meta Description" 
                    value={metaDescription} 
                    onChange={(e) => setMetaDescription(e.target.value)}
                    className="min-h-[100px]"
                />
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
