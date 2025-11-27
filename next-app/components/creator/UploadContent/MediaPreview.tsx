"use client";

import Image from "next/image";

type Props = {
  title: string;
  description: string;
  mediaPreview: string;
};

export function MediaPreview({ title, description, mediaPreview }: Props) {
  return (
    <div className="w-full flex flex-col items-center text-center">
      {/* Media */}
      {mediaPreview ? (
        <>
          {mediaPreview.endsWith(".mp4") ? (
            <video
              controls
              className="w-full rounded-lg mb-4"
              src={mediaPreview}
            />
          ) : mediaPreview.endsWith(".mp3") ? (
            <audio controls className="w-full mb-4" src={mediaPreview} />
          ) : (
            <Image
              src={mediaPreview}
              alt="Preview"
              width={500}
              height={280}
              className="rounded-lg object-cover mb-4"
            />
          )}
        </>
      ) : (
        <div className="w-full h-56 flex items-center justify-center border border-dashed border-primary rounded-3xl mb-4 text-muted-foreground">
          Media Preview
        </div>
      )}

      {/* Title */}
      <h3 className="text-xl font-semibold mb-2">
        {title || "Your title will appear here"}
      </h3>

      {/* Description */}
      <p className="text-sm text-muted-foreground">{description || "Your description will appear here"}</p>
    </div>
  );
}
