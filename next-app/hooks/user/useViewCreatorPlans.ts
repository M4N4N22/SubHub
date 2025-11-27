"use client";

import { useEffect, useState, useCallback } from "react";
import { createPublicClient, http } from "viem";
import { polygonAmoy } from "viem/chains";

import SubscriptionPlanABI from "@/abi/SubscriptionPlan.json";
import { SUBSCRIPTION_PLAN_ADDRESS } from "@/constants/contracts";

const client = createPublicClient({
  chain: polygonAmoy,
  transport: http(),
});

// Fetch IPFS metadata
async function fetchIPFS(cid: string) {
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

export function useViewCreatorPlans(creatorAddress?: string) {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadPlans = useCallback(async () => {
    if (!creatorAddress) return;

    setLoading(true);
    try {
      const planIds = (await client.readContract({
        address: SUBSCRIPTION_PLAN_ADDRESS,
        abi: SubscriptionPlanABI.abi,
        functionName: "getCreatorPlans",
        args: [creatorAddress],
      })) as bigint[];

      const loaded = await Promise.all(
        planIds.map(async (id) => {
          const plan = await client.readContract({
            address: SUBSCRIPTION_PLAN_ADDRESS,
            abi: SubscriptionPlanABI.abi,
            functionName: "getPlan",
            args: [id],
          });

          const metadata = await fetchIPFS(plan.metadataCID);

          return {
            planId: Number(id),
            price: plan.price,
            frequency: plan.frequency,
            metadataCID: plan.metadataCID,
            metadata,
            active: plan.active,
          };
        })
      );

      setPlans(loaded);
    } finally {
      setLoading(false);
    }
  }, [creatorAddress]);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  return { plans, loading, reload: loadPlans };
}
