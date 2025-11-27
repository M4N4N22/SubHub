"use client";

import { useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { parseEther } from "viem";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import SubscriptionPlanABI from "@/abi/SubscriptionPlan.json";
import { SUBSCRIPTION_PLAN_ADDRESS } from "@/constants/contracts";

const frequencyToSeconds: Record<string, number> = {
  daily: 86400,
  weekly: 7 * 86400,
  monthly: 30 * 86400,
};

export default function CreatePlan() {
  const router = useRouter();
  const { address, isConnected } = useAccount();

  const { writeContractAsync } = useWriteContract();

  const [shareableLink, setShareableLink] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    planName: "",
    description: "",
    amount: "",
    frequency: "",
  });

  const isFormValid =
    formData.planName &&
    formData.description &&
    formData.amount &&
    formData.frequency;

  const frequencies = [
    { label: "Daily (24 hours)", value: "daily" },
    { label: "Weekly (7 days)", value: "weekly" },
    { label: "Monthly (30 days)", value: "monthly" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected || !address) {
      toast.error("Connect your wallet first");
      return;
    }

    try {
      setIsLoading(true);

      // 1️⃣ Upload plan metadata to IPFS (name + description)
      const metadata = {
        name: formData.planName,
        description: formData.description,
        createdAt: new Date().toISOString(),
      };

      const metaRes = await fetch("/api/upload-json-to-pinata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ json: metadata }),
      });

      const metaData = await metaRes.json();

      if (!metaRes.ok || !metaData.cid) {
        toast.error("Metadata upload failed");
        return;
      }

      const metadataCID = metaData.cid; // Use ipfs://CID inside contract call

      // 2️⃣ Convert UI data → contract parameters
      const priceInWei = parseEther(formData.amount);
      const freqSeconds = frequencyToSeconds[formData.frequency];

      // 3️⃣ Call createPlan() on SubscriptionPlan.sol
      const txHash = await writeContractAsync({
        address: SUBSCRIPTION_PLAN_ADDRESS as `0x${string}`,
        abi: SubscriptionPlanABI.abi,
        functionName: "createPlan",
        args: [priceInWei, BigInt(freqSeconds), metadataCID],
      });

      toast.success("Plan created successfully!", {
        description: `Tx Hash: ${txHash}`,
      });

      // NOTE: To produce a shareable link with actual planId,
      // frontend needs to listen for PlanCreated event OR fetch creator plans again.
      // For now, we just display the link to creator dashboard.
      const shareable = `${window.location.origin}/creator/dashboard`;
      setShareableLink(shareable);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to create plan", {
        description: err?.message || "Unexpected error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Create Subscription Plan
          </h1>
          <p className="text-muted-foreground">
            Set up recurring crypto subscriptions for your premium content
          </p>
        </div>

        {!shareableLink && (
          <Card>
            <CardHeader>
              <CardTitle>Plan Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Plan Name */}
                <div className="space-y-2">
                  <Label>Plan Name</Label>
                  <Input
                    placeholder="Premium Access"
                    value={formData.planName}
                    onChange={(e) =>
                      setFormData({ ...formData, planName: e.target.value })
                    }
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Private group, early access, exclusive content"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    required
                  />
                </div>

                {/* Amount (in MATIC) */}
                <div className="space-y-2">
                  <Label>Amount (MATIC)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="5.00"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    required
                  />
                </div>

                {/* Billing Frequency */}
                <div className="space-y-2">
                  <Label>Billing Frequency</Label>
                  <Select
                    value={formData.frequency}
                    onValueChange={(value) =>
                      setFormData({ ...formData, frequency: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      {frequencies.map((freq) => (
                        <SelectItem key={freq.value} value={freq.value}>
                          {freq.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Button */}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={!isFormValid || isLoading}
                >
                  {isLoading ? "Creating..." : "Create Plan"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Shareable Link */}
        {shareableLink && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>🎉 Plan Created</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Your plan is live! View & manage it here:
              </p>
              <Input readOnly value={shareableLink} className="mb-3" />
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(shareableLink);
                  toast.success("Link copied!");
                }}
                className="mr-3"
              >
                Copy Link
              </Button>
              <Button variant="outline" onClick={() => router.push("/creator/dashboard")}>
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
