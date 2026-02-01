"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Shield, ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="max-w-xl text-center space-y-8">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="w-7 h-7 text-primary" />
          </div>
        </div>

        {/* Copy */}
        <div className="space-y-3">
          <h1 className="text-4xl font-semibold tracking-tight">
            This page is under construction
          </h1>

          <p className="text-muted-foreground text-lg leading-relaxed">
            SubHub is actively evolving, and this route hasn’t been deployed yet.
            Check back soon — new surfaces are landing fast.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button
            variant="outline"
            size="lg"
            onClick={() => router.back()}
            className="rounded-full"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Go back
          </Button>

          <Link href="/">
            <Button size="lg" className="rounded-full">
              <Home className="mr-2 w-4 h-4" />
              Return home
            </Button>
          </Link>
        </div>

        {/* Subtle reassurance */}
        <p className="text-xs text-muted-foreground pt-6">
          Nothing’s broken — this part of the protocol just isn’t live yet.
        </p>
      </div>
    </div>
  );
}
