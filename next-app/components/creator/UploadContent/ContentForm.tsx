"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type Props = {
  title: string;
  description: string;
  setTitle: (v: string) => void;
  setDescription: (v: string) => void;
};

export function ContentForm({ title, description, setTitle, setDescription }: Props) {
  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <Label>Title</Label>
        <Input
          placeholder="Enter a catchy title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* Description */}
      <div>
        <Label>Description</Label>
        <Textarea
          placeholder="Describe your content..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
    </div>
  );
}
