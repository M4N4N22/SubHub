"use client";

import { useEffect, useState, useCallback } from "react";
import { createPublicClient, http } from "viem";
import { polygonAmoy } from "viem/chains";
import { useAccount } from "wagmi";

import MembershipNFT from "@/abi/MembershipNFT.json";
import { MEMBERSHIP_NFT_ADDRESS } from "@/constants/contracts";

// viem client (read-only)
const client = createPublicClient({
  chain: polygonAmoy,
  transport: http(),
});

type Holder = {
  wallet: string;
  tokenId: number;
  tierId: number;
};

export function useTierHolders(tierId: number | string) {
  const { isConnected } = useAccount();

  const [loading, setLoading] = useState(false);
  const [holders, setHolders] = useState<Holder[]>([]);

  const loadHolders = useCallback(async () => {
    if (!tierId || !isConnected) return;

    setLoading(true);

    try {
      // 1. Get total supply
      const totalSupply = (await client.readContract({
        address: MEMBERSHIP_NFT_ADDRESS,
        abi: MembershipNFT.abi,
        functionName: "totalSupply",
      })) as bigint;

      if (totalSupply === BigInt(0)) {
        setHolders([]);
        setLoading(false);
        return;
      }

      const results: Holder[] = [];

      // 2. Iterate through each tokenId
      for (let i = BigInt(0); i < totalSupply; i++) {
        const tokenId = (await client.readContract({
          address: MEMBERSHIP_NFT_ADDRESS,
          abi: MembershipNFT.abi,
          functionName: "tokenByIndex",
          args: [i],
        })) as bigint;

        // 3. Fetch tier for tokenId
        const tokenTier = (await client.readContract({
          address: MEMBERSHIP_NFT_ADDRESS,
          abi: MembershipNFT.abi,
          functionName: "getTokenTier",
          args: [tokenId],
        })) as bigint;

        // skip if not in this tier
        if (Number(tokenTier) !== Number(tierId)) continue;

        // 4. Fetch owner
        const owner = (await client.readContract({
          address: MEMBERSHIP_NFT_ADDRESS,
          abi: MembershipNFT.abi,
          functionName: "ownerOf",
          args: [tokenId],
        })) as `0x${string}`;

        results.push({
          wallet: owner,
          tokenId: Number(tokenId),
          tierId: Number(tokenTier),
        });
      }

      // Optional: sort oldest → newest
      results.sort((a, b) => a.tokenId - b.tokenId);

      setHolders(results);
    } catch (err) {
      console.error("Error loading holders", err);
      setHolders([]);
    } finally {
      setLoading(false);
    }
  }, [tierId, isConnected]);

  useEffect(() => {
    loadHolders();
  }, [loadHolders]);

  return {
    loading,
    holders,
    reload: loadHolders,
  };
}
