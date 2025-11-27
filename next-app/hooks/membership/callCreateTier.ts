"use client";

import { useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { parseEther } from "viem";

import MembershipNFT from "@/abi/MembershipNFT.json";
import { MEMBERSHIP_NFT_ADDRESS } from "@/constants/contracts";

type CreateTierArgs = {
  title: string;
  description: string;
  price: string;        // in MATIC (string input)
  maxSupply: string;    // "0" = unlimited
  royalty: string;      // bps (string -> number)
  mediaCid: string;     // IPFS CID for tier image
};

export function useCreateTier() {
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const [loading, setLoading] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);

  const createTier = async (data: CreateTierArgs) => {
    if (!isConnected || !address) {
      throw new Error("Wallet not connected");
    }

    try {
      setLoading(true);

      // -----------------------------
      // 1. Upload metadata JSON
      // -----------------------------
      const metadata = {
        title: data.title,
        description: data.description,
        image: `ipfs://${data.mediaCid}`,
        price: data.price,
        maxSupply: data.maxSupply,
        royalty: data.royalty,
        createdAt: new Date().toISOString(),
      };

      const res = await fetch("/api/upload-json-to-pinata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ json: metadata }),
      });

      const output = await res.json();
      if (!res.ok || !output.cid) {
        throw new Error("Failed to upload metadata to IPFS");
      }

      const metadataCid = output.cid;

      // -----------------------------
      // 2. Prepare args for contract
      // -----------------------------
      const priceWei = parseEther(data.price);
      const maxSupplyBN = BigInt(data.maxSupply || "0");
      const royaltyBps = Number(data.royalty);

      if (isNaN(royaltyBps) || royaltyBps < 0 || royaltyBps > 10000) {
        throw new Error("Invalid royalty basis points");
      }

      // -----------------------------
      // 3. Write to contract
      // -----------------------------
      await writeContractAsync({
        address: MEMBERSHIP_NFT_ADDRESS as `0x${string}`,
        abi: MembershipNFT.abi,
        functionName: "createTier",
        args: [
          priceWei,
          maxSupplyBN,
          royaltyBps,
          metadataCid,
        ],
      });

      // -----------------------------
      // 4. Set shareable link (full dashboard)
      // -----------------------------
      setShareLink(`${window.location.origin}/creator/memberships`);
    } finally {
      setLoading(false);
    }
  };

  return {
    createTier,
    loading,
    shareLink,
    isConnected,
  };
}
