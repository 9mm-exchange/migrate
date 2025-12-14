"use client";

import { useQuery } from "@tanstack/react-query";
import { useAccount, usePublicClient } from "wagmi";
import { formatUnits } from "viem";
import { PULSEX_FACTORIES, TOKENS } from "@/constants/addresses";
import { PULSEX_PAIR_ABI, ERC20_ABI } from "@/constants/abis";
import type { LPPosition } from "./useLPPositions";

// PulseScan API endpoint
const PULSESCAN_API = "https://api.scan.pulsechain.com/api";

// Known token symbols for display
const TOKEN_SYMBOLS: Record<string, string> = {
  [TOKENS.WPLS.toLowerCase()]: "WPLS",
  [TOKENS.HEX.toLowerCase()]: "HEX",
  [TOKENS.DAI.toLowerCase()]: "DAI",
  [TOKENS.USDC.toLowerCase()]: "USDC",
  [TOKENS.USDT.toLowerCase()]: "USDT",
  "0x95b303987a60c71504d99aa1b13b4da07b0790ab": "PLSX",
  "0x2fa878ab3f87cc1c9737fc071108f904c0b0c95d": "INC",
  "0x5ee84583f67d5ecea5420dbb42b462896e7f8d06": "9MM",
};

interface TokenBalance {
  contractAddress: string;
  balance: string;
  decimals: string;
  name: string;
  symbol: string;
}

// Fetch all token balances from PulseScan
async function fetchTokenBalances(address: string): Promise<TokenBalance[]> {
  try {
    const response = await fetch(
      `${PULSESCAN_API}?module=account&action=tokenlist&address=${address}`
    );
    const data = await response.json();
    
    if (data.status === "1" && Array.isArray(data.result)) {
      return data.result;
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch token balances from PulseScan:", error);
    return [];
  }
}

// Check if a token is a PulseX LP token by checking its factory
async function checkIfPulseXLP(
  publicClient: any,
  tokenAddress: `0x${string}`
): Promise<{
  isLP: boolean;
  token0?: `0x${string}`;
  token1?: `0x${string}`;
  factory?: string;
}> {
  try {
    // Try to call factory() on the token - only LP tokens have this
    const factory = await publicClient.readContract({
      address: tokenAddress,
      abi: PULSEX_PAIR_ABI,
      functionName: "factory",
    });

    const factoryLower = (factory as string).toLowerCase();
    const isPulseXLP = PULSEX_FACTORIES.some(
      (f) => f.toLowerCase() === factoryLower
    );

    if (isPulseXLP) {
      // Get token0 and token1
      const [token0, token1] = await Promise.all([
        publicClient.readContract({
          address: tokenAddress,
          abi: PULSEX_PAIR_ABI,
          functionName: "token0",
        }),
        publicClient.readContract({
          address: tokenAddress,
          abi: PULSEX_PAIR_ABI,
          functionName: "token1",
        }),
      ]);

      return {
        isLP: true,
        token0: token0 as `0x${string}`,
        token1: token1 as `0x${string}`,
        factory: factory as string,
      };
    }

    return { isLP: false };
  } catch {
    // Not an LP token or call failed
    return { isLP: false };
  }
}

// Get token symbol with fallback
async function getTokenSymbol(
  publicClient: any,
  tokenAddress: `0x${string}`
): Promise<string> {
  const knownSymbol = TOKEN_SYMBOLS[tokenAddress.toLowerCase()];
  if (knownSymbol) return knownSymbol;

  try {
    const symbol = await publicClient.readContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: "symbol",
    });
    return symbol as string;
  } catch {
    return tokenAddress.slice(0, 6) + "...";
  }
}

export function useAutoDiscoverLP() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();

  const {
    data: positions = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["autoDiscoverLP", address],
    queryFn: async (): Promise<LPPosition[]> => {
      if (!address || !publicClient) return [];

      // Step 1: Get all token balances from PulseScan
      const allTokens = await fetchTokenBalances(address);

      if (allTokens.length === 0) {
        console.log("No tokens found from PulseScan, trying direct check...");
        // Fallback: If PulseScan fails, return empty (could add known pairs here)
        return [];
      }

      // Step 2: Filter for tokens with non-zero balance
      const tokensWithBalance = allTokens.filter(
        (t) => BigInt(t.balance) > BigInt(0)
      );

      console.log(`Found ${tokensWithBalance.length} tokens with balance`);

      // Step 3: Check each token to see if it's a PulseX LP
      const lpPositions: LPPosition[] = [];

      // Process in batches to avoid rate limiting
      const batchSize = 5;
      for (let i = 0; i < tokensWithBalance.length; i += batchSize) {
        const batch = tokensWithBalance.slice(i, i + batchSize);

        const results = await Promise.all(
          batch.map(async (token) => {
            const lpCheck = await checkIfPulseXLP(
              publicClient,
              token.contractAddress as `0x${string}`
            );

            if (!lpCheck.isLP || !lpCheck.token0 || !lpCheck.token1) {
              return null;
            }

            try {
              // Get additional LP details
              const [totalSupply, reserves, token0Symbol, token1Symbol] =
                await Promise.all([
                  publicClient.readContract({
                    address: token.contractAddress as `0x${string}`,
                    abi: PULSEX_PAIR_ABI,
                    functionName: "totalSupply",
                  }),
                  publicClient.readContract({
                    address: token.contractAddress as `0x${string}`,
                    abi: PULSEX_PAIR_ABI,
                    functionName: "getReserves",
                  }),
                  getTokenSymbol(publicClient, lpCheck.token0),
                  getTokenSymbol(publicClient, lpCheck.token1),
                ]);

              const balance = BigInt(token.balance);
              const supply = totalSupply as bigint;
              const [reserve0, reserve1] = reserves as [bigint, bigint, number];

              // Calculate user's share of reserves
              const userShare0 = (balance * reserve0) / supply;
              const userShare1 = (balance * reserve1) / supply;

              const position: LPPosition = {
                pairAddress: token.contractAddress as `0x${string}`,
                name: `${token0Symbol}/${token1Symbol}`,
                balance,
                formattedBalance: parseFloat(
                  formatUnits(balance, 18)
                ).toFixed(6),
                totalSupply: supply,
                token0: lpCheck.token0,
                token1: lpCheck.token1,
                token0Symbol,
                token1Symbol,
                reserve0,
                reserve1,
                userShare0,
                userShare1,
                formattedShare0: parseFloat(
                  formatUnits(userShare0, 18)
                ).toFixed(4),
                formattedShare1: parseFloat(
                  formatUnits(userShare1, 18)
                ).toFixed(4),
              };

              return position;
            } catch (error) {
              console.error(
                `Failed to get details for LP ${token.contractAddress}:`,
                error
              );
              return null;
            }
          })
        );

        // Add valid positions
        results.forEach((pos) => {
          if (pos) lpPositions.push(pos);
        });

        // Small delay between batches
        if (i + batchSize < tokensWithBalance.length) {
          await new Promise((r) => setTimeout(r, 200));
        }
      }

      console.log(`Found ${lpPositions.length} PulseX LP positions`);
      return lpPositions;
    },
    enabled: isConnected && !!address && !!publicClient,
    staleTime: 30 * 1000, // Cache for 30 seconds
    refetchInterval: 60 * 1000, // Refresh every minute
  });

  return {
    positions,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}

