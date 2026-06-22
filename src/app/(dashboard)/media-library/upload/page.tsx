import { PhotoUploadForm } from "@/components/media/photo-upload-form";

export default function PhotoUploadPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h3 className="text-lg font-medium">Photo Upload</h3>
        <p className="text-sm text-muted-foreground">
          Upload new photos to your media library.
        </p>
      </div>
      <PhotoUploadForm />
    </div>
  );
}
