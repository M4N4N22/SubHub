"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    ShieldCheck,
    ArrowUpRight,
    CheckCircle2,
    Loader2,
} from "lucide-react";

import { useSubscribeUSDC } from "@/hooks/subsribe/useSubscribeUSDC";

type Service = {
    id: string;
    name: string;
    description: string;
    price: string;
    icon?: React.ReactNode;
    status?: string;
    frequency?: string;
    planId: bigint; // important
};

export default function DemoServiceCard({ service }: { service: Service }) {
    const {
        subscribeWithPermit2,
        txState,
        expiry,
        hasAccess,
        error,
    } = useSubscribeUSDC(service.planId);

    const isProcessing =
        txState === "signing" || txState === "subscribing";

    return (
        <Card className="relative flex flex-col justify-between h-full p-6 bg-card overflow-hidden transition-all duration-300 hover:scale-[1.02]">
            <div className="space-y-4">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div className="p-2.5 rounded-xl bg-secondary border border-border">
                        {service.icon || (
                            <ShieldCheck className="w-5 h-5 text-primary" />
                        )}
                    </div>

                    {service.status && (
                        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-md bg-secondary text-muted-foreground border border-border">
                            {service.status}
                        </span>
                    )}
                </div>

                {/* Title */}
                <div>
                    <h3 className="text-xl font-bold tracking-tight">
                        {service.name}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mt-2 line-clamp-3">
                        {service.description}
                    </p>
                </div>

                {/* Pricing */}
                <div className="pt-2">
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold tracking-tighter">
                            {service.price.split(" ")[0]}
                        </span>
                        <span className="text-xs font-semibold text-muted-foreground tracking-widest">
                            USDC / {service.frequency}
                        </span>
                    </div>
                </div>

                {/* Deterministic Badge */}
                <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                    <span>Deterministic On-chain Verification</span>
                </div>

                {/* ===== LIVE PROTOCOL STATE ===== */}
                {(isProcessing || txState === "confirmed") && (
                    <div className="mt-3 border rounded-lg p-3 bg-secondary text-xs space-y-2">
                        {txState === "signing" && (
                            <div className="flex items-center gap-2 text-primary">
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                Approving USDC...
                            </div>
                        )}

                        {txState === "subscribing" && (
                            <div className="flex items-center gap-2 text-primary">
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                Writing to PaymentManager...
                            </div>
                        )}

                        {txState === "confirmed" && (
                            <>
                                <div className="flex items-center gap-2 text-primary">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    Subscription Confirmed
                                </div>

                                <div className="font-mono">
                                    expiry: {expiry}
                                </div>

                                <div>
                                    hasActiveAccess =
                                    <span className="ml-1 font-semibold">
                                        {hasAccess ? "true" : "false"}
                                    </span>
                                </div>

                                <div className="text-muted-foreground">
                                    Rule: expiry ≥ block.timestamp
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Unlock Panel */}
                {txState === "confirmed" && hasAccess && (
                    <div className="mt-2 border rounded-lg p-3 bg-primary text-primary-foreground text-xs">
                        Service Access Granted
                        <div className="mt-1 opacity-80">
                            API Activated • Dashboard Unlocked • Data Feed Live
                        </div>
                    </div>
                )}

                {error && (
                    <div className="text-xs text-destructive">
                        {error}
                    </div>
                )}
            </div>

            {/* ACTION BUTTON */}
            {txState !== "confirmed" && (
                <div className="mt-6">
                    <Button
                        onClick={subscribeWithPermit2}
                        disabled={isProcessing}
                        className="w-full"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                Subscribe with USDC
                                <ArrowUpRight className="ml-2 w-4 h-4" />
                            </>
                        )}
                    </Button>
                </div>
            )}
        </Card>
    );
}