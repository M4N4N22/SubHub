"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

import { useCreateTier } from "@/hooks/membership/callCreateTier";

export default function CreateMembershipTier() {
  // NEW: wagmi-based hook
  const { createTier, loading, isConnected } = useCreateTier();

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    maxSupply: "",
    royalty: "",
    mediaCid: "",
    mediaPreview: "",
  });

  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // --------------------------
  // Handle local preview
  // --------------------------
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);

    setForm((prev) => ({
      ...prev,
      mediaPreview: URL.createObjectURL(file),
    }));

    toast.info("File selected. Ready to upload.");
  };

  // --------------------------
  // Upload image to Pinata
  // --------------------------
  const handleFileUpload = async () => {
    if (!selectedFile) return toast.error("Please select an image first.");

    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", selectedFile);

      const res = await fetch("/api/upload-file-to-pinata", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();
      if (!res.ok || !data.cid) {
        toast.error("Failed to upload image");
        return;
      }

      setForm((prev) => ({
        ...prev,
        mediaCid: data.cid,
        mediaPreview: data.url,
      }));

      toast.success("Image uploaded!");
    } catch (err) {
      console.log(err);
      toast.error("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  // --------------------------
  // Submit tier
  // --------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected) return toast.error("Connect your wallet first");

    if (!form.title || !form.description || !form.price || !form.royalty)
      return toast.error("Please fill all required fields");

    if (!selectedFile) return toast.error("Select an image");

    try {
      // Step 1: upload image if needed
      if (!form.mediaCid) {
        toast.info("Uploading image...");
        await handleFileUpload();
      }

      if (!form.mediaCid) return;

      // Step 2: upload metadata JSON
      const metadata = {
        title: form.title,
        description: form.description,
        image: `ipfs://${form.mediaCid}`,
        price: form.price,
        maxSupply: form.maxSupply || "0",
        royalty: form.royalty,
        createdAt: new Date().toISOString(),
      };

      const metaRes = await fetch("/api/upload-json-to-pinata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ json: metadata }),
      });

      const metaData = await metaRes.json();
      if (!metaRes.ok || !metaData.cid) {
        toast.error("Failed to upload metadata JSON");
        return;
      }

      const metadataCid = metaData.cid;

      // Step 3: write to contract (NEW)
      await createTier({
        title: form.title,
        description: form.description,
        price: form.price,
        maxSupply: form.maxSupply || "0",
        royalty: form.royalty,
        mediaCid: form.mediaCid,
      });

      toast.success("Tier created successfully!", {
        description: `IPFS CID: ${metadataCid}`,
      });

      // Reset UI
      setForm({
        title: "",
        description: "",
        price: "",
        maxSupply: "",
        royalty: "",
        mediaCid: "",
        mediaPreview: "",
      });
      setSelectedFile(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to create tier");
    }
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Create Membership Tier</h1>
          <p className="text-muted-foreground mt-2">
            Define pricing, royalties, supply and metadata for your membership
            NFT tier.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* LEFT: Form */}
          <div className="lg:col-span-3">
            <Card className="p-6 space-y-6">
              <CardHeader>
                <CardTitle>Create a New Tier</CardTitle>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Title */}
                  <div>
                    <Label>Tier Title</Label>
                    <Input
                      placeholder="Gold Membership"
                      value={form.title}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, title: e.target.value }))
                      }
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Describe your tier benefits..."
                      value={form.description}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, description: e.target.value }))
                      }
                    />
                  </div>

                  {/* Price */}
                  <div>
                    <Label>Price (in MATIC)</Label>
                    <Input
                      placeholder="0.5"
                      value={form.price}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, price: e.target.value }))
                      }
                    />
                  </div>

                  {/* Max Supply */}
                  <div>
                    <Label>Max Supply</Label>
                    <Input
                      placeholder="0 = unlimited"
                      value={form.maxSupply}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, maxSupply: e.target.value }))
                      }
                    />
                  </div>

                  {/* Royalty */}
                  <div>
                    <Label>Royalty (bps)</Label>
                    <Input
                      placeholder="500 = 5%"
                      value={form.royalty}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, royalty: e.target.value }))
                      }
                    />
                  </div>

                  {/* Media Upload */}
                  <div>
                    <Label>Tier Image</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={loading || isUploading}
                    />

                    {form.mediaPreview && (
                      <div className="mt-4 border p-2 rounded-md bg-muted/20">
                        <Image
                          src={form.mediaPreview}
                          alt="Preview"
                          width={400}
                          height={300}
                          className="rounded-md object-cover mx-auto"
                        />
                        {form.mediaCid && (
                          <p className="text-xs text-muted-foreground mt-2">
                            CID: {form.mediaCid}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={loading || isUploading}
                    className="w-full"
                  >
                    {loading ? "Creating Tier..." : "Create Tier"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT: Preview */}
          <div className="lg:col-span-2 h-fit">
            <Card className="">
              <CardHeader>
                <CardTitle>Live Preview</CardTitle>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col items-center text-center">
                {form.mediaPreview ? (
                  <Image
                    src={form.mediaPreview}
                    alt="Preview"
                    width={500}
                    height={300}
                    className="rounded-lg mb-4 object-cover"
                  />
                ) : (
                  <div className="w-full h-56 border border-dashed border-primary rounded-3xl flex items-center justify-center text-muted-foreground">
                    Image Preview
                  </div>
                )}

                <h3 className="text-xl font-semibold mt-4">
                  {form.title || "Tier title will appear here"}
                </h3>

                <p className="text-muted-foreground">
                  {form.description || "Tier description will appear here"}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
