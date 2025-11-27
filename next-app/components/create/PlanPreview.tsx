"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface PlanPreviewProps {
  name: string;
  description: string;
  price: string;
  frequency: string;
}

const frequencyLabels: Record<string, string> = {
  daily: "Daily (24 hours)",
  weekly: "Weekly (7 days)",
  monthly: "Monthly (30 days)",
};

export function PlanPreview({ name, description, price, frequency }: PlanPreviewProps) {
  if (!name && !description && !price && !frequency) return null;

  return (
    <Card className="border border-border mt-6 bg-muted/30">
      <CardHeader>
        <CardTitle className="text-lg">Plan Preview</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3 text-sm">
        <div>
          <span className="text-muted-foreground">Name: </span>
          <span className="font-medium">{name || "-"}</span>
        </div>

        <div>
          <span className="text-muted-foreground">Price: </span>
          <span className="font-medium">{price ? `${price} MATIC` : "-"}</span>
        </div>

        <div>
          <span className="text-muted-foreground">Billing: </span>
          <span className="font-medium">
            {frequency ? frequencyLabels[frequency] : "-"}
          </span>
        </div>

        <div>
          <span className="text-muted-foreground">Description: </span>
          <p className="mt-1">{description || "-"}</p>
        </div>
      </CardContent>
    </Card>
  );
}
