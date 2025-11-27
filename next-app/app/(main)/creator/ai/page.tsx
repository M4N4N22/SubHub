"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function AIToolsPage() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-foreground">
            AI Tools
          </h1>
          <p className="text-muted-foreground">
            Smart creator insights powered by AI, coming soon.
          </p>
        </div>

        {/* Coming Soon Card */}
        <Card className="border border-muted/40">
          <CardHeader>
            <CardTitle className="text-lg">Upcoming AI Features</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="space-y-4 text-muted-foreground text-sm">

              {/* AI Recommendations */}
              <div className="p-4 rounded-lg bg-muted/20 border">
                <p className="font-medium text-foreground">AI Recommendations</p>
                <p className="text-muted-foreground mt-1">
                  Personalized suggestions for growing your audience & maximizing revenue.
                </p>
              </div>

              {/* AI Pricing Assistant */}
              <div className="p-4 rounded-lg bg-muted/20 border">
                <p className="font-medium text-foreground">AI Pricing Assistant</p>
                <p className="text-muted-foreground mt-1">
                  Smart pricing insights based on creator trends & purchase behavior.
                </p>
              </div>

              {/* AI Content Generator */}
              <div className="p-4 rounded-lg bg-muted/20 border">
                <p className="font-medium text-foreground">AI Content Generator</p>
                <p className="text-muted-foreground mt-1">
                  Auto-generate engaging posts, descriptions, emails, and more.
                </p>
              </div>

              {/* AI Audience Growth Insights */}
              <div className="p-4 rounded-lg bg-muted/20 border">
                <p className="font-medium text-foreground">AI Audience Growth Insights</p>
                <p className="text-muted-foreground mt-1">
                  Understand what resonates with your followers using machine learning.
                </p>
              </div>

              {/* Coming Soon Banner */}
              <div className="mt-6 p-4 rounded-xl bg-muted text-foreground font-semibold border">
                AI creator tools launching soon — stay tuned.
              </div>

            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
