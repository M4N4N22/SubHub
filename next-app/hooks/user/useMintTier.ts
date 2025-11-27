"use client";

import { useWriteContract } from "wagmi";
import { useState } from "react";

import MembershipNFTABI from "@/abi/MembershipNFT.json";
import { MEMBERSHIP_NFT_ADDRESS } from "@/constants/contracts";

export function useMintTier(tierId?: number) {
  const { writeContractAsync } = useWriteContract();
  const [loading, setLoading] = useState(false);

  async function mint(priceWei: bigint) {
    if (!tierId) throw new Error("Missing tierId");

    setLoading(true);
    try {
      const tx = await writeContractAsync({
        address: MEMBERSHIP_NFT_ADDRESS as `0x${string}`,
        abi: MembershipNFTABI.abi,
        functionName: "mint",
        args: [BigInt(tierId)],
        value: priceWei,
      });

      return tx;
    } finally {
      setLoading(false);
    }
  }

  return { mint, loading };
}
