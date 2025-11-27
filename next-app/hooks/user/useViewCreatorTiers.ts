"use client";

import { useEffect, useState, useCallback } from "react";
import { createPublicClient, http } from "viem";
import { polygonAmoy } from "viem/chains";

import MembershipNFTABI from "@/abi/MembershipNFT.json";
import { MEMBERSHIP_NFT_ADDRESS } from "@/constants/contracts";

const client = createPublicClient({
  chain: polygonAmoy,
  transport: http(),
});

async function fetchIPFS(cid: string) {
  if (!cid) return null;

  const clean = cid.replace("ipfs://", "");
  try {
    const res = await fetch(
      `https://gateway.pinata.cloud/ipfs/${clean}`
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export function useViewCreatorTiers(creatorAddress?: string) {
  const [tiers, setTiers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadTiers = useCallback(async () => {
    if (!creatorAddress) return;
    setLoading(true);

    try {
      const tierIds = (await client.readContract({
        address: MEMBERSHIP_NFT_ADDRESS,
        abi: MembershipNFTABI.abi,
        functionName: "getCreatorTiers",
        args: [creatorAddress],
      })) as bigint[];

      const items = await Promise.all(
        tierIds.map(async (id) => {
          const t = await client.readContract({
            address: MEMBERSHIP_NFT_ADDRESS,
            abi: MembershipNFTABI.abi,
            functionName: "getTier",
            args: [id],
          });

          const metadata = await fetchIPFS(t.metadataCID);

          return {
            tierId: Number(id),
            ...t,
            metadata,
          };
        })
      );

      setTiers(items);
    } finally {
      setLoading(false);
    }
  }, [creatorAddress]);

  useEffect(() => {
    loadTiers();
  }, [loadTiers]);

  return { tiers, loading, reload: loadTiers };
}
