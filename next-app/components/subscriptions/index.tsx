"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SubscriptionCard from "@/components/SubscriptionCard";
import { Loader2 } from "lucide-react";

import { useAccount } from "wagmi";
import { useMySubscriptions } from "@/hooks/subscriptions/useMySubscriptions";

const Dashboard = () => {
  const { address } = useAccount();
  const {
    subscriptions,
    totalMonthly,
    upcomingPayments,
    loading,
    error,
  } = useMySubscriptions(address);

  const activeSubscriptions = subscriptions.filter((s) => !s.paused);

  return (
    <div className="min-h-screen container mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Your Subscriptions</h1>
          <p className="text-muted-foreground mt-1">
            Manage all your active subscriptions, creators & renewals.
          </p>
        </div>
      </div>

      {/* LOADING STATE */}
      {loading && (
        <div className="flex justify-center items-center h-[60vh]">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      )}

      {/* ERROR */}
      {error && <p className="text-red-500">{error}</p>}

      {/* MAIN CONTENT */}
      {!loading && !error && (
        <>
          <div className="relative min-h-screen rounded-3xl">
            {/* STATS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              
              {/* Active */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Active Subscriptions
                  </CardTitle>
                  <span>📊</span>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeSubscriptions.length}</div>
                  <p className="text-xs text-muted-foreground">Across creators</p>
                </CardContent>
              </Card>

              {/* Monthly Spend */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Monthly Commitment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalMonthly} MATIC</div>
                  <p className="text-xs text-muted-foreground">Recurring total</p>
                </CardContent>
              </Card>

              {/* Next Payment */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Next Payment Date
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {upcomingPayments.length
                      ? new Date(
                          upcomingPayments[0].nextPayment * 1000
                        ).toLocaleDateString()
                      : "-"}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* SUBSCRIPTION LIST */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Your Subscriptions</h2>

              <div className="space-y-4">
                {subscriptions.map((sub) => (
                  <SubscriptionCard
                    key={sub.planId}
                    service={sub.planName}
                    amount={Number(sub.amount) / 1e18}
                    frequency={sub.frequency}
                    nextPayment={sub.nextPayment}
                    status={sub.paused ? "paused" : "active"}
                  />
                ))}
              </div>

              {subscriptions.length === 0 && (
                <Card className="border border-dashed">
                  <CardContent className="py-12 text-center">
                    <div className="text-6xl mb-4">📭</div>
                    <h3 className="text-lg font-semibold">No subscriptions yet</h3>
                    <p className="text-muted-foreground mb-6">
                      Discover creators and subscribe to support their work.
                    </p>
                    <Link href="/discover">
                      <Button>Discover Creators</Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
