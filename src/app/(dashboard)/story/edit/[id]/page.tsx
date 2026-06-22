
"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { 
  ArrowLeft,
  Loader2
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { storyService } from "@/services/story-service";
import { useRouter } from "next/navigation";

interface StoryEditPageProps {
  params: Promise<{ id: string }>;
}

export default function StoryEditPage({ params }: StoryEditPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  const [language, setLanguage] = useState("");
  const [title, setTitle] = useState("");
  const [buttonText, setButtonText] = useState("");
  const [buttonLink, setButtonLink] = useState("");
  
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadStory = async () => {
        try {
            const story = await storyService.getStoryById(id);
            if (story) {
                setLanguage(story.language);
                setTitle(story.title);
                setButtonText(story.buttonText || "");
                setButtonLink(story.buttonLink || "");
                setImagePreview(story.image || null);
            } else {
                setError("Story not found");
            }
        } catch (error) {
            console.error("Failed to load story", error);
            setError("Failed to load story details");
        } finally {
            setLoading(false);
        }
    };
    loadStory();
  }, [id]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        setError("Image size must be less than 2MB");
        return;
      }
      
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const handleUpdate = async () => {
    if (!language) {
      setError("Language is required");
      return;
    }
    if (!title) {
        setError("Story Title is required");
        return;
    }
    if (!imagePreview) {
        setError("Story Image is required");
        return;
    }

    setIsSaving(true);
    try {
        await storyService.updateStory(id, {
            language,
            title,
            buttonText,
            buttonLink,
            // image: imagePreview would be updated if file changed
        });

        setSuccess("Story updated successfully!");
        setTimeout(() => {
            setSuccess(null);
            router.push('/story');
        }, 1500);
    } catch (error) {
        console.error("Failed to update story", error);
        setError("Failed to update story");
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
            <CardTitle className="text-xl font-bold">Edit Story</CardTitle>
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

            <div className="grid gap-4 py-4">
                {/* Row 1: Language & Story Title */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="language">Language <span className="text-red-500">*</span></Label>
                        <Select value={language} onValueChange={setLanguage}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Language" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="English">English</SelectItem>
                                <SelectItem value="Hindi">Hindi</SelectItem>
                                <SelectItem value="Tamil">Tamil</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="title">Story Title <span className="text-red-500">*</span></Label>
                        <Input 
                            id="title" 
                            placeholder="Story Title" 
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                </div>

                {/* Row 2: Story Image & Button Text */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                         <Label htmlFor="image">Story Image (Max 2MB) <span className="text-red-500">*</span></Label>
                         <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <label 
                                    htmlFor="image-upload" 
                                    className="cursor-pointer inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-10 px-4 py-2"
                                >
                                    Choose File
                                </label>
                                <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                                    {imageFile ? imageFile.name : "Change image..."}
                                </span>
                                <input 
                                    id="image-upload" 
                                    type="file" 
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                            </div>
                            {imagePreview && (
                                <div className="relative w-40 h-24 rounded-md overflow-hidden border mt-2">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="btn-text">Button Text</Label>
                        <Input 
                            id="btn-text" 
                            placeholder="Button Text" 
                            value={buttonText}
                            onChange={(e) => setButtonText(e.target.value)}
                        />
                    </div>
                </div>

                {/* Row 3: Button Link */}
                <div className="space-y-2">
                    <Label htmlFor="btn-link">Button Link</Label>
                    <Input 
                        id="btn-link" 
                        placeholder="Button Link" 
                        value={buttonLink}
                        onChange={(e) => setButtonLink(e.target.value)}
                    />
                </div>

                <div className="flex justify-end mt-4 gap-4">
                    <Link href="/story">
                        <Button variant="outline">Cancel</Button>
                    </Link>
                    <Button 
                        onClick={handleUpdate}
                        disabled={isSaving}
                        className="bg-green-600 hover:bg-green-700 text-white"
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
