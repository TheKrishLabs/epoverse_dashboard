
"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
    X,
    Loader2,
    Upload,
    ImagePlus,
    ArrowUp,
    ArrowDown,
    Trash2,
    GripVertical
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { storyService } from "@/services/story-service";
import { useRouter } from "next/navigation";

interface ImageItem {
    id: string;
    file: File;
    preview: string;
    sortOrder: number;
}

export default function StoryCreatePage() {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [images, setImages] = useState<ImageItem[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setError(null);

        const validFiles: File[] = [];
        for (const file of files) {
            if (!file.type.startsWith('image/')) {
                setError("Some files were rejected. Only image files are accepted.");
                continue;
            }
            if (file.size > 2 * 1024 * 1024) {
                setError("Some images exceed 2MB limit and were rejected.");
                continue;
            }
            validFiles.push(file);
        }

        if (validFiles.length > 0) {
            const newImages: ImageItem[] = validFiles.map((file, i) => ({
                id: `${Date.now()}-${i}`,
                file,
                preview: URL.createObjectURL(file),
                sortOrder: images.length + i + 1,
            }));
            setImages(prev => [...prev, ...newImages]);
        }

        // Reset input so same file can be re-selected
        e.target.value = '';
    }, [images.length]);

    const handleRemoveImage = (id: string) => {
        setImages(prev => {
            const filtered = prev.filter(img => img.id !== id);
            // Re-index sortOrder
            return filtered.map((img, i) => ({ ...img, sortOrder: i + 1 }));
        });
    };

    const handleMoveUp = (index: number) => {
        if (index === 0) return;
        setImages(prev => {
            const newArr = [...prev];
            [newArr[index - 1], newArr[index]] = [newArr[index], newArr[index - 1]];
            return newArr.map((img, i) => ({ ...img, sortOrder: i + 1 }));
        });
    };

    const handleMoveDown = (index: number) => {
        if (index === images.length - 1) return;
        setImages(prev => {
            const newArr = [...prev];
            [newArr[index], newArr[index + 1]] = [newArr[index + 1], newArr[index]];
            return newArr.map((img, i) => ({ ...img, sortOrder: i + 1 }));
        });
    };

    // Drag and drop handlers
    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        setDragOverIndex(index);
    };

    const handleDragEnd = () => {
        if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
            setImages(prev => {
                const newArr = [...prev];
                const [dragged] = newArr.splice(draggedIndex, 1);
                newArr.splice(dragOverIndex, 0, dragged);
                return newArr.map((img, i) => ({ ...img, sortOrder: i + 1 }));
            });
        }
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    const [saveProgress, setSaveProgress] = useState("");

    const handleSave = async () => {
        if (!title.trim()) {
            setError("Story title is required.");
            return;
        }
        if (images.length === 0) {
            setError("Please add at least one image.");
            return;
        }

        setIsSaving(true);
        setError(null);
        setSuccess(null);
        setSaveProgress("Preparing upload...");

        try {
            const formData = new FormData();
            formData.append("title", title.trim());

            // Append images in sort order with field name "images"
            images.forEach((img) => {
                if (img.file) {
                    console.log(`[Story Create] Appending image: ${img.file.name}, size: ${img.file.size} bytes, type: ${img.file.type}`);
                    formData.append("images", img.file);
                }
            });

            // Debug: Log FormData entries
            for (const [key, value] of formData.entries()) {
                if (value instanceof File) {
                    console.log(`[Story Create] FormData entry: ${key} = File(${value.name}, ${value.size} bytes)`);
                } else {
                    console.log(`[Story Create] FormData entry: ${key} = ${value}`);
                }
            }

            setSaveProgress("Uploading images...");
            const result = await storyService.createStory(formData);
            console.log(`[Story Create] Success:`, result);

            setSuccess("Story created successfully!");
            setTitle("");
            setImages([]);
            setTimeout(() => {
                router.push('/story');
            }, 1500);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error("[Story Create] Error:", err);
            const errMsg = err?.response?.data?.message || err?.message || "Failed to create story.";
            setError(errMsg);
        } finally {
            setIsSaving(false);
            setSaveProgress("");
        }
    };

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <Card className="dark:bg-sidebar dark:border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div>
                        <CardTitle className="text-xl font-bold">Create Story</CardTitle>
                        <CardDescription className="mt-1">Add a title and upload images for your story.</CardDescription>
                    </div>
                    <Link href="/story">
                        <Button variant="ghost" size="icon">
                            <X className="h-5 w-5" />
                        </Button>
                    </Link>
                </CardHeader>
                <CardContent>
                    {error && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    {success && (
                        <Alert className="mb-4 bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-900 dark:text-emerald-400">
                            <AlertTitle>Success</AlertTitle>
                            <AlertDescription>{success}</AlertDescription>
                        </Alert>
                    )}

                    <div className="grid gap-6 py-4">
                        {/* Title */}
                        <div className="space-y-2">
                            <Label htmlFor="title">Story Title <span className="text-red-500">*</span></Label>
                            <Input
                                id="title"
                                placeholder="Enter story title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="max-w-lg"
                            />
                        </div>

                        {/* Image Upload */}
                        <div className="space-y-3">
                            <Label>Story Images <span className="text-red-500">*</span></Label>
                            <p className="text-xs text-muted-foreground">Upload one or more images (max 2MB each). Drag and drop or use arrows to reorder.</p>

                            <div className="flex items-center gap-3">
                                <label
                                    htmlFor="image-upload"
                                    className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium border-2 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 transition-colors h-10 px-4 py-2"
                                >
                                    <ImagePlus className="h-4 w-4" />
                                    Add Images
                                </label>
                                <input
                                    id="image-upload"
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageSelect}
                                />
                                {images.length > 0 && (
                                    <span className="text-sm text-muted-foreground">
                                        {images.length} image{images.length !== 1 ? 's' : ''} selected
                                    </span>
                                )}
                            </div>

                            {/* Image Preview Grid */}
                            {images.length > 0 && (
                                <div className="space-y-2 mt-4">
                                    {images.map((img, index) => (
                                        <div
                                            key={img.id}
                                            draggable
                                            onDragStart={() => handleDragStart(index)}
                                            onDragOver={(e) => handleDragOver(e, index)}
                                            onDragEnd={handleDragEnd}
                                            className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${dragOverIndex === index
                                                    ? 'border-primary bg-primary/5 shadow-md'
                                                    : draggedIndex === index
                                                        ? 'opacity-50 border-dashed'
                                                        : 'border-border bg-muted/30 hover:bg-muted/50'
                                                }`}
                                        >
                                            {/* Drag handle */}
                                            <div className="cursor-grab active:cursor-grabbing text-muted-foreground">
                                                <GripVertical className="h-5 w-5" />
                                            </div>

                                            {/* Order badge */}
                                            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex-shrink-0">
                                                {index + 1}
                                            </div>

                                            {/* Thumbnail */}
                                            <div className="relative w-16 h-16 rounded-md overflow-hidden border flex-shrink-0">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={img.preview} alt={`Image ${index + 1}`} className="w-full h-full object-cover" />
                                            </div>

                                            {/* File name */}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{img.file.name}</p>
                                                <p className="text-xs text-muted-foreground">{(img.file.size / 1024).toFixed(1)} KB</p>
                                            </div>

                                            {/* Up/Down arrows */}
                                            <div className="flex flex-col gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6"
                                                    onClick={() => handleMoveUp(index)}
                                                    disabled={index === 0}
                                                >
                                                    <ArrowUp className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6"
                                                    onClick={() => handleMoveDown(index)}
                                                    disabled={index === images.length - 1}
                                                >
                                                    <ArrowDown className="h-3 w-3" />
                                                </Button>
                                            </div>

                                            {/* Remove */}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                onClick={() => handleRemoveImage(img.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Empty state */}
                            {images.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed rounded-lg text-muted-foreground">
                                    <Upload className="h-10 w-10 mb-3 opacity-40" />
                                    <p className="text-sm">No images added yet</p>
                                    <p className="text-xs mt-1">Click &quot;Add Images&quot; to upload</p>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
                            <Link href="/story">
                                <Button variant="outline">Cancel</Button>
                            </Link>
                            <Button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="bg-green-600 hover:bg-green-700 text-white min-w-[120px]"
                            >
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                {isSaving ? "Creating..." : "Create Story"}
                            </Button>
                        </div>
                    </div>

                </CardContent>
            </Card>
        </div>
    );
}
