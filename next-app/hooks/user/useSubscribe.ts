"use client";

import { useState } from "react";
import { useWriteContract } from "wagmi";

import PaymentManagerABI from "@/abi/PaymentManager.json";
import { PAYMENT_MANAGER_ADDRESS } from "@/constants/contracts";

export function useSubscribe(planId?: number) {
  const { writeContractAsync } = useWriteContract();
  const [loading, setLoading] = useState(false);

  async function subscribeMatic(priceWei: bigint) {
    if (!planId) throw new Error("Missing planId");

    setLoading(true);
    try {
      const tx = await writeContractAsync({
        address: PAYMENT_MANAGER_ADDRESS as `0x${string}`,
        abi: PaymentManagerABI.abi,
        functionName: "subscribeMATIC",
        args: [BigInt(planId)],
        value: priceWei,
      });
      return tx;
    } finally {
      setLoading(false);
    }
  }

  async function subscribeUSDC() {
    if (!planId) throw new Error("Missing planId");

    setLoading(true);
    try {
      return await writeContractAsync({
        address: PAYMENT_MANAGER_ADDRESS as `0x${string}`,
        abi: PaymentManagerABI.abi,
        functionName: "subscribeUSDC",
        args: [BigInt(planId)],
      });
    } finally {
      setLoading(false);
    }
  }

  return { subscribeMatic, subscribeUSDC, loading };
}
