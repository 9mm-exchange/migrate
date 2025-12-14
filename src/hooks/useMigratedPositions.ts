"use client";

import { useState, useEffect, useCallback } from "react";
import { useReadContracts } from "wagmi";
import { NINEMM_CONTRACTS } from "@/constants/addresses";
import { POSITION_MANAGER_ABI } from "@/constants/abis";

const STORAGE_KEY = "migrated_positions";

export interface MigratedPosition {
  tokenId: string;
  token0: `0x${string}`;
  token1: `0x${string}`;
  fee: number;
  tickLower: number;
  tickUpper: number;
  liquidity: string;
  migratedAt: number; // timestamp
  txHash: string;
  pairName?: string;
}

// Safe BigInt conversion
function safeBigInt(value: string | number | undefined | null): bigint {
  if (value === undefined || value === null || value === "" || value === "unknown") {
    return BigInt(0);
  }
  try {
    return BigInt(value);
  } catch {
    return BigInt(0);
  }
}

// Get migrated positions from localStorage
function getStoredPositions(): MigratedPosition[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Save positions to localStorage
function savePositions(positions: MigratedPosition[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
  } catch (error) {
    console.error("Failed to save positions:", error);
  }
}

export function useMigratedPositions() {
  const [storedPositions, setStoredPositions] = useState<MigratedPosition[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load positions from localStorage on mount
  useEffect(() => {
    setStoredPositions(getStoredPositions());
    setIsLoaded(true);
  }, []);

  // Filter out positions with invalid tokenIds before making contract calls
  const validPositions = storedPositions.filter(
    (p) => p.tokenId && p.tokenId !== "unknown" && /^\d+$/.test(p.tokenId)
  );

  // Fetch on-chain data for stored positions to verify they still exist
  const tokenIds = validPositions.map((p) => safeBigInt(p.tokenId));

  const positionContracts = tokenIds
    .filter((id) => id > BigInt(0))
    .map((tokenId) => ({
      address: NINEMM_CONTRACTS.POSITION_MANAGER,
      abi: POSITION_MANAGER_ABI,
      functionName: "positions" as const,
      args: [tokenId],
    }));

  const { data: positionResults, isLoading, refetch } = useReadContracts({
    contracts: positionContracts.length > 0 ? positionContracts : [],
    query: {
      enabled: positionContracts.length > 0 && isLoaded,
    },
  });

  // Combine stored data with on-chain data
  const positions: MigratedPosition[] = storedPositions
    .map((stored, index) => {
      // Skip invalid positions
      if (!stored.tokenId || stored.tokenId === "unknown") {
        return stored;
      }

      // Find matching on-chain data
      const validIndex = validPositions.findIndex((vp) => vp.tokenId === stored.tokenId);
      const onChainData = validIndex >= 0 ? positionResults?.[validIndex]?.result as any : null;

      if (onChainData) {
        return {
          ...stored,
          liquidity: onChainData[7]?.toString() || stored.liquidity,
        };
      }

      return stored;
    })
    .filter((p) => {
      // Keep positions with valid liquidity or unknown tokenId (show them anyway)
      if (p.tokenId === "unknown") return true;
      const liq = safeBigInt(p.liquidity);
      return liq > BigInt(0);
    });

  // Add a new migrated position
  const addMigratedPosition = useCallback((position: Omit<MigratedPosition, "migratedAt">) => {
    const newPosition: MigratedPosition = {
      ...position,
      migratedAt: Date.now(),
    };

    const updated = [...getStoredPositions(), newPosition];
    savePositions(updated);
    setStoredPositions(updated);
  }, []);

  // Remove a position
  const removePosition = useCallback((tokenId: string) => {
    const updated = getStoredPositions().filter((p) => p.tokenId !== tokenId);
    savePositions(updated);
    setStoredPositions(updated);
  }, []);

  // Clear all positions
  const clearAllPositions = useCallback(() => {
    savePositions([]);
    setStoredPositions([]);
  }, []);

  return {
    positions,
    isLoading: !isLoaded || isLoading,
    addMigratedPosition,
    removePosition,
    clearAllPositions,
    refetch,
  };
}
