"use client";

import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { toast } from "sonner";

import { useEvmWallet } from "@/hooks/useEvmWallet";

import SubscriptionPlanABI from "@/abi/SubscriptionPlan.json";
import PaymentManagerABI from "@/abi/PaymentManager.json";
import MembershipNFTABI from "@/abi/MembershipNFT.json";

import {
  SUBSCRIPTION_PLAN_ADDRESS,
  PAYMENT_MANAGER_ADDRESS,
  MEMBERSHIP_NFT_ADDRESS,
} from "@/constants/contracts";

// ---------------------------------------------
// Shared Types
// ---------------------------------------------
export type SubscriberEntry = {
  wallet: string;
  joinedAt: string;
  active: boolean;
  planId: string;
  planName: string;
  amount: string;
};

export type NFTHolderEntry = {
  wallet: string;
  tokenId: string;
  tierId: string;
  tierName: string;
  metadata: any;
};

export type NFTTierInsight = {
  tierId: string;
  tierName: string;
  price: number;
  maxSupply: number;
  minted: number;
  holders: NFTHolderEntry[];
  metadata: any;
};

export type PlanInsight = {
  planId: string;
  planName: string;
  price: number;
  frequency: number;
  subscribers: number;
  activeSubscribers: number;
  revenue: number;
  metadata: any;
};

export type CreatorInsights = {
  subscription: {
    overview: {
      totalSubscribers: number;
      activeSubscribers: number;
      totalRevenue: number;
    };
    plans: PlanInsight[];
    subscribers: SubscriberEntry[];
    earningsGraph: { date: string; revenue: number }[];
  };

  nft: {
    totalHolders: number;
    totalMinted: number;
    tiers: NFTTierInsight[];
    holders: NFTHolderEntry[];
  };

  combined: {
    totalCommunitySize: number;       // subscribers + nft holders (unique)
    overlapCount: number;             // holds NFT + subscription
  };
};

