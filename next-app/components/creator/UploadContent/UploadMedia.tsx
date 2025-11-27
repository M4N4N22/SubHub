"use client";

import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type Props = {
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  mediaPreview: string;
  setMediaPreview: (url: string) => void;
  disabled?: boolean;
};

export function UploadMedia({
  selectedFile,
  setSelectedFile,
  mediaPreview,
  setMediaPreview,
  disabled = false,
}: Props) {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setMediaPreview(URL.createObjectURL(file));

    toast.info("File selected. Ready to upload.");
  }

  return (
    <div className="space-y-3">
      <Label>Upload Media</Label>

      <Input
        type="file"
        accept="image/*,video/*,audio/*"
        onChange={handleChange}
        disabled={disabled}
      />

      {/* Preview */}
      {mediaPreview && (
        <div className="mt-4 rounded-lg border border-muted p-2 bg-muted/20">
          {mediaPreview.endsWith(".mp4") ? (
            <video controls className="w-full rounded-md" src={mediaPreview} />
          ) : mediaPreview.endsWith(".mp3") ? (
            <audio controls className="w-full" src={mediaPreview} />
          ) : (
            <Image
              src={mediaPreview}
              alt="Preview"
              width={400}
              height={200}
              className="rounded-md object-cover mx-auto"
            />
          )}
        </div>
      )}
    </div>
  );
}
