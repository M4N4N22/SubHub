"use client";

import { useEffect, useState } from "react";
import { createPublicClient, http } from "viem";
import { polygonAmoy } from "viem/chains";

import { CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

import CreatorProfileMini from "./CreatorProfileMini";
import CreatorPostsPreview from "./CreatorPostsPreview";
import CreatorJoinModal from "./CreatorJoinModal";

import CreatorProfileABI from "@/abi/CreatorProfile.json";
import ContentGatingABI from "@/abi/ContentGating.json";
import SubscriptionPlanABI from "@/abi/SubscriptionPlan.json";
import PaymentManagerABI from "@/abi/PaymentManager.json";

import {
  CREATOR_PROFILE_ADDRESS,
  CONTENT_GATING_ADDRESS,
  SUBSCRIPTION_PLAN_ADDRESS,
  PAYMENT_MANAGER_ADDRESS,
} from "@/constants/contracts";

interface CreatorCardProps {
  address: string;
  refresh?: boolean;
}

interface CreatorProfileData {
  name: string;
  avatar: string;
  bio: string;
  socials?: {
    x?: string;
    discord?: string;
    telegram?: string;
    instagram?: string;
  };
  activeSubs: number;
  posts: {
    title: string;
    media: string;
    type: string;
  }[];
  createdAt?: string;
}

const client = createPublicClient({
  chain: polygonAmoy,
  transport: http(),
});

export default function CreatorCard({ address, refresh }: CreatorCardProps) {
  const [data, setData] = useState<CreatorProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false); // FIXED: missing state

  useEffect(() => {
    loadCreator();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, refresh]);

  async function loadCreator() {
    setLoading(true);

    try {
      // 1) Creator profile CID
      const cid = (await client.readContract({
        address: CREATOR_PROFILE_ADDRESS,
        abi: CreatorProfileABI.abi,
        functionName: "getCreatorProfile",
        args: [address],
      })) as string;

      if (!cid || cid.trim().length < 4) {
        setData(null);
        return;
      }

      // 2) Fetch metadata
      const metaRes = await fetch(`/api/fetch-ipfs-metadata?cid=${cid}`);
      const meta = await metaRes.json();

      // 3) Fetch latest content posts
      const contentIds = (await client.readContract({
        address: CONTENT_GATING_ADDRESS,
        abi: ContentGatingABI.abi,
        functionName: "getCreatorPosts",
        args: [address],
      })) as bigint[];

      const posts: CreatorProfileData["posts"] = [];

      for (let i = 0; i < Math.min(3, contentIds.length); i++) {
        const contentId = contentIds[i];

        const content = (await client.readContract({
          address: CONTENT_GATING_ADDRESS,
          abi: ContentGatingABI.abi,
          functionName: "getContent",
          args: [contentId],
        })) as any;

        const mRes = await fetch(
          `/api/fetch-ipfs-metadata?cid=${content.contentCID}`
        );
        const m = await mRes.json();

        posts.push({
          title: m.title,
          media: m.media,
          type: m.type ?? "content",
        });
      }

      // 4) Count active subscribers
      let activeSubs = 0;

      const creatorPlans = (await client.readContract({
        address: SUBSCRIPTION_PLAN_ADDRESS,
        abi: SubscriptionPlanABI.abi,
        functionName: "getCreatorPlans",
        args: [address],
      })) as bigint[];

      for (const planId of creatorPlans) {
        const subs = (await client.readContract({
          address: PAYMENT_MANAGER_ADDRESS,
          abi: PaymentManagerABI.abi,
          functionName: "getSubscribers",
          args: [planId],
        })) as string[];

        activeSubs += subs.length;
      }

      // 5) Set the final UI data
      setData({
        name: meta.name || "Unnamed Creator",
        avatar: meta.avatar ? meta.avatar.replace("ipfs://", "") : "",
        bio: meta.bio || "",
        socials: meta.socials || {},
        activeSubs,
        posts,
        createdAt: meta.createdAt,
      });
    } catch (err) {
      console.error("Error loading creator:", err);
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  // -------------------- UI RENDER --------------------

  if (loading)
    return (
      <CardContent className="p-8 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </CardContent>
    );

  if (!data)
    return (
      <CardContent className="p-6 text-center text-muted-foreground">
        Failed to load creator data.
      </CardContent>
    );

  return (
    <CardContent className="p-4 flex flex-col gap-4">
      <CreatorProfileMini
        name={data.name}
        avatar={data.avatar}
        bio={data.bio}
        address={address}
        activeSubs={data.activeSubs}
        socials={data.socials}
      />

      {/* Latest Posts */}
      <div className="bg-muted p-4 rounded-3xl border">
        <span className="text-xs text-foreground/70">
          Latest posts from <span className="font-medium">{data.name}</span>
        </span>

        <CreatorPostsPreview posts={data.posts} />
      </div>

      {/* JOIN Button */}
      <button
        onClick={() => setOpen(true)}
        className="w-full py-2 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition"
      >
        Join
      </button>

      {/* Modal */}
      <CreatorJoinModal
        address={address}
        open={open}
        onClose={() => setOpen(false)}
      />
    </CardContent>
  );
}
