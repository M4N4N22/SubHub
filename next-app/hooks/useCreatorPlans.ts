"use client";

import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";

import SubscriptionPlanArtifact from "@/abi/SubscriptionPlan.json";
import { SUBSCRIPTION_PLAN_ADDRESS } from "@/constants/contracts";
import { useEvmWallet } from "@/hooks/useEvmWallet";

const ABI = SubscriptionPlanArtifact.abi;

// ---------------------------------------------
// Utility: Fetch metadata from IPFS
// ---------------------------------------------
async function fetchIPFSMetadata(cid: string) {
  console.log("fetchIPFSMetadata called with cid:", cid);

  if (!cid) return null;

  const clean = cid.replace("ipfs://", "");
  const url = `https://gateway.pinata.cloud/ipfs/${clean}`;

  console.log("Fetching:", url);

  try {
    const res = await fetch(url);
    console.log("IPFS status:", res.status);
    if (!res.ok) return null;

    const json = await res.json();
    console.log("Fetched:", json);
    return json;
  } catch (err) {
    console.log("IPFS fetch error:", err);
    return null;
  }
}

// ---------------------------------------------
// Main Hook: useCreatorPlans
// ---------------------------------------------
export function useCreatorPlans(targetAddress?: string) {
  const { provider, address: walletAddress, connected } = useEvmWallet();

  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);

  const creator = targetAddress || walletAddress;

  // ---------------------------------------------
  // Read: Get a single plan
  // ---------------------------------------------
  const loadSinglePlan = async (contract: any, planId: number) => {
    console.log("Fetching plan:", planId);

    const p = await contract.getPlan(planId);
    console.log("Raw plan struct:", p);

    const metadata = await fetchIPFSMetadata(p.metadataCID);

    return {
      planId,
      price: p.price,
      frequency: p.frequency,
      metadataCID: p.metadataCID,
      active: p.active,
      creator: p.creator,
      metadata,
    };
  };

  // ---------------------------------------------
  // Read: Load all plans owned by creator
  // ---------------------------------------------
  const loadPlans = useCallback(async () => {
    console.log("loadPlans() triggered");

    if (!provider) {
      console.log("Provider missing");
      return;
    }
    if (!connected) {
      console.log("Wallet not connected");
      return;
    }
    if (!creator) {
      console.log("No creator address");
      return;
    }

    try {
      setLoading(true);

      const contract = new ethers.Contract(
        SUBSCRIPTION_PLAN_ADDRESS,
        ABI,
        provider
      );

      console.log("Contract instantiated:", SUBSCRIPTION_PLAN_ADDRESS);

      const planIds: bigint[] = await contract.getCreatorPlans(creator);
      console.log("Plan IDs:", planIds);

      if (!planIds.length) {
        console.log("No plans found");
        setPlans([]);
        return;
      }

      const full = await Promise.all(
        planIds.map((id) => loadSinglePlan(contract, Number(id)))
      );

      console.log("Loaded all plans:", full);

      setPlans(full);
    } catch (err) {
      console.log("Error loading plans:", err);
    } finally {
      setLoading(false);
    }
  }, [provider, connected, creator]);

  // ---------------------------------------------
  // Write: Toggle Active
  // ---------------------------------------------
  const toggleActive = useCallback(
    async (planId: number, current: boolean) => {
      if (!provider || !connected) {
        throw new Error("Wallet not connected");
      }

      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        SUBSCRIPTION_PLAN_ADDRESS,
        ABI,
        signer
      );

      console.log("Sending setActive for plan:", planId);

      const tx = await contract.setActive(planId, !current);
      console.log("Tx hash:", tx.hash);

      await tx.wait();
      console.log("Tx confirmed");

      await loadPlans();
    },
    [provider, connected, loadPlans]
  );

  // ---------------------------------------------
  // Auto-load when wallet/creator changes
  // ---------------------------------------------
  useEffect(() => {
    console.log("Auto load triggered:", { connected, creator });
    if (connected && creator) loadPlans();
  }, [connected, creator, loadPlans]);

  return {
    loading,
    plans,
    toggleActive,
    reload: loadPlans,
    exists: plans.length > 0,
  };
}
