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

import { useViewCreatorPlans } from "@/hooks/user/useViewCreatorPlans";
import { useViewCreatorTiers } from "@/hooks/user/useViewCreatorTiers";
import { useSubscribe } from "@/hooks/user/useSubscribe";
import { useMintTier } from "@/hooks/user/useMintTier";

import { formatEther } from "viem";
import { Loader2 } from "lucide-react";

interface CreatorJoinModalProps {
  address: string;
  open: boolean;
  onClose: () => void;
}

export default function CreatorJoinModal({
  address,
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">
            Subscribe or Become a Memeber
          </DialogTitle>
        </DialogHeader>

        {/* ----------------------------- */}
        {/* Subscription Plans Section   */}
        {/* ----------------------------- */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Subscription Plans</h3>

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
                  className="p-4 border rounded-xl bg-card"
                >
                  <h4 className="font-semibold">
                    {plan.metadata?.title || "Unnamed Plan"}
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
        <div>
          <h3 className="text-lg font-semibold mb-3">Membership NFTs</h3>

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
              {tiers.map((tier) => (
                <div
                  key={tier.tierId}
                  className="p-4 border rounded-xl bg-card"
                >
                  <h4 className="font-semibold">
                    {tier.metadata?.name || "Untitled Tier"}
                  </h4>

                  <p className="text-sm text-muted-foreground">
                    {tier.metadata?.description || "No description"}
                  </p>

                  <div className="text-sm mt-2">
                    <span className="font-medium">Price:</span>{" "}
                    {formatEther(BigInt(tier.price))} MATIC
                  </div>

                  <div className="text-sm">
                    <span className="font-medium">Supply:</span> {tier.minted}/
                    {tier.maxSupply}
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

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose} className="w-full">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
