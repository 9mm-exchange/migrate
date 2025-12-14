"use client";

import { useAccount, useReadContracts } from "wagmi";
import { formatUnits } from "viem";
import { PULSEX_PAIR_ABI, ERC20_ABI } from "@/constants/abis";
import { SUPPORTED_MIGRATIONS, getV3PoolForV2Pair } from "@/constants/pairs";

// Re-export for convenience
export { SUPPORTED_MIGRATIONS } from "@/constants/pairs";

// Keep for backwards compatibility
export const KNOWN_PAIRS = SUPPORTED_MIGRATIONS.map((m) => ({
  address: m.v2Pair,
  name: m.name,
}));

export const SUPPORTED_PAIRS = KNOWN_PAIRS;

export interface LPPosition {
  pairAddress: `0x${string}`;
  name: string;
  balance: bigint;
  formattedBalance: string;
  totalSupply: bigint;
  token0: `0x${string}`;
  token1: `0x${string}`;
  token0Symbol: string;
  token1Symbol: string;
  reserve0: bigint;
  reserve1: bigint;
  userShare0: bigint;
  userShare1: bigint;
  formattedShare0: string;
  formattedShare1: string;
  // V3 mapping info
  v3Pool?: `0x${string}`;
  v3FeeTier?: number;
}

export function useLPPositions() {
  const { address, isConnected } = useAccount();

  // Build contract calls for all supported V2 pairs
  const contracts = SUPPORTED_MIGRATIONS.flatMap((migration) => [
    // Balance of user
    {
      address: migration.v2Pair,
      abi: PULSEX_PAIR_ABI,
      functionName: "balanceOf" as const,
      args: [address!],
    },
    // Total supply
    {
      address: migration.v2Pair,
      abi: PULSEX_PAIR_ABI,
      functionName: "totalSupply" as const,
    },
    // Token0 address
    {
      address: migration.v2Pair,
      abi: PULSEX_PAIR_ABI,
      functionName: "token0" as const,
    },
    // Token1 address
    {
      address: migration.v2Pair,
      abi: PULSEX_PAIR_ABI,
      functionName: "token1" as const,
    },
    // Reserves
    {
      address: migration.v2Pair,
      abi: PULSEX_PAIR_ABI,
      functionName: "getReserves" as const,
    },
  ]);

  const { data, isLoading, error, refetch } = useReadContracts({
    contracts: isConnected && address ? contracts : [],
    query: {
      enabled: isConnected && !!address,
      refetchInterval: 30 * 1000, // Refresh every 30 seconds
    },
  });

  // Build token symbol contract calls based on token addresses
  const tokenAddresses: `0x${string}`[] = [];
  if (data) {
    for (let i = 0; i < SUPPORTED_MIGRATIONS.length; i++) {
      const baseIndex = i * 5;
      const token0 = data[baseIndex + 2]?.result as `0x${string}` | undefined;
      const token1 = data[baseIndex + 3]?.result as `0x${string}` | undefined;
      if (token0 && !tokenAddresses.includes(token0)) tokenAddresses.push(token0);
      if (token1 && !tokenAddresses.includes(token1)) tokenAddresses.push(token1);
    }
  }

  const symbolContracts = tokenAddresses.map((addr) => ({
    address: addr,
    abi: ERC20_ABI,
    functionName: "symbol" as const,
  }));

  const { data: symbolData } = useReadContracts({
    contracts: symbolContracts,
    query: {
      enabled: tokenAddresses.length > 0,
    },
  });

  // Build symbol lookup map
  const symbolMap: Record<string, string> = {};
  if (symbolData) {
    tokenAddresses.forEach((addr, index) => {
      const symbol = symbolData[index]?.result as string | undefined;
      if (symbol) {
        symbolMap[addr.toLowerCase()] = symbol;
      }
    });
  }

  // Process data into positions
  const positions: LPPosition[] = [];

  if (data) {
    for (let i = 0; i < SUPPORTED_MIGRATIONS.length; i++) {
      const migration = SUPPORTED_MIGRATIONS[i];
      const baseIndex = i * 5;

      const balance = data[baseIndex]?.result as bigint | undefined;
      const totalSupply = data[baseIndex + 1]?.result as bigint | undefined;
      const token0 = data[baseIndex + 2]?.result as `0x${string}` | undefined;
      const token1 = data[baseIndex + 3]?.result as `0x${string}` | undefined;
      const reserves = data[baseIndex + 4]?.result as [bigint, bigint, number] | undefined;

      // Skip if no balance or data missing
      if (!balance || balance === BigInt(0) || !totalSupply || !token0 || !token1 || !reserves) {
        continue;
      }

      const [reserve0, reserve1] = reserves;

      // Calculate user's share of reserves
      const userShare0 = (balance * reserve0) / totalSupply;
      const userShare1 = (balance * reserve1) / totalSupply;

      // Get token symbols
      const token0Symbol = symbolMap[token0.toLowerCase()] || token0.slice(0, 6) + "...";
      const token1Symbol = symbolMap[token1.toLowerCase()] || token1.slice(0, 6) + "...";

      // Get V3 mapping
      const v3Mapping = getV3PoolForV2Pair(migration.v2Pair);

      positions.push({
        pairAddress: migration.v2Pair,
        name: migration.name || `${token0Symbol}/${token1Symbol}`,
        balance,
        formattedBalance: parseFloat(formatUnits(balance, 18)).toFixed(6),
        totalSupply,
        token0,
        token1,
        token0Symbol,
        token1Symbol,
        reserve0,
        reserve1,
        userShare0,
        userShare1,
        formattedShare0: parseFloat(formatUnits(userShare0, 18)).toFixed(4),
        formattedShare1: parseFloat(formatUnits(userShare1, 18)).toFixed(4),
        // V3 info
        v3Pool: v3Mapping?.v3Pool,
        v3FeeTier: v3Mapping?.feeTier,
      });
    }
  }

  return {
    positions,
    isLoading,
    error: error as Error | null,
    refetch,
    supportedPairsCount: SUPPORTED_MIGRATIONS.length,
  };
}
