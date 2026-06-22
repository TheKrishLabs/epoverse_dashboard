"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { UploadCloud, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Advertisement, advertisementService } from "@/services/advertisement-service";
import { languageService, Language } from "@/services/language-service";
import { cn } from "@/lib/utils";

const adSchema = z.object({
  theme: z.string().min(1, "Theme is required"),
  page: z.enum(["home", "category", "details"]),
  position: z.number().min(1, "Position must be at least 1"),
  adType: z.enum(["script", "image"]),
  language: z.string().min(1, "Language is required"),
  embedCode: z.string().optional(),
  adRedirectUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  status: z.enum(["Active", "Inactive"]),
}).refine((data) => {
  if (data.adType === "script" && !data.embedCode) {
    return false;
  }
  return true;
}, {
  message: "Embed code is required for script ads",
  path: ["embedCode"],
}).refine((data) => {
  const limits: Record<string, number> = {
    home: 5,
    category: 5,
    details: 4
  };
  return data.position <= limits[data.page];
}, {
  message: "Invalid position for selected page",
  path: ["position"],
});

type AdFormValues = z.infer<typeof adSchema>;

interface AdFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Advertisement | null;
  onSuccess: () => void;
}

export function AdFormDialog({ open, onOpenChange, initialData, onSuccess }: AdFormDialogProps) {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const isEditing = !!initialData;

  const form = useForm<AdFormValues>({
    resolver: zodResolver(adSchema),
    defaultValues: {
      theme: "Classic",
      page: "home",
      position: 1,
      adType: "script",
      language: "",
      embedCode: "",
      adRedirectUrl: "",
      status: "Active",
    } as AdFormValues,
  });

  const selectedPage = form.watch("page");
  const selectedAdType = form.watch("adType");

  const getPositionLimit = (page: string) => {
    const limits: Record<string, number> = {
      home: 5,
      category: 5,
      details: 4
    };
    return limits[page] || 1;
  };

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const langs = await languageService.getLanguages();
        setLanguages(langs);
      } catch (error) {
        console.error("Failed to fetch languages", error);
      }
    };
    fetchLanguages();
  }, []);

  useEffect(() => {
    if (initialData) {
      form.reset({
        theme: initialData.theme,
        page: (initialData.page === 'home' || initialData.page === 'category' || initialData.page === 'details') ? initialData.page : 'home',
        position: initialData.position,
        adType: initialData.adType,
        language: initialData.language,
        embedCode: initialData.embedCode || "",
        adRedirectUrl: initialData.adRedirectUrl || "",
        status: initialData.status,
      });
      setImagePreview(initialData.imageUrl || null);
    } else {
      form.reset({
        theme: "Classic",
        page: "home",
        position: 1,
        adType: "script",
        language: "",
        embedCode: "",
        adRedirectUrl: "",
        status: "Active",
      });
      setImagePreview(null);
      setImageFile(null);
    }
  }, [initialData, form, open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  async function onSubmit(values: AdFormValues) {
    try {
      const payload = {
        ...values,
        image: imageFile || undefined
      };

      if (isEditing && initialData?._id) {
        await advertisementService.updateAd(initialData._id, payload);
        alert("Advertisement updated successfully!");
      } else {
        // Validation for new image ad
        if (values.adType === 'image' && !imageFile) {
          alert("Image file is required for image ads");
          return;
        }
        await advertisementService.createAd(payload);
        alert("Advertisement created successfully!");
      }
      onSuccess();
      onOpenChange(false);
      form.reset();
      removeImage();
    } catch (error) {
      console.error("Failed to save advertisement", error);
      alert("Failed to save advertisement. Please try again.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Advertisement" : "New Advertise"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="theme"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Theme</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select theme" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Classic">Classic</SelectItem>
                        <SelectItem value="Modern">Modern</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Language</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {languages.map(lang => (
                          <SelectItem key={lang._id} value={lang._id}>{lang.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="page"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Page</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select page" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="home">Home page</SelectItem>
                        <SelectItem value="category">Category page</SelectItem>
                        <SelectItem value="details">Details page</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ads Position (Max: {getPositionLimit(selectedPage)})</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={1} 
                        max={getPositionLimit(selectedPage)} 
                        {...field} 
                        onChange={e => field.onChange(e.target.value ? Number(e.target.value) : "")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="adType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ad Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="script">Script Ad</SelectItem>
                      <SelectItem value="image">Image Ad</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedAdType === "script" ? (
              <FormField
                control={form.control}
                name="embedCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Embed Code</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="<script>...</script>" 
                        {...field} 
                        className="font-mono text-xs"
                      />
                    </FormControl>
                    <FormDescription>Required for script ads</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <FormLabel>Ad Image</FormLabel>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors",
                      imagePreview ? "border-emerald-500" : "border-gray-300"
                    )}
                  >
                    {imagePreview ? (
                      <div className="relative w-full aspect-[3/1] max-h-[150px]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="w-full h-full object-contain"
                        />
                        <button 
                          type="button"
                          onClick={(e) => { e.stopPropagation(); removeImage(); }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <UploadCloud className="h-10 w-10 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">Click to upload ad banner</p>
                      </>
                    )}
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                </div>
                <FormField
                  control={form.control}
                  name="adRedirectUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Redirect URL (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button 
                type="submit" 
                className="bg-[#198754] hover:bg-[#157347] text-white px-8"
              >
                {isEditing ? "Update" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
