"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Trash2, Copy, Eye, Loader2, RefreshCcw, Search, Filter } from "lucide-react";
import { format } from "date-fns";

import { mediaService, Photo } from "@/services/media-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Badge } from "@/components/ui/badge";

export function PhotoList() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [page] = useState(1);
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  
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
      const data = await mediaService.getPhotos(page, 100); // Fetching more to allow client-side filtering
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

  // Derived State (Filtering and Sorting)
  const filteredAndSortedPhotos = useMemo(() => {
    let result = [...photos];

    // Filter by Status
    if (statusFilter !== 'all') {
      const isDeletedFilter = statusFilter === 'deleted';
      result = result.filter(p => (p.status === 'Deleted') === isDeletedFilter);
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        (p.caption && p.caption.toLowerCase().includes(query)) ||
        (p.url && p.url.toLowerCase().includes(query)) ||
        (p.reference && p.reference.toLowerCase().includes(query))
      );
    }

    // Sort
    result.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [photos, statusFilter, searchQuery, sortOrder]);


  const executeToggleStatus = async () => {
    if (!photoToToggle) return;
    setIsToggling(true);
    try {
      await mediaService.toggleSoftDeletePhoto(photoToToggle._id);
      
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
       console.error("Failed to delete photo", error);
       alert("Failed to delete photo.");
    } finally {
       setIsToggling(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("URL copied to clipboard!");
  }

  const handleViewDetails = (photo: Photo) => {
    setSelectedPhotoId(photo._id);
    setDetailedPhoto(photo);
  };

  const closeDetails = () => {
      setSelectedPhotoId(null);
      setDetailedPhoto(null);
  };

  if (error) {
      return (
          <div className="flex flex-col items-center justify-center p-12 text-center">
              <p className="text-red-500 mb-4">Failed to load photos.</p>
              <Button onClick={fetchPhotos}>Try Again</Button>
          </div>
      )
  }

  return (
    <div className="space-y-6">
      
      {/* Top Bar: Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 bg-card p-4 rounded-lg border shadow-sm items-center justify-between">
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by caption or URL..." 
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="deleted">Trash/Deleted</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && photos.length === 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                <div key={i} className="space-y-2 animate-pulse">
                    <div className="aspect-square w-full rounded-lg bg-muted" />
                    <div className="h-3 w-3/4 bg-muted rounded" />
                    <div className="h-3 w-1/2 bg-muted rounded" />
                </div>
            ))}
        </div>
      ) : filteredAndSortedPhotos.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center text-muted-foreground border rounded-lg border-dashed bg-muted/20">
              <p className="text-lg font-medium mb-1">No media found.</p>
              <p className="text-sm">Try adjusting your search or filters.</p>
          </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 lg:gap-6">
          {filteredAndSortedPhotos.map((photo) => {
            const isDeleted = photo.status === 'Deleted';
            return (
            <Card key={photo._id} className="overflow-hidden rounded-2xl group relative flex flex-col hover:shadow-xl transition-all duration-300 border-border/40 hover:border-primary/30 bg-card p-2">
               <div 
                   className={`relative aspect-square bg-muted/30 overflow-hidden rounded-xl transition-all duration-300 cursor-pointer ${isDeleted ? 'opacity-60 grayscale' : ''}`}
                   onClick={() => handleViewDetails(photo)}
               >
                 {/* eslint-disable-next-line @next/next/no-img-element */}
                 <img 
                   src={photo.thumbnailUrl || photo.url} 
                   alt={photo.caption || "Photo"} 
                   className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                   loading="lazy"
                 />
  
                 {isDeleted && (
                     <div className="absolute top-2 left-2 pointer-events-none">
                         <Badge variant="destructive" className="shadow-sm font-semibold tracking-wide text-[10px]">DELETED</Badge>
                     </div>
                 )}
                 
                 <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3">
                    <Button 
                        variant="secondary" 
                        size="icon" 
                        className="h-10 w-10 rounded-full bg-white/20 hover:bg-white/50 text-white border-0 shadow-lg backdrop-blur-sm transition-all hover:scale-110"
                        onClick={(e) => { e.stopPropagation(); handleViewDetails(photo); }}
                    >
                        <Eye className="h-5 w-5" />
                    </Button>
                    <Button 
                        variant="secondary" 
                        size="icon" 
                        className="h-10 w-10 rounded-full bg-white/20 hover:bg-white/50 text-white border-0 shadow-lg backdrop-blur-sm transition-all hover:scale-110"
                        onClick={(e) => { e.stopPropagation(); copyToClipboard(photo.url); }}
                    >
                        <Copy className="h-5 w-5" />
                    </Button>
                 </div>
               </div>
              <CardContent className="p-3 pb-1 flex-1 flex flex-col justify-between">
                 <div>
                   <p className="text-sm font-semibold line-clamp-1 mb-1 text-foreground/90 group-hover:text-primary transition-colors" title={photo.caption || photo.url.split('/').pop()}>
                     {photo.caption || photo.url.split('/').pop()}
                   </p>
                   {photo.dimensions?.large?.width && photo.dimensions?.large?.height && (
                     <p className="text-[11px] text-muted-foreground/70 truncate font-medium" title={photo.url}>
                       {photo.dimensions.large.width} × {photo.dimensions.large.height}
                     </p>
                   )}
                 </div>
              </CardContent>
              <CardFooter className="p-3 pt-2 flex justify-between items-center mt-auto">
                  <span className="text-[11px] text-muted-foreground/60 font-medium">
                      {format(new Date(photo.createdAt || Date.now()), 'MMM d, yyyy')}
                  </span>
                  <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 text-destructive/70 hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors"
                      onClick={() => setPhotoToToggle(photo)}
                      title="Permanently Delete Photo"
                  >
                      <Trash2 className="h-3.5 w-3.5" />
                  </Button>
              </CardFooter>
            </Card>
          )})}
        </div>
      )}

      {/* Media Details Modal */}
      <Dialog open={!!selectedPhotoId} onOpenChange={(open) => !open && closeDetails()}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-background">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle>Media Details</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col md:flex-row">
              {/* Left Column: Image Display */}
             <div className="flex-1 min-h-[400px] bg-muted/30 flex items-center justify-center p-6 border-r relative group">
                 {isLoadingDetails ? (
                     <div className="flex flex-col items-center text-muted-foreground">
                         <Loader2 className="h-8 w-8 animate-spin mb-2" />
                         <span className="text-sm">Fetching Image Details...</span>
                     </div>
                 ) : detailedPhoto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={detailedPhoto.url} 
                      alt={detailedPhoto.caption || "Detailed view"} 
                      className="max-h-[60vh] object-contain drop-shadow-md rounded"
                    />
                 ) : (
                     <span className="text-muted-foreground">Image not found</span>
                 )}
             </div>

             {/* Right Column: Metadata */}
             <div className="w-full md:w-80 p-6 space-y-6 overflow-y-auto max-h-[60vh]">
                 {detailedPhoto && (
                     <>
                        <div>
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Status</h4>
                            <Badge variant={detailedPhoto.status === 'Deleted' ? 'destructive' : 'default'} className="rounded-sm">
                                {detailedPhoto.status || "Active"}
                            </Badge>
                        </div>
                        <div>
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Caption</h4>
                            <p className="text-sm font-medium">{detailedPhoto.caption || "—"}</p>
                        </div>
                        <div>
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Reference</h4>
                            <p className="text-sm font-medium">{detailedPhoto.reference || "—"}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Dimensions</h4>
                                <p className="text-sm font-mono bg-muted/50 py-1 px-2 rounded-md w-fit border border-muted">
                                    {detailedPhoto.dimensions?.large?.width || "?"} x {detailedPhoto.dimensions?.large?.height || "?"}
                                </p>
                            </div>
                            <div>
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Date Added</h4>
                                <p className="text-sm font-medium">
                                    {detailedPhoto.createdAt ? format(new Date(detailedPhoto.createdAt), 'MMM d, yyyy') : "—"}
                                </p>
                            </div>
                        </div>
                        <div className="pt-4 border-t">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Direct Link</h4>
                            <div className="flex gap-2">
                                <Input readOnly value={detailedPhoto.url} className="text-xs font-mono h-9 bg-muted/50" />
                                <Button size="icon" className="h-9 w-9 shrink-0" onClick={() => copyToClipboard(detailedPhoto.url)}>
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                     </>
                 )}
             </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Modal for Hard Delete */}
      <AlertDialog open={!!photoToToggle} onOpenChange={(open) => !open && setPhotoToToggle(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
                Delete this Photo permanently?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This photo will be permanently deleted. This action cannot be undone and will remove the photo from all linked locations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isToggling}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
                onClick={(e) => { e.preventDefault(); executeToggleStatus(); }}
                disabled={isToggling}
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
                {isToggling ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing</>
                ) : (
                    'Yes, Delete'
                )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
