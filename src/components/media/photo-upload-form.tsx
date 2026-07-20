/* eslint-disable */
"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Loader2, X, UploadCloud, ImageIcon, VideoIcon, CheckCircle, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { mediaService } from "@/services/media-service";

interface PhotoUploadFormProps {
  onUploadSuccess?: () => void;
}

interface FileWithMeta {
  file: File;
  preview: string;
  type: 'image' | 'video';
  id: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
  width?: number;
  height?: number;
}

export function PhotoUploadForm({ onUploadSuccess }: PhotoUploadFormProps) {
  const [files, setFiles] = useState<FileWithMeta[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const errors = rejectedFiles.map(r => `${r.file.name}: ${r.errors.map((e: any) => e.message).join(', ')}`);
      alert(`Some files were rejected:\n${errors.join('\n')}`);
    }

    const newFiles = acceptedFiles.map(file => {
      const isVideo = file.type.startsWith('video/');
      return {
        file,
        preview: URL.createObjectURL(file),
        type: isVideo ? 'video' : 'image',
        id: Math.random().toString(36).substring(7),
        status: 'pending',
        progress: 0,
      } as FileWithMeta;
    });

    setFiles(prev => [...prev, ...newFiles]);

    // Extract dimensions
    newFiles.forEach(fileMeta => {
        if (fileMeta.type === 'image') {
            const img = new Image();
            img.onload = () => {
                setFiles(prev => prev.map(f => f.id === fileMeta.id ? { ...f, width: img.width, height: img.height } : f));
            };
            img.src = fileMeta.preview;
        } else if (fileMeta.type === 'video') {
            const video = document.createElement('video');
            video.onloadedmetadata = () => {
                setFiles(prev => prev.map(f => f.id === fileMeta.id ? { ...f, width: video.videoWidth, height: video.videoHeight } : f));
            };
            video.src = fileMeta.preview;
        }
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif'],
      'video/*': ['.mp4', '.webm', '.ogg']
    },
    maxSize: 50 * 1024 * 1024, // 50MB max, will validate image vs video size in upload logic if needed
  });

  const removeFile = (id: string) => {
    setFiles(prev => {
      const updated = prev.filter(f => f.id !== id);
      const removed = prev.find(f => f.id === id);
      if (removed?.preview) URL.revokeObjectURL(removed.preview);
      return updated;
    });
  };

  const clearAll = () => {
    files.forEach(f => {
      if (f.preview) URL.revokeObjectURL(f.preview);
    });
    setFiles([]);
  };

  const handleUpload = async () => {
    const pendingFiles = files.filter(f => f.status === 'pending' || f.status === 'error');
    if (pendingFiles.length === 0) return;

    setIsUploading(true);

    for (let i = 0; i < pendingFiles.length; i++) {
      const currentFile = pendingFiles[i];

      // File specific validation
      const maxSize = currentFile.type === 'video' ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
      if (currentFile.file.size > maxSize) {
         setFiles(prev => prev.map(f => f.id === currentFile.id ? { ...f, status: 'error', error: `Size exceeds ${currentFile.type === 'video' ? '50MB' : '5MB'} limit` } : f));
         continue;
      }

      setFiles(prev => prev.map(f => f.id === currentFile.id ? { ...f, status: 'uploading' } : f));

      try {
        const formData = new FormData();
        formData.append("files", currentFile.file);
        
        // Use real dimensions or fallback to defaults
        formData.append("thumbHeight", currentFile.height?.toString() || "240");
        formData.append("thumbWidth", currentFile.width?.toString() || "438");
        formData.append("largeHeight", currentFile.height?.toString() || "585");
        formData.append("largeWidth", currentFile.width?.toString() || "1067");

        await mediaService.uploadPhoto(formData, (progressEvent: any) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setFiles(prev => prev.map(f => f.id === currentFile.id ? { ...f, progress: percentCompleted } : f));
          }
        });

        setFiles(prev => prev.map(f => f.id === currentFile.id ? { ...f, status: 'success', progress: 100 } : f));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error("Upload failed for", currentFile.file.name, err);
        setFiles(prev => prev.map(f => f.id === currentFile.id ? { ...f, status: 'error', error: err?.response?.data?.message || err.message || 'Upload failed' } : f));
      }
    }

    setIsUploading(false);
    onUploadSuccess?.();
  };

  return (
    <div className="bg-card rounded-lg border shadow-sm p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-1">Upload Media</h2>
        <p className="text-sm text-muted-foreground">Drag and drop multiple images or videos here.</p>
      </div>

      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors flex flex-col items-center justify-center min-h-[250px]
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'}`}
      >
        <input {...getInputProps()} />
        <UploadCloud className={`h-12 w-12 mb-4 ${isDragActive ? 'text-primary' : 'text-muted-foreground'}`} />
        <h3 className="text-lg font-medium mb-2">
          {isDragActive ? "Drop files here..." : "Drag & drop files here"}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">or click to select files</p>
        <div className="flex gap-4 text-xs text-muted-foreground/75 font-medium">
            <span>Images up to 5MB</span>
            <span>•</span>
            <span>Videos up to 50MB</span>
        </div>
      </div>

      {files.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Selected Files ({files.length})</h3>
              <Button variant="ghost" size="sm" onClick={clearAll} disabled={isUploading} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                  Clear All
              </Button>
          </div>
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            {files.map((fileMeta) => (
              <div key={fileMeta.id} className="flex items-center gap-4 p-3 rounded-lg border bg-card relative overflow-hidden group">
                  {/* Background Progress */}
                  {fileMeta.status === 'uploading' && (
                     <div 
                        className="absolute inset-0 bg-primary/5 transition-all duration-300"
                        style={{ width: `${fileMeta.progress}%` }}
                     />
                  )}
                  
                  {/* Thumbnail */}
                  <div className="h-14 w-14 shrink-0 rounded bg-muted overflow-hidden relative flex items-center justify-center z-10 border">
                    {fileMeta.type === 'video' ? (
                        <video src={fileMeta.preview} className="h-full w-full object-cover" />
                    ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={fileMeta.preview} alt={fileMeta.file.name} className="h-full w-full object-cover" />
                    )}
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0 z-10">
                      <p className="text-sm font-medium truncate" title={fileMeta.file.name}>{fileMeta.file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(fileMeta.file.size / (1024 * 1024)).toFixed(2)} MB
                        {fileMeta.width && fileMeta.height && ` • ${fileMeta.width}x${fileMeta.height}`}
                      </p>
                      
                      {fileMeta.status === 'error' && (
                          <p className="text-xs text-destructive mt-1 flex items-center"><AlertCircle className="h-3 w-3 mr-1" /> {fileMeta.error}</p>
                      )}
                      
                      {fileMeta.status === 'uploading' && (
                          <div className="mt-2 flex items-center gap-2">
                              <Progress value={fileMeta.progress} className="h-1.5" />
                              <span className="text-[10px] font-medium text-muted-foreground w-8">{fileMeta.progress}%</span>
                          </div>
                      )}
                  </div>

                  {/* Actions / Status */}
                  <div className="shrink-0 z-10 flex items-center">
                      {fileMeta.status === 'success' ? (
                          <CheckCircle className="h-5 w-5 text-emerald-500" />
                      ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={isUploading && fileMeta.status === 'uploading'}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeFile(fileMeta.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                      )}
                  </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 flex justify-end">
             <Button 
                onClick={handleUpload} 
                disabled={isUploading || !files.some(f => f.status === 'pending' || f.status === 'error')}
                className="w-full sm:w-auto"
             >
                 {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                 {isUploading ? "Uploading..." : `Upload ${files.filter(f => f.status === 'pending' || f.status === 'error').length} Files`}
             </Button>
          </div>
        </div>
      )}
    </div>
  );
}
