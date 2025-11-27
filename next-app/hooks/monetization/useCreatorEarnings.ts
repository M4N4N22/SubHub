"use client";

import { useEffect, useState } from "react";
import { createPublicClient, http } from "viem";
import { polygonAmoy } from "viem/chains";

import PaymentManagerABI from "@/abi/PaymentManager.json";
import { PAYMENT_MANAGER_ADDRESS } from "@/constants/contracts";

const client = createPublicClient({
  chain: polygonAmoy,
  transport: http(),
});

export function useCreatorEarnings(address?: string) {
  const [matic, setMatic] = useState<bigint>(BigInt(0));
  const [usdc, setUsdc] = useState<bigint>(BigInt(0));
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!address) return;

    setLoading(true);
    const [maticBal, usdcBal] = await Promise.all([
      client
        .readContract({
          address: PAYMENT_MANAGER_ADDRESS,
          abi: PaymentManagerABI.abi,
          functionName: "maticBalance",
          args: [address],
        })
        .then((v) => v as bigint),

      client
        .readContract({
          address: PAYMENT_MANAGER_ADDRESS,
          abi: PaymentManagerABI.abi,
          functionName: "usdcBalance",
          args: [address],
        })
        .then((v) => v as bigint),
    ]);

    setMatic(maticBal);
    setUsdc(usdcBal);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [address]);

  return { matic, usdc, loading, reload: load };
}
