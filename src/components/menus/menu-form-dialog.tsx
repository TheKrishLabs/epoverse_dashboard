"use client";

import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Loader2 } from "lucide-react";
import { menuService, MenuData } from "@/services/menu-service";

interface MenuFormDialogProps {
  onSuccess: () => void;
  initialData?: MenuData;
  mode?: 'create' | 'edit';
  trigger?: React.ReactNode;
}

export function MenuFormDialog({ 
  onSuccess, 
  initialData, 
  mode = 'create',
  trigger 
}: MenuFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(initialData?.name || "");
  const [location, setLocation] = useState(initialData?.location || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = mode === 'edit';

  // Sync state with initialData when it changes (for edit mode)
  useEffect(() => {
    if (open && initialData) {
      setName(initialData.name || "");
      setLocation(initialData.location || "");
    }
  }, [open, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !location) {
      setError("Please fill in all fields.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (isEdit && initialData) {
        const id = initialData.id || initialData._id;
        if (!id) throw new Error("Menu ID is missing.");
        await menuService.updateMenu(id, { name, location });
        alert("Menu updated successfully!");
      } else {
        await menuService.createMenu({ name, location });
        alert("Menu created successfully!");
      }
      
      if (!isEdit) {
        setName("");
        setLocation("");
      }
      setOpen(false);
      onSuccess();
    } catch (err) {
      console.error(`Failed to ${mode} menu:`, err);
      setError(`Failed to ${mode} menu. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-[#198754] hover:bg-[#157347] text-white rounded-[3px] h-9 px-4 shadow-none">
            <Plus className="h-4 w-4 mr-1.5" /> Add New Menu
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Update Menu" : "Create New Menu"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Menu Name <span className="text-red-500">*</span></Label>
            <Input
              id="name"
              placeholder="e.g. Top Menu"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location <span className="text-red-500">*</span></Label>
            <Input
              id="location"
              placeholder="e.g. position"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-[#198754] hover:bg-[#157347] text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEdit ? "Updating..." : "Creating..."}
                </>
              ) : (
                isEdit ? "Update Menu" : "Create Menu"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
