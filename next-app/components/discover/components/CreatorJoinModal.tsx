"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";

import { useViewCreatorPlans } from "@/hooks/user/useViewCreatorPlans";
import { useViewCreatorTiers } from "@/hooks/user/useViewCreatorTiers";
import { useSubscribe } from "@/hooks/user/useSubscribe";
import { useMintTier } from "@/hooks/user/useMintTier";

import { formatEther } from "viem";
import { Loader2, ShieldCheck, CreditCard } from "lucide-react";

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
    subscribeUSDC,   // PRIMARY
    subscribeMatic,  // FALLBACK
    loading: subLoading,
  } = useSubscribe(selectedPlan ?? undefined);

  const { mint, loading: mintLoading } = useMintTier(selectedTier ?? undefined);

  // ---------------------------------------------------------
  // PAYMENT HANDLERS
  // ---------------------------------------------------------

  async function handleUSDCSubscription(plan: any) {
    try {
      await subscribeUSDC();
      onClose(); 
    } catch (err) {
      console.error(err);
    }
  }

  async function handleMaticSubscription(plan: any) {
    try {
      await subscribeMatic(BigInt(plan.price));
      onClose();
    } catch (err) {
      console.error(err);
    }
  }

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
            <div className="flex flex-col gap-3">
              <h1 className="text-3xl font-bold tracking-tight">
                Unlock Access from{" "}
                <span className="text-primary">{name}</span>
              </h1>

              <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                Acquire access rights via on-chain stablecoin payments.
                Settlement is instant, non-custodial, and verified on Polygon.
              </p>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="w-4 h-4 text-primary" />
                Access rights unlocked by USDC payments (zk-ready)
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* ----------------------------- */}
        {/* PAYMENT OPTIONS */}
        {/* ----------------------------- */}
        <div className="flex gap-4 bg-card/50 p-6 rounded-3xl overflow-y-auto h-112">
          {/* ----------------------------- */}
          {/* Stablecoin Subscriptions */}
          {/* ----------------------------- */}
          <div className="w-full">
            <h3 className="text-lg font-bold mb-3 tracking-tight">
              Recurring Access (USDC)
            </h3>

            {plansLoading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : plans.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No recurring access available.
              </p>
            ) : (
              <div className="space-y-4">
                {plans.map((plan) => (
                  <div
                    key={plan.planId}
                    className="py-4 px-6 shadow-md rounded-3xl bg-linear-to-b from-primary/10 to-card"
                  >
                    <h4 className="font-semibold">
                      {plan.metadata?.name || "Access Plan"}
                    </h4>

                    <p className="text-sm text-muted-foreground">
                      {plan.metadata?.description ||
                        "Ongoing access while payments remain active."}
                    </p>

                    <div className="text-sm mt-2">
                      <span className="font-medium">Payment:</span>{" "}
                      {formatEther(BigInt(plan.price))} USDC
                    </div>

                    <div className="text-sm">
                      <span className="font-medium">Billing cycle:</span>{" "}
                      {Math.floor(Number(plan.frequency) / 86400)} days
                    </div>

                    {/* PRIMARY CTA */}
                    <Button
                      className="w-full mt-4 flex items-center gap-2"
                      disabled={subLoading}
                      onClick={() => {
                        setSelectedPlan(plan.planId);
                        handleUSDCSubscription(plan);
                      }}
                    >
                      {subLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4" />
                          Pay with USDC & Unlock
                        </>
                      )}
                    </Button>

                    {/* FALLBACK */}
                    <button
                      className="mt-2 w-full text-xs text-muted-foreground hover:text-foreground transition"
                      onClick={() => {
                        setSelectedPlan(plan.planId);
                        handleMaticSubscription(plan);
                      }}
                    >
                      Pay with MATIC instead
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ----------------------------- */}
          {/* Access Tokens (NFTs) */}
          {/* ----------------------------- */}
          <div className="w-full">
            <h3 className="text-lg font-bold mb-3 tracking-tight">
              One-Time Access Tokens
            </h3>

            {tiersLoading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : tiers.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No access tokens available.
              </p>
            ) : (
              <div className="space-y-4">
                {uniqueTiers.map((tier) => (
                  <div
                    key={tier.tierId}
                    className="p-4 shadow-md rounded-3xl bg-linear-to-b from-orange-500/10 to-card"
                  >
                    <h4 className="font-semibold">
                      {tier.metadata?.title || "Access Token"}
                    </h4>

                    <p className="text-sm text-muted-foreground">
                      {tier.metadata?.description ||
                        "One-time payment for transferable access rights."}
                    </p>

                    {tier.metadata?.image && (
                      <div className="relative w-full h-56 rounded-xl overflow-hidden my-3">
                        <Image
                          src={`https://gateway.pinata.cloud/ipfs/${tier.metadata.image.replace(
                            "ipfs://",
                            ""
                          )}`}
                          alt={tier.metadata.title || "Access Token"}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}

                    <div className="text-sm mt-2">
                      <span className="font-medium">Payment:</span>{" "}
                      {formatEther(BigInt(tier.price))} MATIC
                    </div>

                    <div className="text-sm">
                      <span className="font-medium">Availability:</span>{" "}
                      {tier.minted}/{tier.maxSupply}
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
                        "Mint Access Token"
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
