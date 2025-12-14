import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { defineChain } from "viem";

// Define PulseChain
export const pulsechain = defineChain({
  id: 369,
  name: "PulseChain",
  nativeCurrency: {
    name: "Pulse",
    symbol: "PLS",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.pulsechain.com"],
    },
  },
  blockExplorers: {
    default: {
      name: "PulseScan",
      url: "https://scan.pulsechain.com",
    },
  },
});

export const config = getDefaultConfig({
  appName: "PulseX to 9mm Migrator",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo",
  chains: [pulsechain],
  ssr: true,
});

