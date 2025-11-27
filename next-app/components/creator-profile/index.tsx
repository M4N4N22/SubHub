"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

import {
  FaXTwitter,
  FaInstagram,
  FaTelegram,
  FaDiscord,
} from "react-icons/fa6";
import { RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";

import { useEvmWallet } from "@/hooks/useEvmWallet";
import { useCreatorProfile } from "@/hooks/useCreatorProfile";

const CreatorProfile = () => {
  const router = useRouter();

  const { connected, address, connect } = useEvmWallet();

  const {
    metadata,
    cid,
    reload,
    loading: profileLoading,
  } = useCreatorProfile(address || undefined);

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // -------------------------------------------------------------------
  // Auto-connect wallet if the user already approved it before
  // -------------------------------------------------------------------
  useEffect(() => {
    if (!window.ethereum) return;

    window.ethereum
      .request({ method: "eth_accounts" })
      .then((accounts: string[]) => {
        if (accounts.length > 0 && !connected) {
          connect();
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -------------------------------------------------------------------
  // Whenever metadata loads, compute avatar URL
  // -------------------------------------------------------------------
  useEffect(() => {
    if (!metadata) {
      setAvatarUrl(null);
      return;
    }

    const avatarCid = metadata.avatar?.replace("ipfs://", "");
    if (avatarCid) {
      setAvatarUrl(`https://gateway.pinata.cloud/ipfs/${avatarCid}`);
    }
  }, [metadata]);

  // -------------------------------------------------------------------
  // Refresh profile
  // -------------------------------------------------------------------
  const refreshProfile = async () => {
    if (!connected) return;

    setRefreshing(true);
    toast.info("Refreshing profile...");
    await reload();
    toast.success("Profile refreshed");
    setRefreshing(false);
  };

  // -------------------------------------------------------------------
  // If wallet is NOT connected — show connect screen
  // -------------------------------------------------------------------
  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <p className="text-muted-foreground text-lg">
          Connect your wallet to view your creator profile
        </p>
        <Button onClick={connect}>Connect Wallet</Button>
      </div>
    );
  }

  // -------------------------------------------------------------------
  // Loading state while fetching on-chain profile
  // -------------------------------------------------------------------
  if (profileLoading && !metadata) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-3 text-primary">
        <RotateCcw className="h-6 w-6 animate-spin" />
        <p>Loading profile...</p>
      </div>
    );
  }

  // -------------------------------------------------------------------
  // No profile created yet
  // -------------------------------------------------------------------
  const noProfile = !metadata;

  return (
    <div className="z-0">
      <div className="w-full">
        <Card className="relative p-6">
          <CardContent>
            <div className="flex justify-between items-start w-full">
              {/* ---------------------------------------------------------
                   EMPTY STATE (Brand New Creator)
              -----------------------------------------------------------*/}
              {noProfile ? (
                <div className="flex flex-col items-center justify-center w-full py-16 gap-4 text-center">
                  <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center text-3xl text-muted-foreground border shadow-sm">
                    ?
                  </div>

                  <h2 className="text-xl font-semibold">No profile found</h2>

                  <p className="text-muted-foreground text-sm max-w-sm">
                    You haven’t created your creator profile yet. Add your name,
                    avatar, bio, and social links to get started.
                  </p>

                  <Button onClick={() => router.push("/creator/profile")}>
                    Create Profile
                  </Button>

                  <Button
                    variant="outline"
                    disabled={refreshing}
                    onClick={refreshProfile}
                    className="flex items-center gap-2"
                  >
                    <RotateCcw
                      className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                    />
                    Refresh
                  </Button>
                </div>
              ) : (
                /* ---------------------------------------------------------
                   PROFILE PRESENT
                -----------------------------------------------------------*/
                <div className="flex gap-6 justify-between w-full items-start">
                  {/* LEFT — Avatar + Info */}
                  <div className="flex gap-6 items-center">
                    <div className="relative w-28 h-28 rounded-full overflow-hidden border border-muted shadow-sm">
                      <Image
                        src={avatarUrl || "/default.webp"}
                        alt="Creator Avatar"
                        fill
                        className="object-cover rounded-full"
                      />
                    </div>

                    <div className="flex flex-col">
                      <h2 className="text-2xl font-semibold">
                        {metadata?.name || "Unnamed Creator"}
                      </h2>

                      <p className="text-sm text-muted-foreground max-w-lg mt-1">
                        {metadata?.bio || "No bio provided."}
                      </p>

                      {/* Social Links */}
                      <div className="flex flex-wrap gap-3 mt-4">
                        {metadata?.socials?.x && (
                          <a
                            href={`https://x.com/${metadata.socials.x.replace(
                              "@",
                              ""
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-muted border p-2 rounded-full hover:text-foreground transition"
                          >
                            <FaXTwitter />
                          </a>
                        )}

                        {metadata?.socials?.discord && (
                          <div className="bg-muted border p-2 rounded-full">
                            <FaDiscord />
                          </div>
                        )}

                        {metadata?.socials?.telegram && (
                          <a
                            href={`https://t.me/${metadata.socials.telegram.replace(
                              "@",
                              ""
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-muted border p-2 rounded-full hover:text-foreground transition"
                          >
                            <FaTelegram />
                          </a>
                        )}

                        {metadata?.socials?.instagram && (
                          <a
                            href={`https://instagram.com/${metadata.socials.instagram.replace(
                              "@",
                              ""
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-muted border p-2 rounded-full hover:text-foreground transition"
                          >
                            <FaInstagram />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* RIGHT — Edit + Refresh */}
                  <div className="flex items-start gap-2">
                    <Button
                      variant="outline"
                      onClick={() => router.push("/creator/profile")}
                    >
                      Edit Profile
                    </Button>

                    <Button
                      variant="outline"
                      disabled={refreshing}
                      onClick={refreshProfile}
                    >
                      <RotateCcw
                        className={`h-4 w-4 ${
                          refreshing ? "animate-spin" : ""
                        }`}
                      />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreatorProfile;
