"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectItem, SelectContent } from "@/components/ui/select";

type Props = {
  gate: number;
  setGate: (v: number) => void;
  planId: string;
  setPlanId: (v: string) => void;
  tierId: string;
  setTierId: (v: string) => void;
  creatorPlans: any[];
  creatorTiers: any[];
};

export function GatingSelector({
  gate,
  setGate,
  planId,
  setPlanId,
  tierId,
  setTierId,
  creatorPlans,
  creatorTiers,
}: Props) {
  return (
    <div className="space-y-4">
      <Label>Choose Gating Option</Label>

      <Select value={String(gate)} onValueChange={(v) => setGate(Number(v))}>
        <SelectTrigger>
          <SelectValue placeholder="Select gating mode" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="0">Public (Everyone)</SelectItem>
          <SelectItem value="1">Subscription Only</SelectItem>
          <SelectItem value="2">Any Membership NFT</SelectItem>
          <SelectItem value="3">Specific NFT Tier</SelectItem>
          <SelectItem value="4">Subscription OR NFT</SelectItem>
        </SelectContent>
      </Select>

      {gate === 1 && (
        <div>
          <Label>Select Subscription Plan</Label>
          <Select value={planId} onValueChange={setPlanId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose your plan" />
            </SelectTrigger>
            <SelectContent>
              {creatorPlans.length === 0 ? (
                <SelectItem value="">No plans found</SelectItem>
              ) : (
                creatorPlans.map((plan) => (
                  <SelectItem key={plan.planId} value={String(plan.planId)}>
                    {plan.metadata?.name || `Plan ${plan.planId}`}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      )}

      {gate === 3 && (
        <div>
          <Label>Select NFT Tier</Label>
          <Select value={tierId} onValueChange={setTierId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose Tier" />
            </SelectTrigger>
            <SelectContent>
              {creatorTiers.length === 0 ? (
                <SelectItem value="">No tiers found</SelectItem>
              ) : (
                creatorTiers.map((tier) => (
                  <SelectItem key={tier.tierId} value={String(tier.tierId)}>
                    {tier.metadata?.title || `Tier ${tier.tierId}`}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
