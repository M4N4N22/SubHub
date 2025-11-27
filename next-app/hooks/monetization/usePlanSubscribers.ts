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

export function usePlanSubscribers(planId?: number | string) {
  const [subs, setSubs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    if (!planId) return;

    setLoading(true);

    const users = await client.readContract({
      address: PAYMENT_MANAGER_ADDRESS,
      abi: PaymentManagerABI.abi,
      functionName: "getSubscribers",
      args: [BigInt(planId)],
    })as string[];

    setSubs(users);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [planId]);

  return { subs, loading };
}
