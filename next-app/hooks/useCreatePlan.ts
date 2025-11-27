"use client";

import { useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { parseEther } from "viem";

import SubscriptionPlanABI from "@/abi/SubscriptionPlan.json";
import { SUBSCRIPTION_PLAN_ADDRESS } from "@/constants/contracts";
import { frequencyToSeconds } from "../utils/frequencyToSeconds";

type CreatePlanArgs = {
  name: string;
  description: string;
  price: string;
  frequency: string;
};

export function useCreatePlan() {
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const [loading, setLoading] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);

  const createPlan = async (data: CreatePlanArgs) => {
    if (!isConnected || !address) {
      throw new Error("Wallet not connected");
    }

    try {
      setLoading(true);

      // 1. Upload metadata to IPFS
      const metadata = {
        name: data.name,
        description: data.description,
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

      const cid = output.cid;

      // 2. Prepare contract args
      const priceInWei = parseEther(data.price);
      const freqSeconds = frequencyToSeconds(data.frequency);

      // 3. Write to contract
      await writeContractAsync({
        address: SUBSCRIPTION_PLAN_ADDRESS as `0x${string}`,
        abi: SubscriptionPlanABI.abi,
        functionName: "createPlan",
        args: [
          priceInWei,
          BigInt(freqSeconds),
          `ipfs://${cid}`, // FIXED
        ],
      });

      // 4. Generate shareable link
      setShareLink(`${window.location.origin}/creator/dashboard`);
    } finally {
      setLoading(false);
    }
  };

  return {
    createPlan,
    loading,
    shareLink,
    isConnected,
  };
}
