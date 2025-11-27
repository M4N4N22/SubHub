"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import { GatingSelector } from "./GatingSelector";
import { useUploadContent } from "./useUploadContent";
import { useCreatorPlans } from "@/hooks/useCreatorPlans";
import { useCreatorTiers } from "@/hooks/membership/useCreatorTiers";

import { ContentForm } from "./ContentForm";
import { UploadMedia } from "./UploadMedia";
import { MediaPreview } from "./MediaPreview";

export default function UploadContent() {
  const { plans } = useCreatorPlans();
  const { tiers } = useCreatorTiers();
  const { loading, handleUpload } = useUploadContent();

  const [form, setForm] = useState({
    title: "",
    description: "",
  });

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [gate, setGate] = useState(0); // GateType.PUBLIC
  const [planId, setPlanId] = useState("");
  const [tierId, setTierId] = useState("");

  async function onSubmit(e: any) {
    e.preventDefault();
    if (!file) return toast.error("Select a media file");

    try {
      const { metaCid } = await handleUpload({
        file,
        title: form.title,
        description: form.description,
        gate,
        planId,
        tierId,
      });

      toast.success("Content uploaded", {
        description: `CID: ${metaCid}`,
      });

      // Reset UI
      setForm({ title: "", description: "" });
      setPreview("");
      setFile(null);
      setPlanId("");
      setTierId("");
      setGate(0);
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload content");
    }
  }

  return (
    <div className="container mx-auto max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Upload Exclusive Content</h1>

      <form onSubmit={onSubmit} className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* LEFT COLUMN */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Content Details</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">

            <ContentForm
              title={form.title}
              description={form.description}
              setTitle={(v) => setForm({ ...form, title: v })}
              setDescription={(v) => setForm({ ...form, description: v })}
            />

            <UploadMedia
              selectedFile={file}
              setSelectedFile={setFile}
              mediaPreview={preview}
              setMediaPreview={setPreview}
              disabled={loading}
            />

            <GatingSelector
              gate={gate}
              setGate={setGate}
              planId={planId}
              setPlanId={setPlanId}
              tierId={tierId}
              setTierId={setTierId}
              creatorPlans={plans}
              creatorTiers={tiers}
            />

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Uploading..." : "Upload Content"}
            </Button>
          </CardContent>
        </Card>

        {/* RIGHT COLUMN — Preview */}
        <Card className="lg:col-span-2 h-fit">
          <CardHeader>
            <CardTitle>Live Preview</CardTitle>
          </CardHeader>

          <CardContent>
            <MediaPreview
              title={form.title}
              description={form.description}
              mediaPreview={preview}
            />
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
