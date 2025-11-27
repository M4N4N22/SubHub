"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { WithdrawButton } from "@/components/monetization/WithdrawButton";

import { useAccount } from "wagmi";
import { useCreatorEarnings } from "@/hooks/monetization/useCreatorEarnings";
import { useWithdrawMATIC } from "@/hooks/monetization/useWithdrawMATIC";
import { useWithdrawUSDC } from "@/hooks/monetization/useWithdrawUSDC";

export default function Monetization() {
  const { address, isConnected } = useAccount();

  const { matic, usdc, loading: earningsLoading } = useCreatorEarnings(address);

  const {
    withdraw: withdrawMATIC,
    loading: withdrawMATICLoading,
    error: withdrawMATICError,
  } = useWithdrawMATIC();

  const {
    withdraw: withdrawUSDC,
    loading: withdrawUSDCLoading,
    error: withdrawUSDCError,
  } = useWithdrawUSDC();

  return (
    <div className="min-h-screen">
      <div className="container mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-foreground mb-1">
            Monetization
          </h1>
          <p className="text-muted-foreground">
            Manage your creator earnings and withdrawals.
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">
              Earnings Overview
            </CardTitle>
          </CardHeader>

          <CardContent>
            {earningsLoading ? (
              <div className="text-muted-foreground">Loading earnings...</div>
            ) : (
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    MATIC Balance
                  </div>
                  <div className="text-3xl font-bold">{matic} MATIC</div>

                  <WithdrawButton
                    currency="MATIC"
                    balance={Number(matic)}
                    withdraw={withdrawMATIC}
                    loading={withdrawMATICLoading}
                    error={withdrawMATICError}
                  />
                </div>

                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    USDC Balance
                  </div>
                  <div className="text-3xl font-bold">{usdc} USDC</div>

                  <WithdrawButton
                    currency="USDC"
                    balance={Number(usdc)}
                    withdraw={withdrawUSDC}
                    loading={withdrawUSDCLoading}
                    error={withdrawUSDCError}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Payout Wallet</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="p-3 border rounded-lg bg-muted/20 text-sm break-all">
              {isConnected ? address : "Wallet not connected"}
            </div>

            <p className="text-muted-foreground text-sm mt-3">
              Withdrawals will be sent directly to your connected Polygon
              wallet.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
