"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";

import { useViewCreatorPlans } from "@/hooks/user/useViewCreatorPlans";
import { useViewCreatorTiers } from "@/hooks/user/useViewCreatorTiers";
import { useSubscribe } from "@/hooks/user/useSubscribe";
import { useMintTier } from "@/hooks/user/useMintTier";

import { formatEther } from "viem";
import { Loader2 } from "lucide-react";

interface CreatorJoinModalProps {
  address: string;
  name?: string;
  open: boolean;
  onClose: () => void;
}

export default function CreatorJoinModal({
  address,
  name,
  open,
  onClose,
}: CreatorJoinModalProps) {
  const { plans, loading: plansLoading } = useViewCreatorPlans(address);
  const { tiers, loading: tiersLoading } = useViewCreatorTiers(address);

  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [selectedTier, setSelectedTier] = useState<number | null>(null);

  const {
    subscribeMatic,
    subscribeUSDC,
    loading: subLoading,
  } = useSubscribe(selectedPlan ?? undefined);

  const { mint, loading: mintLoading } = useMintTier(selectedTier ?? undefined);

  // ---------------------------------------------------------
  // SUBSCRIBE HANDLERS
  // ---------------------------------------------------------
  async function handleSubscribe(plan: any) {
    try {
      const price = BigInt(plan.price);
      await subscribeMatic(price); // default MATIC route
      onClose();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSubscribeUSDC() {
    try {
      await subscribeUSDC();
      onClose();
    } catch (err) {
      console.error(err);
    }
  }

  // ---------------------------------------------------------
  // MINT HANDLER
  // ---------------------------------------------------------
  async function handleMintTier(tier: any) {
    try {
      await mint(BigInt(tier.price));
      onClose();
    } catch (err) {
      console.error(err);
    }
  }

  const uniqueTiers = tiers.filter(
    (t, index, self) =>
      index === self.findIndex((x) => x.metadata?.title === t.metadata?.title)
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="min-w-3xl">
        <DialogHeader>
          <DialogTitle>
            <div className="flex flex-col">
              <h1 className="text-3xl font-bold tracking-tight">
                Support <span className="text-primary">{name}</span> and unlock
                exclusive access
              </h1>

              <p className="text-sm text-muted-foreground mt-2 leading-relaxed font-medium">
                Subscribe or mint a membership pass to unlock premium content,
                behind-the-scenes updates, and special perks available only to
                supporters.
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* ----------------------------- */}
        {/* Subscription Plans Section   */}
        {/* ----------------------------- */}
        <div className="flex gap-3 bg-card/50 p-6 rounded-3xl  overflow-y-auto h-112">
          <div className="mb-6 w-full">
            <h3 className="text-lg font-bold mb-3 tracking-tight">Subscription Plans</h3>

            {plansLoading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : plans.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No subscription plans available.
              </p>
            ) : (
              <div className="space-y-4">
                {plans.map((plan) => (
                  <div
                    key={plan.planId}
                    className="py-4 px-6 shadow-md rounded-3xl bg-linear-to-b from-primary/10 to-card"
                  >
                    <h4 className="font-semibold">
                      {plan.metadata?.name || "Unnamed Plan"}
                    </h4>

                    <p className="text-sm text-muted-foreground">
                      {plan.metadata?.description || "No description"}
                    </p>

                    <div className="text-sm mt-2">
                      <span className="font-medium">Price:</span>{" "}
                      {formatEther(BigInt(plan.price))} MATIC
                    </div>

                    <div className="text-sm">
                      <span className="font-medium">Frequency:</span>{" "}
                      {Math.floor(Number(plan.frequency) / 86400)} days
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button
                        className="w-full"
                        disabled={subLoading}
                        onClick={() => {
                          setSelectedPlan(plan.planId);
                          handleSubscribe(plan);
                        }}
                      >
                        {subLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Subscribe (MATIC)"
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ----------------------------- */}
          {/* NFT Membership Tiers Section */}
          {/* ----------------------------- */}
          <div className="w-full">
            <h3 className="text-lg font-bold mb-3 tracking-tight">Membership NFTs</h3>

            {tiersLoading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : tiers.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No membership tiers available.
              </p>
            ) : (
              <div className="space-y-4">
                {uniqueTiers.map((tier) => (
                  <div
                    key={tier.tierId}
                    className="p-4 shadow-md rounded-3xl bg-linear-to-b from-orange-500/10 to-card"
                  >
                    <h4 className="font-semibold">
                      {tier.metadata?.title || "Untitled Tier"}
                    </h4>

                    <p className="text-sm text-muted-foreground">
                      {tier.metadata?.description || "No description"}
                    </p>

                    {/* NFT Image */}
                    {tier.metadata?.image && (
                      <div className="relative w-full h-56 rounded-xl overflow-hidden my-3">
                        <Image
                          src={`https://gateway.pinata.cloud/ipfs/${tier.metadata.image.replace(
                            "ipfs://",
                            ""
                          )}`}
                          alt={tier.metadata.title || "Tier NFT"}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}

                    <div className="text-sm mt-2">
                      <span className="font-medium">Price:</span>{" "}
                      {formatEther(BigInt(tier.price))} MATIC
                    </div>

                    <div className="text-sm">
                      <span className="font-medium">Supply:</span> {tier.minted}
                      /{tier.maxSupply}
                    </div>

                    <Button
                      className="w-full mt-4"
                      disabled={mintLoading}
                      onClick={() => {
                        setSelectedTier(tier.tierId);
                        handleMintTier(tier);
                      }}
                    >
                      {mintLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Mint Membership NFT"
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
