"use client";

import { useEffect, useState } from "react";
import { createPublicClient, http } from "viem";
import { polygonAmoy } from "viem/chains";

import SubscriptionPlanABI from "@/abi/SubscriptionPlan.json";
import PaymentManagerABI from "@/abi/PaymentManager.json";
import { SUBSCRIPTION_PLAN_ADDRESS, PAYMENT_MANAGER_ADDRESS } from "@/constants/contracts";

const client = createPublicClient({
  chain: polygonAmoy,
  transport: http(),
});

// -------------------------
// Types
// -------------------------
interface PlanStruct {
  price: bigint;
  frequency: bigint;
  metadataCID: string;
  active: boolean;
  creator: `0x${string}`;
}

interface SubscriptionItem {
  planId: number;
  planName: string;
  amount: bigint;
  frequency: number;
  nextPayment: number;
  paused: boolean;
}

export function useMySubscriptions(userAddress?: `0x${string}`) {
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>([]);
  const [totalMonthly, setTotalMonthly] = useState(0);
  const [upcomingPayments, setUpcomingPayments] = useState<SubscriptionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userAddress) return;
    load();
  }, [userAddress]);

  async function load() {
    try {
      setLoading(true);

      // --------------------------------------
      // 1. Get list of creator plans
      // --------------------------------------
      const rawPlans = await client.readContract({
        address: SUBSCRIPTION_PLAN_ADDRESS,
        abi: SubscriptionPlanABI.abi,
        functionName: "getCreatorPlans",
        args: [userAddress],
      });

      // Force type → array of bigint
      const allPlans: bigint[] = Array.isArray(rawPlans) ? rawPlans : [];

      const results: SubscriptionItem[] = [];
      let monthlyTotalWei = BigInt(0);

      // --------------------------------------
      // 2. Iterate each plan
      // --------------------------------------
      for (const planId of allPlans) {
        // subscription expiry for this user
        const expiryRaw = await client.readContract({
          address: PAYMENT_MANAGER_ADDRESS,
          abi: PaymentManagerABI.abi,
          functionName: "subscriptionExpiry",
          args: [userAddress, planId],
        });

        const expiry: bigint = typeof expiryRaw === "bigint" ? expiryRaw : BigInt(0);

        // Skip if never subscribed
        if (expiry === BigInt(0)) continue;

        // fetch plan data
        const rawPlan = await client.readContract({
          address: SUBSCRIPTION_PLAN_ADDRESS,
          abi: SubscriptionPlanABI.abi,
          functionName: "getPlan",
          args: [planId],
        });

        const plan = rawPlan as unknown as PlanStruct;

        results.push({
          planId: Number(planId),
          planName: plan.metadataCID ?? "",
          amount: plan.price,
          frequency: Number(plan.frequency),
          nextPayment: Number(expiry),
          paused: false,
        });

        monthlyTotalWei += plan.price;
      }

      setSubscriptions(results);
      setUpcomingPayments(results);
      setTotalMonthly(Number(monthlyTotalWei) / 1e18);
    } catch (err: any) {
      console.error("❌ useMySubscriptions error:", err);
      setError("Failed to load subscriptions");
    } finally {
      setLoading(false);
    }
  }

  return {
    subscriptions,
    totalMonthly,
    upcomingPayments,
    loading,
    error,
    reload: load,
  };
}
