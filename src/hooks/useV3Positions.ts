"use client";

import { useAccount, useReadContract, useReadContracts } from "wagmi";
import { NINEMM_CONTRACTS } from "@/constants/addresses";
import { POSITION_MANAGER_ABI, ERC20_ABI } from "@/constants/abis";

export interface V3Position {
  tokenId: bigint;
  token0: `0x${string}`;
  token1: `0x${string}`;
  fee: number;
  tickLower: number;
  tickUpper: number;
  liquidity: bigint;
  token0Symbol?: string;
  token1Symbol?: string;
}

export function useV3Positions() {
  const { address } = useAccount();

  // Get number of positions owned
  const { data: balanceData, isLoading: balanceLoading } = useReadContract({
    address: NINEMM_CONTRACTS.POSITION_MANAGER,
    abi: POSITION_MANAGER_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const positionCount = balanceData ? Number(balanceData) : 0;

  // Get token IDs for each position
  const tokenIdContracts = Array.from({ length: Math.min(positionCount, 10) }, (_, i) => ({
    address: NINEMM_CONTRACTS.POSITION_MANAGER,
    abi: POSITION_MANAGER_ABI,
    functionName: "tokenOfOwnerByIndex" as const,
    args: [address as `0x${string}`, BigInt(i)],
  }));

  const { data: tokenIdResults, isLoading: tokenIdsLoading } = useReadContracts({
    contracts: address && positionCount > 0 ? tokenIdContracts : [],
    query: {
      enabled: !!address && positionCount > 0,
    },
  });

  const tokenIds = tokenIdResults
    ?.map((result) => result.result as bigint | undefined)
    .filter((id): id is bigint => id !== undefined) || [];

  // Get position details for each token ID
  const positionContracts = tokenIds.map((tokenId) => ({
    address: NINEMM_CONTRACTS.POSITION_MANAGER,
    abi: POSITION_MANAGER_ABI,
    functionName: "positions" as const,
    args: [tokenId],
  }));

  const { data: positionResults, isLoading: positionsLoading, refetch } = useReadContracts({
    contracts: tokenIds.length > 0 ? positionContracts : [],
    query: {
      enabled: tokenIds.length > 0,
    },
  });

  // Parse positions
  const positions: V3Position[] = [];

  if (positionResults) {
    positionResults.forEach((result, index) => {
      if (result.result) {
        const [
          nonce,
          operator,
          token0,
          token1,
          fee,
          tickLower,
          tickUpper,
          liquidity,
        ] = result.result as [
          bigint,
          `0x${string}`,
          `0x${string}`,
          `0x${string}`,
          number,
          number,
          number,
          bigint,
          bigint,
          bigint,
          bigint,
          bigint
        ];

        // Only include positions with liquidity > 0
        if (liquidity > BigInt(0)) {
          positions.push({
            tokenId: tokenIds[index],
            token0,
            token1,
            fee,
            tickLower,
            tickUpper,
            liquidity,
          });
        }
      }
    });
  }

  const isLoading = balanceLoading || tokenIdsLoading || positionsLoading;

  return {
    positions,
    positionCount,
    isLoading,
    refetch,
  };
}

