"use client";

import { useCallback, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { createPublicClient, http } from "viem";
import { polygonAmoy } from "viem/chains";

import ContentGatingABI from "@/abi/ContentGating.json";
import { CONTENT_GATING_ADDRESS } from "@/constants/contracts";

const client = createPublicClient({
  chain: polygonAmoy,
  transport: http(),
});

export type CreatorContent = {
  contentId: number;
  cid: string;
  gate: number;
  planId: bigint;
  tierId: bigint;
  timestamp: bigint;
  metadata: any | null;
};

async function fetchMetadata(cid: string) {
  try {
    const clean = cid.replace("ipfs://", "");
    const url = `https://gateway.pinata.cloud/ipfs/${clean}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export function useCreatorContent() {
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<CreatorContent[]>([]);

  const load = useCallback(async () => {
    if (!address || !isConnected) return;

    setLoading(true);
    try {
      // 1. Fetch all content IDs for this creator
      const contentIds = (await client.readContract({
        address: CONTENT_GATING_ADDRESS,
        abi: ContentGatingABI.abi,
        functionName: "getCreatorPosts",
        args: [address],
      })) as bigint[];

      if (contentIds.length === 0) {
        setPosts([]);
        return;
      }

      // 2. Load each post
      const results = await Promise.all(
        contentIds.map(async (id) => {
          const data = (await client.readContract({
            address: CONTENT_GATING_ADDRESS,
            abi: ContentGatingABI.abi,
            functionName: "getContent",
            args: [id],
          })) as {
            contentCID: string;
            gate: number;
            planId: bigint;
            tierId: bigint;
            timestamp: bigint;
          };

          const metadata = await fetchMetadata(data.contentCID);

          return {
            contentId: Number(id),
            cid: data.contentCID,
            gate: data.gate,
            planId: data.planId,
            tierId: data.tierId,
            timestamp: data.timestamp,
            metadata,
          } as CreatorContent;
        })
      );

      // newest first
      results.sort((a, b) => Number(b.timestamp) - Number(a.timestamp));

      setPosts(results);
    } finally {
      setLoading(false);
    }
  }, [address, isConnected]);

  useEffect(() => {
    load();
  }, [load]);

  return { loading, posts, reload: load };
}
