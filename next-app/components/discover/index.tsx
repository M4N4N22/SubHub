"use client";

import { Activity, Code, Database, LineChart, ShieldCheck, Zap } from "lucide-react";
import DemoServiceCard from "./components/DemoServiceCard";

export default function AccessIndex() {
  const demoServices = [

    {
      id: "quant-dashboard",
      planId: BigInt(1),
      name: "Quant Analytics",
      icon: <LineChart className="w-5 h-5 text-primary-foreground" />,
      description:
        "Premium analytics dashboard gated by onchain subscription state.",
      price: "20",
      frequency: "month",
      status: "On chain",
    },

    {
      id: "data-feed",
      planId: BigInt(2),
      name: "Onchain Data Feed",
      icon: <Database className="w-5 h-5 text-primary-foreground" />,
      description:
        "Real-time blockchain data stream unlocked by stablecoin subscription.",
      price: "25",
      frequency: "month",
      status: "On chain",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header Section with Protocol context */}
      <div className="mb-12 border-b border-border pb-8">
        <div className="flex items-center gap-2 mb-4">
          <span className="bg-primary/10 text-primary dark:bg-purple-900/30 dark:text-purple-300 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Polygon PoS Testnet
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <ShieldCheck className="w-3 h-3" /> Non-Custodial
          </span>
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/70">
          USDC Access Registry
        </h1>

        <p className="text-lg text-muted-foreground max-w-3xl leading-relaxed">
          Explore demo services powered by <span className="text-foreground font-medium">SubHub Protocol</span>.
          Each subscription updates your on-chain expiry state, allowing for trustless, deterministic access control.
        </p>
      </div>

      {/* Grid Layout */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {demoServices.map((service) => (
          <DemoServiceCard key={service.id} service={service} />
        ))}
      </div>

      {/* Protocol Stats Footer (Optional) */}
      <div className="mt-16 p-6 rounded-2xl bg-secondary border border-border flex flex-wrap justify-around gap-8 text-center">
        <div>
          <p className="text-2xl text-primary-foreground font-bold">100%</p>
          <p className="text-xs text-primary-foreground uppercase">On-Chain Logic</p>
        </div>
        <div>
          <p className="text-2xl text-primary-foreground font-bold">~0.01$</p>
          <p className="text-xs text-primary-foreground uppercase">Avg. Tx Fee</p>
        </div>
        <div>
          <p className="text-2xl text-primary-foreground font-bold">USDC</p>
          <p className="text-xs text-primary-foreground uppercase">Settlement Asset</p>
        </div>
      </div>
    </div>
  );
}