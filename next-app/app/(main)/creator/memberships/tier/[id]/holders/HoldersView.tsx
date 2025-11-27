"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Holder = {
  wallet: string;
  tokenId: number;
  tierId: number;
  mintedAt?: string;
  metadata?: any;
};

type HoldersViewProps = {
  loading: boolean;
  holders: Holder[];
};

export function HoldersView({ loading, holders }: HoldersViewProps) {
  return (
    <div className="min-h-screen container mx-auto max-w-6xl">
      <h1 className="text-3xl font-bold">Membership NFT Holders</h1>
      <p className="text-muted-foreground mb-8">
        View all users who currently hold an NFT from this tier.
      </p>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : holders.length === 0 ? (
        <p className="text-muted-foreground">
          No NFT holders found for this tier.
        </p>
      ) : (
        <div className="space-y-6">
          {holders.map((h) => (
            <Card key={h.tokenId} className="p-4">
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>Token #{h.tokenId}</span>
                  <Button
                    variant="secondary"
                    onClick={() => navigator.clipboard.writeText(h.wallet)}
                  >
                    Copy Wallet
                  </Button>
                </CardTitle>
              </CardHeader>

              <CardContent>
                <p>
                  <strong>Owner:</strong> {h.wallet}
                </p>
                <p>
                  <strong>Tier:</strong> {h.tierId}
                </p>
                {h.mintedAt && (
                  <p>
                    <strong>Minted:</strong> {h.mintedAt}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
