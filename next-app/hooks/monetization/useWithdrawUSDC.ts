"use client";

import { useState } from "react";
import { useAccount, useWriteContract } from "wagmi";

import PaymentManagerABI from "@/abi/PaymentManager.json";
import { PAYMENT_MANAGER_ADDRESS } from "@/constants/contracts";

export function useWithdrawUSDC() {
  const { isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function withdraw() {
    if (!isConnected) {
      setError("Wallet not connected");
      throw new Error("Wallet not connected");
    }

    setLoading(true);
    setError(null);

    try {
      const tx = await writeContractAsync({
        address: PAYMENT_MANAGER_ADDRESS as `0x${string}`,
        abi: PaymentManagerABI.abi,
        functionName: "withdrawUSDC",
        args: [],
      });

      return tx;
    } catch (err: any) {
      console.error("USDC withdrawal error:", err);
      setError(err.message || "Withdrawal failed");
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return {
    withdraw,
    loading,
    error,
  };
}
