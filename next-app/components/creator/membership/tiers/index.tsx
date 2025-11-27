"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { useCreatorTiers } from "@/hooks/membership/useCreatorTiers";

export default function CreatorTiers() {
  const { tiers, loading } = useCreatorTiers();
  const uniqueTiers = tiers.filter(
    (t, index, self) =>
      index === self.findIndex((x) => x.metadata?.title === t.metadata?.title)
  );

  return (
    <div className="min-h-screen container mx-auto max-w-6xl ">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold">Your Membership Tiers</h1>
        <Link href="/creator/memberships/create">
          <Button>Create New Tier</Button>
        </Link>
      </div>

      {loading && (
        <p className="text-muted-foreground">Loading your membership tiers…</p>
      )}

      {!loading && tiers.length === 0 && (
        <p className="text-muted-foreground">
          You haven&apos;t created any membership tiers yet.
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {uniqueTiers.map((t) => (
          <Card key={t.metadata?.title} className="overflow-hidden border border-muted">
            <div className="relative w-full h-48 bg-muted">
              {t.metadata?.image ? (
                <Image
                  src={t.metadata.image.replace(
                    "ipfs://",
                    "https://gateway.pinata.cloud/ipfs/"
                  )}
                  alt={t.metadata.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  No Image
                </div>
              )}
            </div>

            <CardHeader>
              <CardTitle className="truncate">
                {t.metadata?.title || `Tier #${t.tierId}`}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3 text-sm">
              <p className="text-muted-foreground line-clamp-2">
                {t.metadata?.description || "No description"}
              </p>

              <p>
                <strong>Price:</strong> {t.price.toString()} wei
              </p>
              <p>
                <strong>Max Supply:</strong>{" "}
                {t.maxSupply === BigInt(0)
                  ? "Unlimited"
                  : t.maxSupply.toString()}
              </p>

              <p>
                <strong>Minted:</strong> {t.minted.toString()}
              </p>
              <p>
                <strong>Royalty:</strong> {Number(t.royaltyBps) / 100}%
              </p>

              <p className={t.active ? "text-green-600" : "text-red-600"}>
                {t.active ? "Active" : "Inactive"}
              </p>

              <Link href={`/creator/memberships/tier/${t.tierId}/holders`}>
                <Button className="w-full mt-3">Manage Tier</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
