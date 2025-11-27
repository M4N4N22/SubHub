"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

import { RotateCcw, Loader2 } from "lucide-react";

import { useEvmWallet } from "@/hooks/useEvmWallet";
import { useCreatorProfile } from "@/hooks/useCreatorProfile";

import { ethers } from "ethers";
import CreatorProfileABI from "@/abi/CreatorProfile.json";
import { CREATOR_PROFILE_ADDRESS } from "@/constants/contracts";

const SetupProfile = () => {
  const { connected, address, provider, connect } = useEvmWallet();

  const { metadata, cid, reload, loading: profileLoading } =
    useCreatorProfile(address || undefined);

  const [isLoading, setIsLoading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const [form, setForm] = useState({
    name: "",
    bio: "",
    avatarCid: "",
    avatarFile: undefined as File | undefined,
    x: "",
    discord: "",
    telegram: "",
    instagram: "",
  });

  // ---------------------------------------------------------
  // AUTO-CONNECT METAMASK IF ALREADY AUTHORIZED
  // ---------------------------------------------------------
  useEffect(() => {
    if (!window.ethereum) return;

    window.ethereum.request({ method: "eth_accounts" }).then((accounts: string[]) => {
      if (accounts.length > 0 && !connected) {
        connect();
      }
    });
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------------------------------
  // LOAD PROFILE DATA INTO FORM
  // ---------------------------------------------------------
  useEffect(() => {
    if (metadata) {
      const avatarCid = metadata.avatar?.replace("ipfs://", "") || "";
      const socials = metadata.socials || {};

      setForm({
        name: metadata.name || "",
        bio: metadata.bio || "",
        avatarCid,
        avatarFile: undefined,
        x: socials.x || "",
        discord: socials.discord || "",
        telegram: socials.telegram || "",
        instagram: socials.instagram || "",
      });

      if (avatarCid) {
        setAvatarPreview(`https://gateway.pinata.cloud/ipfs/${avatarCid}`);
      }
    }
  }, [metadata]);

  // ---------------------------------------------------------
  // REFRESH ON-CHAIN + IPFS PROFILE
  // ---------------------------------------------------------
  const refreshProfile = async () => {
    if (!connected) return;

    setRefreshing(true);
    toast.info("Refreshing profile...");

    await reload();

    toast.success("Profile refreshed");
    setRefreshing(false);
  };

  // ---------------------------------------------------------
  // AVATAR SELECTED
  // ---------------------------------------------------------
  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarPreview(URL.createObjectURL(file));
    setForm((prev) => ({ ...prev, avatarFile: file }));
  };

  // ---------------------------------------------------------
  // SAVE PROFILE (Pinata → On-chain)
  // ---------------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connected || !provider) {
      toast.error("Connect your wallet first");
      return;
    }

    setIsLoading(true);

    try {
      let avatarCid = form.avatarCid;

      // 1. Upload Avatar (if user selected one)
      if (form.avatarFile) {
        setAvatarUploading(true);
        try {
          const fd = new FormData();
          fd.append("file", form.avatarFile);

          const r = await fetch("/api/upload-file-to-pinata", {
            method: "POST",
            body: fd,
          });

          const data = await r.json();
          if (!r.ok || !data.cid) throw new Error("Failed avatar upload");

          avatarCid = data.cid;
          setForm((p) => ({ ...p, avatarCid }));
        } catch (e) {
          console.error(e);
          toast.error("Avatar upload failed");
          return;
        } finally {
          setAvatarUploading(false);
        }
      }

      // 2. Upload JSON Metadata
      const jsonMeta = {
        name: form.name,
        bio: form.bio,
        avatar: avatarCid ? `ipfs://${avatarCid}` : null,
        socials: {
          x: form.x,
          discord: form.discord,
          telegram: form.telegram,
          instagram: form.instagram,
        },
        updatedAt: new Date().toISOString(),
      };

      const res = await fetch("/api/upload-json-to-pinata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ json: jsonMeta }),
      });

      const json = await res.json();
      if (!res.ok || !json.cid) throw new Error("Metadata upload failed");

      const metadataCID = json.cid;

      // 3. Write to blockchain (setCreatorProfile)
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        CREATOR_PROFILE_ADDRESS,
        CreatorProfileABI.abi,
        signer
      );

      const tx = await contract.setCreatorProfile(metadataCID);
      await tx.wait();

      toast.success("Profile updated on-chain!", {
        description: `CID: ${metadataCID}`,
      });

      await refreshProfile();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save profile");
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------------------------------------------------
  // DEBUG LOG
  // ---------------------------------------------------------
  console.log("DEBUG:", {
    connected,
    address,
    provider,
    isLoading,
    disabled: isLoading || !connected,
  });

  // ---------------------------------------------------------
  // SHOW CONNECT WALLET SCREEN
  // ---------------------------------------------------------
  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <p className="text-muted-foreground text-lg">
          Connect your wallet to setup your profile
        </p>
        <Button onClick={connect}>Connect Wallet</Button>
      </div>
    );
  }

  // ---------------------------------------------------------
  // SHOW LOADER WHILE FETCHING PROFILE
  // ---------------------------------------------------------
  if (profileLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] gap-2 text-muted-foreground">
        <Loader2 className="animate-spin h-6 w-6 text-primary" />
        <p>Loading your profile...</p>
      </div>
    );
  }

  // ---------------------------------------------------------
  // MAIN PROFILE SETUP UI
  // ---------------------------------------------------------
  return (
    <div>
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Setup Your Creator Profile</h1>
        </div>

        <Card className="p-4 md:p-8 relative">
          <div className="absolute right-4 top-4">
            <Button
              size="sm"
              variant="outline"
              disabled={refreshing}
              onClick={refreshProfile}
              className="flex items-center gap-1 text-sm"
            >
              <RotateCcw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              {refreshing ? "Refreshing..." : "Refresh"}
            </Button>
          </div>

          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Profile Details
            </CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="flex justify-between gap-6 items-start">
                {/* Avatar */}
                <div className="flex flex-col items-center gap-3 w-1/3">
                  <div className="relative w-28 h-28 rounded-full overflow-hidden border">
                    <Image
                      src={avatarPreview || "/default.webp"}
                      alt="Avatar Preview"
                      fill
                      className="object-cover rounded-full"
                    />
                  </div>

                  <Input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarSelect}
                    disabled={avatarUploading}
                    className="cursor-pointer text-sm"
                  />

                  {avatarUploading && (
                    <p className="text-xs text-muted-foreground">Uploading...</p>
                  )}

                  {form.avatarCid && (
                    <p className="text-xs text-muted-foreground break-all text-center">
                      CID: {form.avatarCid}
                    </p>
                  )}
                </div>

                {/* FORM */}
                <div className="space-y-4 w-2/3">
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <Label>Bio</Label>
                    <Textarea
                      value={form.bio}
                      onChange={(e) =>
                        setForm({ ...form, bio: e.target.value })
                      }
                    />
                  </div>

                  {/* Socials */}
                  <div className="grid sm:grid-cols-2 gap-3">
                    {["x", "discord", "telegram", "instagram"].map((s) => (
                      <div key={s}>
                        <Label>{s.toUpperCase()}</Label>
                        <Input
                          placeholder="@handle"
                          value={(form as any)[s]}
                          onChange={(e) =>
                            setForm({ ...form, [s]: e.target.value })
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full mt-4"
              >
                {isLoading ? "Saving..." : "Save Profile"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SetupProfile;
