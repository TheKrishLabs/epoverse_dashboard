"use client";

import { useState } from "react";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { postService, Category } from "@/services/post-service";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CategoryFormProps {
    initialData?: Category;
    isEditing?: boolean;
}

export function CategoryForm({ initialData, isEditing = false }: CategoryFormProps) {
    const router = useRouter();
    
    // Form State
    const [name, setName] = useState(initialData?.name || "");
    const [slug, setSlug] = useState(initialData?.slug || "");
    const [description, setDescription] = useState(initialData?.description || "");
    const [status, setStatus] = useState(initialData?.status || "Active");
    
    const [errors, setErrors] = useState<Record<string, boolean>>({});
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async () => {
        const newErrors: Record<string, boolean> = {};
        if (!name.trim()) newErrors.name = true;

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            alert("Please fill out all required fields marked with *.");
            return;
        }

        setIsSaving(true);
        try {
            // Generate a slug from the name if not provided
            let finalSlug = slug;
            if (!finalSlug.trim()) {
                finalSlug = name
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)+/g, '');
            }

            const payload = {
                name,
                slug: finalSlug,
                description,
                status
            };

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const origData: any = initialData;
            if (isEditing && (origData?.id || origData?._id)) {
                const updateId = origData.id || origData._id;
                await postService.updateCategory(updateId, payload);
                alert("Category updated successfully!");
            } else {
                 await postService.createCategory(payload);
                 alert("Category saved successfully!");
            }
            router.push("/categories");
        } catch (error) {
            console.error("Failed to save category", error);
            alert("Failed to save category. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6 max-w-2xl">
            <div className="flex items-center space-y-2">
                 <div className="flex items-center gap-4">
                     <Link href="/categories">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h2 className="text-3xl font-bold tracking-tight">{isEditing ? "Edit Category" : "Add Category"}</h2>
                </div>
            </div>

            <div className="grid gap-6 bg-card border rounded-lg p-6">
                <div className="grid gap-2">
                    <Label htmlFor="name" className={cn(errors.name && "text-red-500")}>
                        Name <span className="text-red-500">*</span>
                    </Label>
                    <Input 
                        id="name"
                        placeholder="e.g. Technology" 
                        value={name} 
                        onChange={(e) => {
                            setName(e.target.value);
                            if (errors.name) setErrors({...errors, name: false});
                        }}
                        className={cn(errors.name && "border-red-500")}
                    />
                    {errors.name && <span className="text-xs text-red-500">Name is required</span>}
                </div>
                
                <div className="grid gap-2">
                    <Label htmlFor="slug">Slug</Label>
                    <Input 
                        id="slug"
                        placeholder="e.g. technology" 
                        value={slug} 
                        onChange={(e) => setSlug(e.target.value)}
                    />
                    <p className="text-[0.8rem] text-muted-foreground">Optional: Automatically generated from name if left blank.</p>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                        id="description"
                        placeholder="A short description for this category..." 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="min-h-[100px]"
                    />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Select onValueChange={setStatus} value={status}>
                        <SelectTrigger id="status">
                            <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="flex items-center gap-4 pt-4">
                <Button size="lg" onClick={handleSubmit} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isSaving ? "Saving..." : (isEditing ? "Update Category" : "Save Category")}
                </Button>
                <Link href="/categories">
                    <Button variant="outline" size="lg">Cancel</Button>
                </Link>
            </div>
        </div>
    );
}
