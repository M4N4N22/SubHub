"use client";

import { useEffect, useState, useCallback } from "react";
import { useAccount } from "wagmi";
import { createPublicClient, http } from "viem";
import { polygonAmoy } from "viem/chains";

import MembershipNFT from "@/abi/MembershipNFT.json";
import { MEMBERSHIP_NFT_ADDRESS } from "@/constants/contracts";

// viem client for read-only calls
const client = createPublicClient({
  chain: polygonAmoy,
  transport: http(),
});

// fetch IPFS metadata
async function fetchIPFSMetadata(cid: string) {
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

export function useCreatorTiers() {
  const { address, isConnected } = useAccount();
  const [tiers, setTiers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadTier = async (tierId: number) => {
    const t = await client.readContract({
      address: MEMBERSHIP_NFT_ADDRESS,
      abi: MembershipNFT.abi,
      functionName: "getTier",
      args: [BigInt(tierId)],
    });

    const metadata = await fetchIPFSMetadata(t.metadataCID);

    return {
      tierId,
      price: t.price,
      maxSupply: t.maxSupply,
      royaltyBps: t.royaltyBps,
      metadataCID: t.metadataCID,
      creator: t.creator,
      active: t.active,
      minted: t.minted,
      metadata,
    };
  };

  const loadTiers = useCallback(async () => {
    if (!address || !isConnected) return;

    setLoading(true);

    try {
      const tierIds: bigint[] = await client.readContract({
        address: MEMBERSHIP_NFT_ADDRESS,
        abi: MembershipNFT.abi,
        functionName: "getCreatorTiers",
        args: [address],
      });

      if (!tierIds.length) {
        setTiers([]);
        return;
      }

      const loaded = await Promise.all(
        tierIds.map((id) => loadTier(Number(id)))
      );

      setTiers(loaded);
    } finally {
      setLoading(false);
    }
  }, [address, isConnected]);

  useEffect(() => {
    loadTiers();
  }, [loadTiers]);

  return {
    loading,
    tiers,
    reload: loadTiers,
  };
}
