"use client";

import { useReadContracts } from "wagmi";
import { V3_MIGRATOR_ABI } from "@/constants/abis";
import { NINEMM_CONTRACTS } from "@/constants/addresses";

/**
 * Hook to verify and read migrator contract info
 * Note: Our PulseXV3Migrator contract has WETH9 and nonfungiblePositionManager
 */
export function useMigratorInfo() {
  const { data, isLoading, error } = useReadContracts({
    contracts: [
      {
        address: NINEMM_CONTRACTS.V3_MIGRATOR,
        abi: V3_MIGRATOR_ABI,
        functionName: "WETH9",
      },
      {
        address: NINEMM_CONTRACTS.V3_MIGRATOR,
        abi: V3_MIGRATOR_ABI,
        functionName: "nonfungiblePositionManager",
      },
    ],
  });

  const weth9 = data?.[0]?.result as `0x${string}` | undefined;
  const positionManager = data?.[1]?.result as `0x${string}` | undefined;

  const isValid =
    !!weth9 && !!positionManager && !data?.some((d) => d.error);

  return {
    weth9,
    positionManager,
    isLoading,
    error,
    isValid,
  };
}