// ---------------------------------------------------
// Utility: Fetch IPFS JSON
// ---------------------------------------------------
async function fetchCID(cid: string) {
  if (!cid) return null;
  const clean = cid.replace("ipfs://", "");
  const url = `https://gateway.pinata.cloud/ipfs/${clean}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// ---------------------------------------------------
// MAIN HOOK
// ---------------------------------------------------
export function useCreatorInsights(creatorAddress?: string) {
  const { provider, connected } = useEvmWallet();

  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<CreatorInsights | null>(null);

  const loadInsights = useCallback(
    async (creator?: string) => {
      if (!provider || !connected || !creator) return;

      try {
        setLoading(true);
        toast.info("Loading creator analytics...");

        const subscriptionPlan = new ethers.Contract(
          SUBSCRIPTION_PLAN_ADDRESS,
          SubscriptionPlanABI.abi,
          provider
        );

        const paymentManager = new ethers.Contract(
          PAYMENT_MANAGER_ADDRESS,
          PaymentManagerABI.abi,
          provider
        );

        const membershipNFT = new ethers.Contract(
          MEMBERSHIP_NFT_ADDRESS,
          MembershipNFTABI.abi,
          provider
        );

        // =========================================================
        // 1️⃣ SUBSCRIPTIONS (SubscriptionPlan + PaymentManager)
        // =========================================================

        const planIds: bigint[] = await subscriptionPlan.getCreatorPlans(
          creator
        );

        const plans: PlanInsight[] = [];
        const allSubscribers: SubscriberEntry[] = [];

        let totalSubscribers = 0;
        let totalActiveSubscribers = 0;
        let totalRevenue = 0;

        for (const id of planIds) {
          const planId = id.toString();

          const plan = await subscriptionPlan.getPlan(id);
          const { price, frequency, metadataCID, active } = plan;

          const metadata = (await fetchCID(metadataCID)) || {
            name: "Subscription Plan",
          };
          const planName = metadata.name ?? "Subscription Plan";

          const priceEther = Number(ethers.formatEther(price));

          // list of subscribers
          const subs: string[] = await paymentManager.getSubscribers(id);

          let planSubs = 0;
          let planActive = 0;
          let planRevenue = 0;

          for (const user of subs) {
            planSubs++;

            const expiry: bigint = await paymentManager.subscriptionExpiry(
              user,
              id
            );

            const isActive = Number(expiry) * 1000 > Date.now();

            if (isActive) {
              planActive++;
              planRevenue += priceEther;
            }

            const joinedTs: bigint =
              await paymentManager.getSubscriberJoinTime(id, user);

            const joinedAt =
              Number(joinedTs) > 0
                ? new Date(Number(joinedTs) * 1000).toISOString()
                : "";

            allSubscribers.push({
              wallet: user,
              joinedAt,
              active: isActive,
              planId,
              planName,
              amount: priceEther.toString(),
            });
          }

          totalSubscribers += planSubs;
          totalActiveSubscribers += planActive;
          totalRevenue += planRevenue;

          plans.push({
            planId,
            planName,
            frequency: Number(frequency),
            price: priceEther,
            subscribers: planSubs,
            activeSubscribers: planActive,
            revenue: planRevenue,
            metadata,
          });
        }

        // Earnings graph
        const earningsMap = new Map<string, number>();
        for (const sub of allSubscribers) {
          if (!sub.joinedAt) continue;
          const day = sub.joinedAt.split("T")[0];
          const amount = Number(sub.amount);
          earningsMap.set(day, (earningsMap.get(day) || 0) + amount);
        }

        const earningsGraph = Array.from(earningsMap.entries()).map(
          ([date, revenue]) => ({ date, revenue })
        );

        // =========================================================
        // 2️⃣ NFT MEMBERSHIPS (MembershipNFT)
        // =========================================================

        const tierIds: bigint[] = await membershipNFT.getCreatorTiers(creator);

        const nftTiers: NFTTierInsight[] = [];
        const nftHolders: NFTHolderEntry[] = [];

        let totalMinted = 0;
        let uniqueHolders = new Set<string>();

        for (const tId of tierIds) {
          const tierId = tId.toString();

          const tier = await membershipNFT.getTier(tId);
          const metadata = (await fetchCID(tier.metadataCID)) || {
            name: "Tier",
          };

          const tierName = metadata.name ?? "NFT Tier";

          const minted = Number(tier.minted);
          totalMinted += minted;

          const holdersForTier: NFTHolderEntry[] = [];

          // NFT is ERC721Enumerable → can iterate all tokenIds
          for (let tokenIndex = 0; tokenIndex < minted; tokenIndex++) {
            // tokenIds start at NEXTTOKENID-1, but tier tracks "minted" not token range
            // safer: iterate ALL tokens & filter by tier
            // So we fetch total supply globally
          }

          // More accurate: iterate all minted tokens globally
          const totalSupply = Number(await membershipNFT.totalSupply());

          for (let tokenIdNum = 1; tokenIdNum <= totalSupply; tokenIdNum++) {
            const tokenId = tokenIdNum.toString();

            // check if this token belongs to this tier
            const tokenTierId = await membershipNFT.getTokenTier(tokenIdNum);
            if (tokenTierId.toString() !== tierId) continue;

            const owner = await membershipNFT.ownerOf(tokenIdNum);

            uniqueHolders.add(owner);

            holdersForTier.push({
              wallet: owner,
              tokenId,
              tierId,
              tierName,
              metadata,
            });

            nftHolders.push({
              wallet: owner,
              tokenId,
              tierId,
              tierName,
              metadata,
            });
          }

          nftTiers.push({
            tierId,
            tierName,
            price: Number(ethers.formatEther(tier.price)),
            maxSupply: Number(tier.maxSupply),
            minted: Number(tier.minted),
            holders: holdersForTier,
            metadata,
          });
        }

        const nftAnalytics = {
          totalHolders: uniqueHolders.size,
          totalMinted,
          tiers: nftTiers,
          holders: nftHolders,
        };

        // =========================================================
        // 3️⃣ Combined Community Analytics
        // =========================================================

        const subsSet = new Set(allSubscribers.map((s) => s.wallet));
        const nftSet = uniqueHolders;

        let overlap = 0;
        for (const s of subsSet) {
          if (nftSet.has(s)) overlap++;
        }

        const combinedCommunitySize = new Set([
          ...Array.from(subsSet),
          ...Array.from(nftSet),
        ]).size;

        // =========================================================
        // 4️⃣ Final Insights Object
        // =========================================================

        const final: CreatorInsights = {
          subscription: {
            overview: {
              totalSubscribers,
              activeSubscribers: totalActiveSubscribers,
              totalRevenue,
            },
            plans,
            subscribers: allSubscribers,
            earningsGraph,
          },

          nft: nftAnalytics,

          combined: {
            totalCommunitySize: combinedCommunitySize,
            overlapCount: overlap,
          },
        };

        setInsights(final);
        toast.success("Creator analytics loaded");
      } catch (err) {
        console.error("❌ loadInsights error:", err);
        toast.error("Failed to load insights");
        setInsights(null);
      } finally {
        setLoading(false);
      }
    },
    [provider, connected]
  );

  // Auto-load
  useEffect(() => {
    if (connected && creatorAddress) {
      loadInsights(creatorAddress);
    }
  }, [connected, creatorAddress, loadInsights]);

  return {
    loading,
    insights,
    reload: loadInsights,
  };
}
