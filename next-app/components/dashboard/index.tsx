"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

import { useCreatorPlans } from "@/hooks/useCreatorPlans";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import CreatorProfile from "../creator-profile";
import CreatorInsights from "../creator-insights";
import { useRouter } from "next/navigation";

const CreatorDashboard = () => {
  const router = useRouter();
  const { address, isConnected } = useAccount();

  const { plans: createdPlans, loading, reload } = useCreatorPlans(address);

  const [sharedLinks, setSharedLinks] = useState<Record<string, string>>({});

  const generateShareLink = (planId: string) => {
    if (!address) return;
    const link = `${window.location.origin}/subscribe?creator=${address}&planId=${planId}`;
    setSharedLinks((prev) => ({ ...prev, [planId]: link }));
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-3xl font-semibold text-foreground mb-1">
              Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage and track your subscription plans
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/creator/create">
              <Button>Create New Plan</Button>
            </Link>
            <Button
              variant="outline"
              onClick={() => router.push("/creator/monetization")}
            >
              Withdraw
            </Button>
          </div>
        </div>

        {/* Creator Profile + Insights */}
        <CreatorProfile />
        {address && <CreatorInsights address={address} />}

        {/* Plans section */}
        {loading ? (
          <div className="text-muted-foreground text-center mt-6">
            Loading plans...
          </div>
        ) : createdPlans.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6 mt-6">
            {createdPlans.map((plan, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg text-foreground">
                    {plan.planName}
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <div className="text-sm text-muted-foreground mb-1">
                    Plan ID: {plan.planId}
                  </div>
                  <div className="text-sm text-muted-foreground mb-1">
                    Amount: {plan.amount} MATIC
                  </div>
                  <div className="text-sm text-muted-foreground mb-1">
                    Frequency: {plan.frequency}
                  </div>

                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => generateShareLink(plan.planId)}
                  >
                    Share Plan Link
                  </Button>

                  {sharedLinks[plan.planId] && (
                    <div className="mt-2 p-4 border border-dashed rounded-xl text-sm break-all">
                      Shareable Link:{" "}
                      <a
                        href={sharedLinks[plan.planId]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline text-blue-500"
                      >
                        {sharedLinks[plan.planId]}
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="mt-10 border border-dashed">
            <CardContent className="py-12 text-center">
              <div className="text-4xl mb-4">📦</div>
              <h2 className="text-lg font-semibold text-foreground mb-2">
                No plans yet
              </h2>
              <p className="text-muted-foreground mb-6">
                You haven`&apos;t created any subscription plans yet.
              </p>
              <Link href="/creator/create">
                <Button>Create Your First Plan</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CreatorDashboard;
