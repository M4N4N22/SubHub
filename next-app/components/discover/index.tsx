"use client";

import { useEffect, useState } from "react";
import { createPublicClient, http } from "viem";
import { polygonAmoy } from "viem/chains";

import CreatorCard from "./components/CreatorCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RotateCcw, Loader2, ShieldCheck } from "lucide-react";

import CreatorProfileABI from "@/abi/CreatorProfile.json";
import { CREATOR_PROFILE_ADDRESS } from "@/constants/contracts";

// viem public client
const client = createPublicClient({
  chain: polygonAmoy,
  transport: http(),
});

export default function AccessIndex() {
  const [providers, setProviders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);

  async function loadProviders() {
    setLoading(true);

    try {
      const countBig = await client.readContract({
        address: CREATOR_PROFILE_ADDRESS,
        abi: CreatorProfileABI.abi,
        functionName: "getCreatorCount",
      });

      const count = Number(countBig);
      const list: string[] = [];

      for (let i = 0; i < count; i++) {
        const addr = (await client.readContract({
          address: CREATOR_PROFILE_ADDRESS,
          abi: CreatorProfileABI.abi,
          functionName: "getCreatorByIndex",
          args: [BigInt(i)],
        })) as `0x${string}`;

        list.push(addr);
      }

      setProviders(list);
    } catch (err) {
      console.error("Failed to load access providers:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProviders();
  }, [refresh]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  if (providers.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        No payment-gated access available yet.
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            Explore Payment-Gated Access
          </h1>

          <p className="text-muted-foreground max-w-xl">
            Discover resources, communities, and tools that unlock access via
            on-chain payments. Access rights are verified without custodial
            intermediaries.
          </p>

          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <ShieldCheck className="w-4 h-4 text-primary" />
            Access granted via programmable payments on Polygon
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setRefresh((prev) => !prev)}
        >
          <RotateCcw className="transition-transform group-active:animate-spin" />
        </Button>
      </div>

      {/* Grid */}
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-2">
        {providers.map((address) => (
          <Card key={address} className="p-4">
            {/* Internally still CreatorCard — conceptually Access Provider */}
            <CreatorCard address={address} />
          </Card>
        ))}
      </div>
    </div>
  );
}
