
"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Trash2, 
  X,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { storyService } from "@/services/story-service";
import { languageService, Language } from "@/services/language-service";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface TemporaryStory {
  id: string; // Unique ID for temp list
  language: string;
  title: string;
  imageFile: File;
  buttonText: string;
  buttonLink: string;
}

export default function StoryCreatePage() {
  const router = useRouter();
  const [language, setLanguage] = useState("");
  const [title, setTitle] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [buttonText, setButtonText] = useState("");
  const [buttonLink, setButtonLink] = useState("");

  const [tempStories, setTempStories] = useState<TemporaryStory[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [isLoadingLanguages, setIsLoadingLanguages] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const data = await languageService.getLanguages();
        setLanguages(data || []);
      } catch (err) {
        console.error("Failed to fetch languages", err);
      } finally {
        setIsLoadingLanguages(false);
      }
    };
    fetchLanguages();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        setError("Image size must be less than 2MB");
        return;
      }
      setImage(file);
      setError(null);
    }
  };

  const handleAddStory = () => {
    if (!language) {
      setError("Language is required");
      return;
    }
    if (!title) {
        setError("Story Title is required");
        return;
    }
    if (!image) {
        setError("Story Image is required");
        return;
    }

    if (tempStories.some(s => s.title.toLowerCase().trim() === title.toLowerCase().trim())) {
        setError("A story with this title is already in your queue.");
        return;
    }

    const newStory: TemporaryStory = {
      id: Date.now().toString(),
      language,
      title,
      imageFile: image,
      buttonText,
      buttonLink
    };

    setTempStories([...tempStories, newStory]);
    
    // Reset form fields but keep language for convenience? 
    // Usually better to clear everything or keep specific ones. 
    // Clearing all for now based on typical "Add" behavior.
    setTitle("");
    setImage(null);
    setButtonText("");
    setButtonLink("");
    setError(null);
  };

  const handleRemoveStory = (id: string) => {
    setTempStories(tempStories.filter(s => s.id !== id));
  };

  const handleSaveAll = async () => {
    if (tempStories.length === 0) {
      setError("Please add at least one story before saving.");
      return;
    }

    setIsSaving(true);
    try {
        // 1. Construct FormData for the create endpoint
        const formData = new FormData();
        formData.append("title", tempStories[0].title);
        formData.append("language", tempStories[0].language); // lowercase root field

        tempStories.forEach((story, index) => {
            formData.append(`items[${index}][title]`, story.title);
            formData.append(`items[${index}][language]`, story.language);
            formData.append(`items[${index}][buttonText]`, story.buttonText);
            formData.append(`items[${index}][buttonLink]`, story.buttonLink);
            // Attach the File object directly to storyImage
            formData.append(`items[${index}][storyImage]`, story.imageFile);
        });

        await storyService.createStory(formData);

        setSuccess("Stories saved successfully!");
        setTempStories([]);
        setLanguage(""); // Clear language only on final save
        setTimeout(() => {
            setSuccess(null);
            router.push('/story');
        }, 1500);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.error("Failed to save stories", error);
        
        let errorMsg = "Failed to save stories. Please try again.";
        if (error?.response?.status === 409) {
            errorMsg = "A story with this title already exists on the server.";
        } else if (error?.response?.data?.message) {
            errorMsg = error.response.data.message;
        }

        setError(errorMsg);
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
       <Card className="dark:bg-sidebar dark:border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold">Story create</CardTitle>
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

            <div className="grid gap-4 py-4">
                {/* Row 1: Language & Story Title */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="language">Language <span className="text-red-500">*</span></Label>
                        <Select value={language} onValueChange={setLanguage}>
                            <SelectTrigger>
                                <SelectValue placeholder={isLoadingLanguages ? "Loading..." : "Select Language"} />
                            </SelectTrigger>
                            <SelectContent>
                                {languages.map((lang) => (
                                    <SelectItem key={lang._id} value={lang._id}>
                                        {lang.name}
                                    </SelectItem>
                                ))}
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
                         <div className="flex items-center gap-2">
                            <label 
                                htmlFor="image-upload" 
                                className="cursor-pointer inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-10 px-4 py-2"
                            >
                                Choose File
                            </label>
                            <span className="text-sm text-muted-foreground">
                                {image ? image.name : "No file chosen"}
                            </span>
                            <input 
                                id="image-upload" 
                                type="file" 
                                className="hidden" 
                                accept="image/*"
                                onChange={handleImageChange}
                            />
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

                <div className="flex justify-end mt-4">
                    <Button 
                        onClick={handleAddStory}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        Add story
                    </Button>
                </div>
            </div>

            {/* Temporary Table */}
            <div className="rounded-md border mt-6">
                <Table>
                    <TableHeader className="bg-gray-100 dark:bg-muted/20">
                        <TableRow>
                            <TableHead>Image</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Text</TableHead>
                            <TableHead>Link</TableHead>
                            <TableHead className="w-[100px]">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tempStories.length > 0 ? (
                            tempStories.map((story) => (
                                <TableRow key={story.id}>
                                    <TableCell className="max-w-[150px] truncate" title={story.imageFile.name}>{story.imageFile.name}</TableCell>
                                    <TableCell className="font-medium max-w-[200px] truncate" title={story.title}>{story.title}</TableCell>
                                    <TableCell>{story.buttonText}</TableCell>
                                    <TableCell>{story.buttonLink}</TableCell>
                                    <TableCell>
                                         <Button 
                                            size="icon" 
                                            variant="ghost" 
                                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                            onClick={() => handleRemoveStory(story.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                    No stories added yet.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex justify-end mt-6">
                <Button 
                    onClick={handleSaveAll} 
                    disabled={isSaving}
                    className="bg-green-600 hover:bg-green-700 text-white w-32"
                >
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {isSaving ? "Saving..." : "Save"}
                </Button>
            </div>

        </CardContent>
       </Card>
    </div>
  );
}
