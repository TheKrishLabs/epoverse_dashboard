"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, X, ImageIcon, VideoIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { mediaService } from "@/services/media-service";

const formSchema = z.object({
  thumbHeight: z.string().min(1, "Height is required"),
  thumbWidth: z.string().min(1, "Width is required"),
  largeHeight: z.string().min(1, "Height is required"),
  largeWidth: z.string().min(1, "Width is required"),
  caption: z.string().optional(),
  reference: z.string().optional(),
});

interface PhotoUploadFormProps {
  onUploadSuccess?: () => void;
}

export function PhotoUploadForm({ onUploadSuccess }: PhotoUploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<'image' | 'video' | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      thumbHeight: "240",
      thumbWidth: "438",
      largeHeight: "585",
      largeWidth: "1067",
      caption: "",
      reference: "",
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const isVideo = selectedFile.type.startsWith('video/');
      const maxSize = isVideo ? 50 * 1024 * 1024 : 5 * 1024 * 1024; // 50MB for video, 5MB for img

      if (selectedFile.size > maxSize) {
        alert(`File size must be less than ${isVideo ? '50MB' : '5MB'}`);
        return;
      }
      setFile(selectedFile);
      setPreviewType(isVideo ? 'video' : 'image');
      
      const URL = window.URL || window.webkitURL;
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const clearFile = () => {
    setFile(null);
    if (preview) {
        URL.revokeObjectURL(preview);
    }
    setPreview(null);
    setPreviewType(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!file) {
      alert("Please select an image");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      // The backend explicitly requests the key "file" for both images and videos
      formData.append("file", file); 
      formData.append("thumbHeight", values.thumbHeight);
      formData.append("thumbWidth", values.thumbWidth);
      formData.append("largeHeight", values.largeHeight);
      formData.append("largeWidth", values.largeWidth);
      if (values.caption) formData.append("caption", values.caption);
      if (values.reference) formData.append("reference", values.reference);

      await mediaService.uploadPhoto(formData);
      alert("Media uploaded successfully!");
      
      // Reset form
      form.reset();
      clearFile();
      onUploadSuccess?.();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(error);
      const msg = error?.response?.data?.message || error?.message || "Failed to upload media.";
      alert(msg);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-card rounded-lg border shadow-sm p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-1">Upload Media</h2>
        <p className="text-sm text-muted-foreground">Upload and configure your image or video details.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid gap-8 md:grid-cols-2">
            {/* Thumb Image Size */}
            <div className="space-y-4">
              <h3 className="font-medium">Thumb Image Size</h3>
              <FormField
                control={form.control}
                name="thumbHeight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Height (Y) <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="thumbWidth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Width (X) <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Large Image Size */}
            <div className="space-y-4">
              <h3 className="font-medium">Large Image Size</h3>
              <FormField
                control={form.control}
                name="largeHeight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Height (Y) <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="largeWidth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Width (X) <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
             {/* File Upload */}
            <div className="space-y-4">
                 <FormLabel className="block">Media File <span className="text-red-500">*</span></FormLabel>
                 <div className="flex gap-2">
                     <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                     >
                        Browse...
                     </Button>
                     <Input
                        readOnly
                        value={file ? file.name : "No file selected."}
                        className="flex-1 cursor-default focus-visible:ring-0"
                     />
                     <input
                        type="file"
                        className="hidden"
                        ref={fileInputRef}
                        accept="image/*,video/*"
                        onChange={handleFileChange}
                     />
                 </div>
                 <p className="text-xs text-yellow-600 font-medium">* Image Max 5 MB | Video Max 50 MB</p>
                 
                 {preview && (
                    <div className="relative mt-4 aspect-video w-full max-w-sm rounded-lg overflow-hidden border bg-muted flex items-center justify-center">
                        {previewType === 'video' ? (
                            <video src={preview} controls className="w-full h-full object-contain" />
                        ) : (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={preview} alt="Preview" className="w-full h-full object-contain" />
                        )}
                        <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-6 w-6"
                            onClick={clearFile}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                 )}
                 {!preview && (
                     <div className="mt-4 aspect-video w-full max-w-sm rounded-lg border border-dashed flex items-center justify-center bg-muted/30">
                         <div className="flex flex-col items-center text-muted-foreground">
                             <div className="flex gap-2 mb-2 opacity-50">
                                <ImageIcon className="h-8 w-8" />
                                <VideoIcon className="h-8 w-8" />
                             </div>
                             <span className="text-xs">Media Preview</span>
                         </div>
                     </div>
                 )}
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
             <FormField
                control={form.control}
                name="caption"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Caption</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Caption" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reference</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Reference" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
          </div>

          <div className="flex items-center gap-4 pt-4">
             <Button 
                type="button" 
                variant="destructive" 
                size="icon"
                onClick={() => {
                    form.reset();
                    clearFile();
                }}
             >
                <X className="h-4 w-4" />
             </Button>
             <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white" disabled={isUploading}>
               {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
               {isUploading ? "Uploading..." : "Upload Media"}
             </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
