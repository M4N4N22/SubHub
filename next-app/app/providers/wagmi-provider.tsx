"use client";

import { ReactNode, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { WagmiProvider, http } from "wagmi";
import {
  getDefaultConfig,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";

import "@rainbow-me/rainbowkit/styles.css";
import { polygonAmoy } from "@/config/chains/polygonAmoy";

const projectId = "19c884ec177a99263d91cb9a62ba3fa5";

// ❗ DO NOT wrap this inside createConfig()
// RainbowKit already returns a complete Wagmi config
const config = getDefaultConfig({
  appName: "SubHub",
  projectId,
  chains: [polygonAmoy],
  transports: {
    [polygonAmoy.id]: http(
      polygonAmoy.rpcUrls.default.http[0]
    ),
  },
  ssr: true,
});

export function WagmiProviders({ children }: { children: ReactNode }) {
  const [client] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={client}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
