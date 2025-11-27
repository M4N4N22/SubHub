"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCreatorContent } from "@/hooks/content/useCreatorContent";
import Image from "next/image";

const gateLabels: Record<number, string> = {
  0: "Public",
  1: "Subscription Required",
  2: "Any NFT Holder",
  3: "Specific NFT Tier",
  4: "Subscription OR NFT",
};

export default function CreatorContentLibrary() {
  const { posts, loading, reload } = useCreatorContent();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Your Content Library</h2>
        <Button variant="outline" onClick={reload}>
          Refresh
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading content...</p>
      ) : posts.length === 0 ? (
        <p className="text-muted-foreground">No content uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Card key={post.contentId} className="border rounded-xl overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  {post.metadata?.title || `Untitled (${post.contentId})`}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Media Thumbnail */}
                {post.metadata?.media ? (
                  <Image
                    src={post.metadata.media.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/")}
                    className="rounded-md w-full h-40 object-cover"
                    alt=""
                    width={400}
                    height={400}
                  />
                ) : (
                  <div className="h-40 border rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                    No Preview
                  </div>
                )}

                {/* Description */}
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {post.metadata?.description || "No description provided"}
                </p>

                {/* Gating Info */}
                <div className="text-sm">
                  <p>
                    <strong>Gate:</strong> {gateLabels[post.gate]}
                  </p>

                  {post.planId > BigInt(0) && (
                    <p>
                      <strong>Plan ID:</strong> {post.planId.toString()}
                    </p>
                  )}

                  {post.tierId > BigInt(0) && (
                    <p>
                      <strong>Tier ID:</strong> {post.tierId.toString()}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      window.open(
                        `https://gateway.pinata.cloud/ipfs/${post.cid.replace("ipfs://", "")}`,
                        "_blank"
                      )
                    }
                  >
                    View
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(post.cid)}
                  >
                    Copy CID
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
