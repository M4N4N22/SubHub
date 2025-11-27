"use client";

import { useEffect } from "react";
import { useCreatorInsights } from "@/hooks/useCreatorInsights";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Loader2, RotateCcw } from "lucide-react";
import { format, parseISO } from "date-fns";

interface CreatorInsightsProps {
  address?: string;
}

export default function CreatorInsights({ address }: CreatorInsightsProps) {
  const { insights, loading, reload } = useCreatorInsights(address);

  function CustomTooltip({ active, payload, label }: any) {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-md bg-black/80 backdrop-blur-md p-3 text-xs text-white shadow-md">
          <p className="font-semibold">
            {format(parseISO(label), "eeee, MMM d, yyyy")}
          </p>
          <p>{payload[0].value.toFixed(2)} MATIC</p>
        </div>
      );
    }
    return null;
  }

  useEffect(() => {
    if (address) reload(address);
  }, [address]);

  if (loading || !insights) {
    return (
      <div className="flex justify-center items-center py-12 text-muted-foreground gap-2">
        <Loader2 className="animate-spin w-5 h-5" />
        Loading insights...
      </div>
    );
  }

  const { subscription, nft, combined } = insights;
  const { overview, plans, earningsGraph, subscribers } = subscription;

  return (
    <div className="mt-10 space-y-12">
      {/* ========================================================= */}
      {/* HEADER */}
      {/* ========================================================= */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-medium">Creator Analytics</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => reload(address!)}
          className="flex items-center gap-1"
        >
          <RotateCcw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* ========================================================= */}
      {/* SUBSCRIPTION OVERVIEW */}
      {/* ========================================================= */}
      <h3 className="text-xl font-medium">Subscriptions</h3>

      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Subscribers</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold text-primary">
            {overview.totalSubscribers}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Subscribers</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold text-green-500">
            {overview.activeSubscribers}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold text-red-600">
            {overview.totalRevenue.toFixed(2)} MATIC
          </CardContent>
        </Card>
      </div>

      {/* ========================================================= */}
      {/* EARNINGS CHART */}
      {/* ========================================================= */}
      <Card>
        <CardHeader>
          <CardTitle>Earnings Over Time (MATIC)</CardTitle>
        </CardHeader>
        <CardContent>
          {earningsGraph.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={earningsGraph}>
                <defs>
                  <linearGradient id="earningsColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#015FFD" stopOpacity={0.4} />
                    <stop offset="80%" stopColor="#015FFD" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#015FFD"
                  strokeWidth={2}
                  fill="url(#earningsColor)"
                />
                <XAxis
                  dataKey="date"
                  tickFormatter={(str) => {
                    const date = parseISO(str);
                    return date.getDate() % 7 === 0
                      ? format(date, "MMM d")
                      : "";
                  }}
                />
                <YAxis tickFormatter={(num) => `${num.toFixed(2)}`} />
                <Tooltip content={<CustomTooltip />} />
                <CartesianGrid opacity={0.1} vertical={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground">No revenue yet.</p>
          )}
        </CardContent>
      </Card>

      {/* ========================================================= */}
      {/* PLAN BREAKDOWN */}
      {/* ========================================================= */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Plans</CardTitle>
        </CardHeader>
        <CardContent>
          {plans.length === 0 ? (
            <p className="text-muted-foreground">No plans found.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plans.map((plan) => (
                <Card
                  key={plan.planId}
                  className="border border-border bg-muted/30"
                >
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">
                      {plan.planName}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1 text-sm">
                    <div>Price: {plan.price} MATIC</div>
                    <div>
                      Active Subs: {plan.activeSubscribers}/{plan.subscribers}
                    </div>
                    <div className="font-semibold">
                      Revenue: {plan.revenue.toFixed(2)} MATIC
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ========================================================= */}
      {/* NFT SECTION */}
      {/* ========================================================= */}
      <h3 className="text-xl font-medium">NFT Memberships</h3>

      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total NFT Holders</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold text-primary">
            {nft.totalHolders}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total NFTs Minted</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {nft.totalMinted}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Community Size (Combined)</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold text-blue-500">
            {combined.totalCommunitySize}
          </CardContent>
        </Card>
      </div>

      {/* NFT Tier Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>NFT Tier Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {nft.tiers.length === 0 ? (
            <p className="text-muted-foreground">No NFT tiers found.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {nft.tiers.map((tier) => (
                <Card key={tier.tierId} className="border bg-muted/30">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">
                      {tier.tierName}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1 text-sm">
                    <div>Tier ID: {tier.tierId}</div>
                    <div>Price: {tier.price} MATIC</div>
                    <div>Minted: {tier.minted}</div>
                    <div>Max Supply: {tier.maxSupply || "∞"}</div>
                    <div>Holders: {tier.holders.length}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ========================================================= */}
      {/* SUBSCRIBER TABLE */}
      {/* ========================================================= */}
      <Card>
        <CardHeader>
          <CardTitle>Subscriber Details</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {subscribers.length === 0 ? (
            <p className="text-muted-foreground">No subscribers yet.</p>
          ) : (
            <table className="min-w-full text-sm">
              <thead className="border-b text-muted-foreground">
                <tr>
                  <th className="text-left py-2 px-3">Wallet</th>
                  <th className="text-left py-2 px-3">Plan</th>
                  <th className="text-left py-2 px-3">Joined</th>
                  <th className="text-left py-2 px-3">Active</th>
                  <th className="text-left py-2 px-3">Amount</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((s, i) => (
                  <tr
                    key={`${s.wallet}-${s.planId}-${i}`}
                    className="border-b hover:bg-muted/10"
                  >
                    <td className="py-2 px-3">{s.wallet}</td>
                    <td className="py-2 px-3">{s.planName}</td>
                    <td className="py-2 px-3">
                      {s.joinedAt
                        ? format(new Date(s.joinedAt), "MMM d, yyyy")
                        : "-"}
                    </td>
                    <td className="py-2 px-3">
                      {s.active ? (
                        <span className="text-green-500 font-semibold">
                          Active
                        </span>
                      ) : (
                        <span className="text-red-500">Expired</span>
                      )}
                    </td>
                    <td className="py-2 px-3">{s.amount} MATIC</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* ========================================================= */}
      {/* NFT HOLDERS TABLE */}
      {/* ========================================================= */}
      <Card>
        <CardHeader>
          <CardTitle>NFT Holders</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {nft.holders.length === 0 ? (
            <p className="text-muted-foreground">No NFT members yet.</p>
          ) : (
            <table className="min-w-full text-sm">
              <thead className="border-b text-muted-foreground">
                <tr>
                  <th className="text-left py-2 px-3">Wallet</th>
                  <th className="text-left py-2 px-3">Token ID</th>
                  <th className="text-left py-2 px-3">Tier</th>
                </tr>
              </thead>
              <tbody>
                {nft.holders.map((h, i) => (
                  <tr
                    key={`${h.wallet}-${h.tokenId}-${i}`}
                    className="border-b hover:bg-muted/10"
                  >
                    <td className="py-2 px-3">{h.wallet}</td>
                    <td className="py-2 px-3">{h.tokenId}</td>
                    <td className="py-2 px-3">{h.tierName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
