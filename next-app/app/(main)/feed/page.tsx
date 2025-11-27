"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function FeedPage() {
  return (
    <div className="w-full  px-6 flex flex-col items-center justify-center text-center">
      <Card className="max-w-5xl w-full shadow-none border border-border bg-card">
        <CardContent className="py-16 px-10 space-y-6">
          <div className="flex justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Subscriber Feed Coming Soon
          </h1>

          <p className="text-muted-foreground text-base leading-relaxed">
            Your personalized feed will show content from creators you’re 
            subscribed to or have NFT membership access to.  
            <br />
            We’re building something powerful, stay tuned.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
