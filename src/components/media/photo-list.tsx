"use client";

import { useState, useEffect, useCallback } from "react";
import { Trash2, Copy, Eye, Loader2, RefreshCcw } from "lucide-react";
import { format } from "date-fns";

import { mediaService, Photo } from "@/services/media-service";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function PhotoList() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [page] = useState(1);
  
  // Details Modal State
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);
  const [detailedPhoto, setDetailedPhoto] = useState<Photo | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  
  // Toggle Soft Delete State
  const [photoToToggle, setPhotoToToggle] = useState<Photo | null>(null);
  const [isToggling, setIsToggling] = useState(false);
  
  const fetchPhotos = useCallback(async () => {
    setIsLoading(true);
    setError(false);
    try {
      const data = await mediaService.getPhotos(page, 20); 
      setPhotos(data.photos || []); 
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  const executeToggleStatus = async () => {
    if (!photoToToggle) return;
    setIsToggling(true);
    try {
      await mediaService.toggleSoftDeletePhoto(photoToToggle._id);
      
      // Optimistically update the exact card in the UI without re-fetching everything
      setPhotos(prev => prev.map(p => {
          if (p._id === photoToToggle._id) {
              return { 
                  ...p, 
                  status: p.status === 'Deleted' ? 'Active' : 'Deleted' 
              };
          }
          return p;
      }));
      setPhotoToToggle(null);
    } catch (error) {
       console.error("Failed to toggle photo status", error);
       alert("Failed to change photo status.");
    } finally {
       setIsToggling(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("URL copied to clipboard!");
  }

  const handleViewDetails = async (id: string) => {
    setSelectedPhotoId(id);
    setIsLoadingDetails(true);
    setDetailedPhoto(null);
    try {
        const photo = await mediaService.getPhotoById(id);
        setDetailedPhoto(photo);
    } catch (err) {
        console.error("Failed to load photo details", err);
        alert("Failed to fetch image details.");
        setSelectedPhotoId(null);
    } finally {
        setIsLoadingDetails(false);
    }
  };

  const closeDetails = () => {
      setSelectedPhotoId(null);
      setDetailedPhoto(null);
  };

  if (isLoading && photos.length === 0) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="space-y-2 animate-pulse">
                    <div className="h-48 w-full rounded-md bg-muted" />
                    <div className="h-4 w-3/4 bg-muted" />
                    <div className="h-4 w-1/2 bg-muted" />
                </div>
            ))}
        </div>
    );
  }

  if (error) {
      return (
          <div className="flex flex-col items-center justify-center p-12 text-center">
              <p className="text-red-500 mb-4">Failed to load photos.</p>
              <Button onClick={fetchPhotos}>Try Again</Button>
          </div>
      )
  }

  if (photos.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground border rounded-lg border-dashed">
              <p>No photos found.</p>
          </div>
      )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {photos.map((photo) => {
          const isDeleted = photo.status === 'Deleted';
          return (
          <Card key={photo._id} className="overflow-hidden group relative">
             <div 
                 className={`relative aspect-video bg-muted overflow-hidden transition-opacity ${isDeleted ? 'opacity-50 grayscale' : ''}`}
             >
                 {/* eslint-disable-next-line @next/next/no-img-element */}
               <img 
                 src={photo.thumbnailUrl || photo.url} 
                 alt={photo.caption || "Photo"} 
                 className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
               />

               {isDeleted && (
                   <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                       <span className="bg-red-500/90 text-white px-3 py-1 font-bold tracking-widest text-sm rounded shadow-lg border border-red-700">
                           DELETED
                       </span>
                   </div>
               )}
             </div>
            <CardContent className="p-4 space-y-2">
               {photo.caption && <p className="font-medium truncate" title={photo.caption}>{photo.caption}</p>}
               <p className="text-xs text-muted-foreground truncate" title={photo.url}>{photo.url}</p>
               <div className="flex justify-between text-xs text-muted-foreground">
                   <span>
                       {photo.dimensions?.large?.width}x{photo.dimensions?.large?.height}
                   </span>
                   <span>
                       {format(new Date(photo.createdAt), 'MMM dd, yyyy')}
                   </span>
               </div>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex justify-between items-center bg-gray-50/50">
                <div className="flex items-center gap-1">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        onClick={() => handleViewDetails(photo._id)}
                        title="Preview Image"
                    >
                        <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                        onClick={() => copyToClipboard(photo.url)}
                        title="Copy URL"
                    >
                        <Copy className="h-4 w-4" />
                    </Button>
                </div>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className={`h-8 w-8 ${isDeleted ? "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50" : "text-destructive hover:text-destructive hover:bg-destructive/10"}`} 
                    onClick={() => setPhotoToToggle(photo)}
                    title={isDeleted ? "Restore Photo" : "Soft Delete Photo"}
                >
                    {isDeleted ? <RefreshCcw className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
                </Button>
            </CardFooter>
          </Card>
        )})}
      </div>
      {/* Pagination controls would go here */}

      {/* Media Details Modal API Integration */}
      <Dialog open={!!selectedPhotoId} onOpenChange={(open) => !open && closeDetails()}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Image Details</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col md:flex-row gap-6">
              {/* Left Column: Image Display */}
             <div className="flex-1 min-h-[300px] bg-muted flex items-center justify-center rounded-md border overflow-hidden relative">
                 {isLoadingDetails ? (
                     <div className="flex flex-col items-center text-muted-foreground">
                         <Loader2 className="h-8 w-8 animate-spin mb-2" />
                         <span>Fetching API Data...</span>
                     </div>
                 ) : detailedPhoto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={detailedPhoto.url} 
                      alt={detailedPhoto.caption || "Detailed view"} 
                      className="max-h-[500px] object-contain w-full h-full"
                    />
                 ) : (
                     <span className="text-muted-foreground">Image not found</span>
                 )}
             </div>

             {/* Right Column: Metadata Extracted from GET /api/media/:id */}
             <div className="w-full md:w-64 space-y-6">
                 {detailedPhoto && (
                     <>
                        <div>
                            <h4 className="font-semibold text-sm mb-1">Caption</h4>
                            <p className="text-sm text-muted-foreground break-words">{detailedPhoto.caption || "No caption"}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm mb-1">Original Dimensions</h4>
                            <p className="text-sm text-muted-foreground font-mono bg-muted py-1 px-2 rounded w-fit">
                                {detailedPhoto.dimensions?.large?.width || "?"} x {detailedPhoto.dimensions?.large?.height || "?"}
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm mb-1">Upload Date</h4>
                            <p className="text-sm text-muted-foreground">
                                {detailedPhoto.createdAt ? format(new Date(detailedPhoto.createdAt), 'PPP') : "Unknown"}
                            </p>
                        </div>
                         <div>
                            <h4 className="font-semibold text-sm mb-1">Status</h4>
                            <span className={`text-xs px-2 py-1 rounded-full text-white ${detailedPhoto.status === 'Deleted' ? 'bg-red-500' : 'bg-emerald-500'}`}>
                                {detailedPhoto.status || "Active"}
                            </span>
                        </div>
                         <div>
                            <h4 className="font-semibold text-sm mb-1">Direct URL</h4>
                            <div className="flex gap-2">
                                <Button 
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white dark:bg-green-700 dark:hover:bg-green-800"
                                    onClick={() => copyToClipboard(detailedPhoto.url)}
                                >
                                    <Copy className="h-4 w-4 mr-2" /> Copy link
                                </Button>
                            </div>
                        </div>
                     </>
                 )}
             </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Modal for Toggle Delete/Restore */}
      <AlertDialog open={!!photoToToggle} onOpenChange={(open) => !open && setPhotoToToggle(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
                {photoToToggle?.status === 'Deleted' ? 'Restore this Photo?' : 'Delete this Photo?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {photoToToggle?.status === 'Deleted' 
                ? "This photo is currently hidden in the Trash. Restoring it will make it visible and active again across the platform."
                : "This photo will be soft-deleted. It will no longer be visible to normal users, but will be safely retained in the Trash until permanently purged."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isToggling}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
                onClick={(e) => { e.preventDefault(); executeToggleStatus(); }}
                disabled={isToggling}
                className={photoToToggle?.status === 'Deleted' ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-destructive hover:bg-destructive/90 text-destructive-foreground"}
            >
                {isToggling ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing</>
                ) : (
                    photoToToggle?.status === 'Deleted' ? 'Yes, Restore' : 'Yes, Delete'
                )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
