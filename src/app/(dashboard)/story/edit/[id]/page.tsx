
"use client";

import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import { 
  ArrowLeft,
  Loader2,
  ImagePlus,
  ArrowUp,
  ArrowDown,
  Trash2,
  GripVertical,
  Upload
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { storyService, StoryItemData } from "@/services/story-service";
import { useRouter } from "next/navigation";

interface ExistingImage {
  type: 'existing';
  _id: string;
  image: string;
  sortOrder: number;
  markedForDeletion: boolean;
}

interface NewImage {
  type: 'new';
  id: string;
  file: File;
  preview: string;
  sortOrder: number;
}

type ImageEntry = ExistingImage | NewImage;

interface StoryEditPageProps {
  params: Promise<{ id: string }>;
}

export default function StoryEditPage({ params }: StoryEditPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  const [title, setTitle] = useState("");
  const [imageEntries, setImageEntries] = useState<ImageEntry[]>([]);
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  useEffect(() => {
    const loadStory = async () => {
        try {
            const story = await storyService.getStoryById(id);
            if (story) {
                setTitle(story.title || "");
                
                // Map existing images from the story items
                const existingImages: ExistingImage[] = (story.items || [])
                  .sort((a: StoryItemData, b: StoryItemData) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
                  .map((item: StoryItemData, index: number) => ({
                    type: 'existing' as const,
                    _id: item._id || item.itemId || '',
                    image: item.image || item.storyImage || '',
                    sortOrder: index + 1,
                    markedForDeletion: false,
                  }));
                
                setImageEntries(existingImages);
            } else {
                setError("Story not found");
            }
        } catch (err) {
            console.error("Failed to load story", err);
            setError("Failed to load story details");
        } finally {
            setLoading(false);
        }
    };
    loadStory();
  }, [id]);

  const handleAddImages = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
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
      setImageEntries(prev => {
        const activeEntries = prev.filter(e => e.type === 'new' || !e.markedForDeletion);
        const startOrder = activeEntries.length + 1;
        const newEntries: NewImage[] = validFiles.map((file, i) => ({
          type: 'new' as const,
          id: `new-${Date.now()}-${i}`,
          file,
          preview: URL.createObjectURL(file),
          sortOrder: startOrder + i,
        }));
        return [...prev, ...newEntries];
      });
    }

    e.target.value = '';
  }, []);

  const handleToggleDelete = (index: number) => {
    setImageEntries(prev => {
      const newArr = [...prev];
      const entry = newArr[index];
      if (entry.type === 'existing') {
        newArr[index] = { ...entry, markedForDeletion: !entry.markedForDeletion };
      } else {
        // For new images, just remove them
        newArr.splice(index, 1);
      }
      return reindex(newArr);
    });
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setImageEntries(prev => {
      const newArr = [...prev];
      [newArr[index - 1], newArr[index]] = [newArr[index], newArr[index - 1]];
      return reindex(newArr);
    });
  };

  const handleMoveDown = (index: number) => {
    setImageEntries(prev => {
      if (index >= prev.length - 1) return prev;
      const newArr = [...prev];
      [newArr[index], newArr[index + 1]] = [newArr[index + 1], newArr[index]];
      return reindex(newArr);
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
      setImageEntries(prev => {
        const newArr = [...prev];
        const [dragged] = newArr.splice(draggedIndex, 1);
        newArr.splice(dragOverIndex, 0, dragged);
        return reindex(newArr);
      });
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const reindex = (entries: ImageEntry[]): ImageEntry[] => {
    return entries.map((entry, i) => ({ ...entry, sortOrder: i + 1 }));
  };

  const handleUpdate = async () => {
    if (!title.trim()) {
      setError("Story title is required.");
      return;
    }

    const activeEntries = imageEntries.filter(
      e => e.type === 'new' || !e.markedForDeletion
    );
    if (activeEntries.length === 0) {
      setError("At least one image is required.");
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append("title", title.trim());

      // existingOrders: sorted existing images that are NOT deleted
      const existingOrders = imageEntries
        .filter(e => e.type === 'existing' && !e.markedForDeletion)
        .map(e => ({
          itemId: (e as ExistingImage)._id,
          sortOrder: e.sortOrder,
        }));
      formData.append("existingOrders", JSON.stringify(existingOrders));

      // deleteImageIds: existing images marked for deletion
      const deleteImageIds = imageEntries
        .filter(e => e.type === 'existing' && e.markedForDeletion)
        .map(e => (e as ExistingImage)._id);
      formData.append("deleteImageIds", JSON.stringify(deleteImageIds));

      // New images with field name "images"
      const newImages = imageEntries.filter(e => e.type === 'new') as NewImage[];
      newImages.forEach((img) => {
        formData.append("images", img.file);
      });

      await storyService.updateStory(id, formData);

      setSuccess("Story updated successfully!");
      setTimeout(() => {
        router.push('/story');
      }, 1500);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || err?.message || "Failed to update story.";
      setError(errMsg);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const activeImages = imageEntries.filter(
    e => e.type === 'new' || !e.markedForDeletion
  );
  const deletedCount = imageEntries.filter(
    e => e.type === 'existing' && e.markedForDeletion
  ).length;

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
       <Card className="dark:bg-sidebar dark:border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-4">
            <Link href="/story">
                <Button variant="ghost" size="icon">
                    <ArrowLeft className="h-4 w-4" />
                </Button>
            </Link>
            <div>
              <CardTitle className="text-xl font-bold">Edit Story</CardTitle>
              <CardDescription className="mt-1">Manage title, images, and their order.</CardDescription>
            </div>
          </div>
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

                {/* Image Management */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label>Story Images</Label>
                            <p className="text-xs text-muted-foreground mt-1">
                                {activeImages.length} active image{activeImages.length !== 1 ? 's' : ''}
                                {deletedCount > 0 && <span className="text-red-500 ml-2">({deletedCount} marked for removal)</span>}
                            </p>
                        </div>
                        <label 
                            htmlFor="new-image-upload" 
                            className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium border-2 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 transition-colors h-10 px-4 py-2"
                        >
                            <ImagePlus className="h-4 w-4" />
                            Add More Images
                        </label>
                        <input 
                            id="new-image-upload" 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            multiple
                            onChange={handleAddImages}
                        />
                    </div>

                    {/* Image List */}
                    {imageEntries.length > 0 ? (
                        <div className="space-y-2 mt-2">
                            {imageEntries.map((entry, index) => {
                              const isDeleted = entry.type === 'existing' && entry.markedForDeletion;
                              const imageSrc = entry.type === 'existing' ? entry.image : entry.preview;
                              const label = entry.type === 'existing' ? 'Existing' : 'New';
                              
                              return (
                                <div 
                                    key={entry.type === 'existing' ? entry._id : entry.id}
                                    draggable={!isDeleted}
                                    onDragStart={() => handleDragStart(index)}
                                    onDragOver={(e) => handleDragOver(e, index)}
                                    onDragEnd={handleDragEnd}
                                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                                        isDeleted
                                            ? 'opacity-40 border-red-300 bg-red-50/50 dark:bg-red-900/10 line-through'
                                            : dragOverIndex === index 
                                                ? 'border-primary bg-primary/5 shadow-md' 
                                                : draggedIndex === index 
                                                    ? 'opacity-50 border-dashed' 
                                                    : 'border-border bg-muted/30 hover:bg-muted/50'
                                    }`}
                                >
                                    {/* Drag handle */}
                                    <div className={`${isDeleted ? 'invisible' : 'cursor-grab active:cursor-grabbing'} text-muted-foreground`}>
                                        <GripVertical className="h-5 w-5" />
                                    </div>

                                    {/* Order badge */}
                                    <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold flex-shrink-0 ${
                                        isDeleted ? 'bg-red-100 text-red-400' : 'bg-primary/10 text-primary'
                                    }`}>
                                        {index + 1}
                                    </div>

                                    {/* Thumbnail */}
                                    <div className="relative w-16 h-16 rounded-md overflow-hidden border flex-shrink-0">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={imageSrc} alt={`Image ${index + 1}`} className="w-full h-full object-cover" />
                                    </div>

                                    {/* Label & info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                                entry.type === 'existing' 
                                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
                                                    : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                            }`}>{label}</span>
                                            {isDeleted && (
                                                <span className="text-xs text-red-500 font-medium">Will be removed</span>
                                            )}
                                        </div>
                                        {entry.type === 'new' && (
                                            <p className="text-xs text-muted-foreground mt-1 truncate">{entry.file.name}</p>
                                        )}
                                    </div>

                                    {/* Up/Down arrows */}
                                    {!isDeleted && (
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
                                                disabled={index === imageEntries.length - 1}
                                            >
                                                <ArrowDown className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    )}

                                    {/* Delete / Undo */}
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className={`h-8 w-8 ${
                                            isDeleted 
                                                ? 'text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20' 
                                                : 'text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20'
                                        }`}
                                        onClick={() => handleToggleDelete(index)}
                                        title={isDeleted ? "Undo removal" : "Mark for removal"}
                                    >
                                        {isDeleted ? (
                                            <span className="text-xs font-medium">Undo</span>
                                        ) : (
                                            <Trash2 className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                              );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed rounded-lg text-muted-foreground">
                            <Upload className="h-10 w-10 mb-3 opacity-40" />
                            <p className="text-sm">No images found</p>
                            <p className="text-xs mt-1">Click &quot;Add More Images&quot; to upload</p>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
                    <Link href="/story">
                        <Button variant="outline">Cancel</Button>
                    </Link>
                    <Button 
                        onClick={handleUpdate}
                        disabled={isSaving}
                        className="bg-green-600 hover:bg-green-700 text-white min-w-[140px]"
                    >
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        {isSaving ? "Updating..." : "Update Story"}
                    </Button>
                </div>
            </div>
        </CardContent>
       </Card>
    </div>
  );
}
