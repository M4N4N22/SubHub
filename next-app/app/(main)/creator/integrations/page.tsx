"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function IntegrationsPage() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto">

        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-foreground">
            Integrations
          </h1>
          <p className="text-muted-foreground">
            Connect external accounts & tools, coming soon.
          </p>
        </div>

        <Card className="border border-muted/40">
          <CardHeader>
            <CardTitle className="text-lg">Upcoming Integrations</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="space-y-4 text-muted-foreground text-sm">

              <div className="p-4 rounded-lg bg-muted/20 border">
                <p className="font-medium text-foreground">Social Accounts</p>
                <p className="text-muted-foreground mt-1">
                  Instagram, X/Twitter, LinkedIn — connect your profiles.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-muted/20 border">
                <p className="font-medium text-foreground">Discord</p>
                <p className="text-muted-foreground mt-1">
                  Link your server or community for gated access.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-muted/20 border">
                <p className="font-medium text-foreground">Telegram</p>
                <p className="text-muted-foreground mt-1">
                  Connect channels or groups for creator perks.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-muted/20 border">
                <p className="font-medium text-foreground">Lens Protocol</p>
                <p className="text-muted-foreground mt-1">
                  Verify your Lens profile & sync your Web3 identity.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-muted/20 border">
                <p className="font-medium text-foreground">More Integrations</p>
                <p className="text-muted-foreground mt-1">
                  We’re working on even more creator tools.
                </p>
              </div>

              <div className="mt-6 p-4 rounded-xl bg-muted text-foreground font-semibold border">
                Coming soon — this feature will be available in a future update.
              </div>

            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
