"use client";

import { useEffect, useState } from "react";
import { createPublicClient, http } from "viem";
import { polygonAmoy } from "viem/chains";

import CreatorCard from "./components/CreatorCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RotateCcw, Loader2 } from "lucide-react";

import CreatorProfileABI from "@/abi/CreatorProfile.json";
import { CREATOR_PROFILE_ADDRESS } from "@/constants/contracts";

// viem public client
const client = createPublicClient({
  chain: polygonAmoy,
  transport: http(),
});

export default function DiscoverIndex() {
  const [creators, setCreators] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);

  async function loadCreators() {
    setLoading(true);

    try {
      // 1. Fetch total number of creators
      const countBig = await client.readContract({
        address: CREATOR_PROFILE_ADDRESS,
        abi: CreatorProfileABI.abi,
        functionName: "getCreatorCount",
      });

      const count = Number(countBig);

      const total = Number(count);
      const list: string[] = [];

      // 2. Iterate through all creators
      const creators: string[] = [];

      for (let i = 0; i < count; i++) {
        const addr = (await client.readContract({
          address: CREATOR_PROFILE_ADDRESS,
          abi: CreatorProfileABI.abi,
          functionName: "getCreatorByIndex",
          args: [BigInt(i)],
        })) as `0x${string}`;

        creators.push(addr);
      }

      setCreators(creators);
    } catch (err) {
      console.error("Failed to load creators:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCreators();
  }, [refresh]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  if (creators.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        No creators found yet.
      </div>
    );
  }

  return (
    <div className="">
      <div className="flex justify-between mb-6">
        <div className="flex flex-col">
          <h1 className="text-3xl font-semibold tracking-tight">Find Creators that you love</h1>

          <p className="text-muted-foreground mt-1">
            Subscribe or become a member to get access to exclusive perks and
            content.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setRefresh((prev) => !prev)}
        >
          <RotateCcw className="group-active:animate-spin transition-transform" />
        </Button>
      </div>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-2">
        {creators.map((address) => (
          <Card key={address} className="p-4">
            <CreatorCard address={address} />
          </Card>
        ))}
      </div>
    </div>
  );
}
