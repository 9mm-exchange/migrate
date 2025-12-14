"use client";

import { useState } from "react";
import { useReadContracts, useAccount } from "wagmi";
import { isAddress } from "viem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { PULSEX_PAIR_ABI, PULSEX_FACTORY_ABI, ERC20_ABI } from "@/constants/abis";
import { PULSEX_CONTRACTS } from "@/constants/addresses";
import { formatTokenAmount } from "@/lib/utils";
import type { LPPosition } from "@/hooks/useLPPositions";

interface CustomPairInputProps {
  onPositionFound: (position: LPPosition) => void;
}

export function CustomPairInput({ onPositionFound }: CustomPairInputProps) {
  const { address } = useAccount();
  const [tokenA, setTokenA] = useState("");
  const [tokenB, setTokenB] = useState("");
  const [pairAddress, setPairAddress] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [foundPosition, setFoundPosition] = useState<LPPosition | null>(null);

  // Fetch pair from factory
  const { data: pairFromFactory, refetch: refetchPair } = useReadContracts({
    contracts: tokenA && tokenB && isAddress(tokenA) && isAddress(tokenB) ? [
      {
        address: PULSEX_CONTRACTS.FACTORY,
        abi: PULSEX_FACTORY_ABI,
        functionName: "getPair",
        args: [tokenA as `0x${string}`, tokenB as `0x${string}`],
      },
    ] : [],
    query: {
      enabled: false,
    },
  });

  // Fetch pair details
  const { data: pairDetails, refetch: refetchDetails } = useReadContracts({
    contracts: pairAddress && isAddress(pairAddress) && address ? [
      {
        address: pairAddress as `0x${string}`,
        abi: PULSEX_PAIR_ABI,
        functionName: "balanceOf",
        args: [address],
      },
      {
        address: pairAddress as `0x${string}`,
        abi: PULSEX_PAIR_ABI,
        functionName: "totalSupply",
      },
      {
        address: pairAddress as `0x${string}`,
        abi: PULSEX_PAIR_ABI,
        functionName: "token0",
      },
      {
        address: pairAddress as `0x${string}`,
        abi: PULSEX_PAIR_ABI,
        functionName: "token1",
      },
      {
        address: pairAddress as `0x${string}`,
        abi: PULSEX_PAIR_ABI,
        functionName: "getReserves",
      },
    ] : [],
    query: {
      enabled: false,
    },
  });

  const handleSearchByTokens = async () => {
    if (!tokenA || !tokenB) {
      setError("Please enter both token addresses");
      return;
    }
    if (!isAddress(tokenA) || !isAddress(tokenB)) {
      setError("Invalid token address format");
      return;
    }

    setIsSearching(true);
    setError(null);
    setFoundPosition(null);

    try {
      const result = await refetchPair();
      const pair = result.data?.[0]?.result as `0x${string}` | undefined;

      if (!pair || pair === "0x0000000000000000000000000000000000000000") {
        setError("No PulseX pair found for these tokens");
        setIsSearching(false);
        return;
      }

      setPairAddress(pair);
      await searchByPairAddress(pair);
    } catch (err) {
      setError("Failed to search for pair");
      setIsSearching(false);
    }
  };

  const handleSearchByPair = async () => {
    if (!pairAddress) {
      setError("Please enter a pair address");
      return;
    }
    if (!isAddress(pairAddress)) {
      setError("Invalid pair address format");
      return;
    }

    setIsSearching(true);
    setError(null);
    setFoundPosition(null);

    await searchByPairAddress(pairAddress as `0x${string}`);
  };

  const searchByPairAddress = async (pair: `0x${string}`) => {
    try {
      const result = await refetchDetails();
      const data = result.data;

      if (!data || data.some((d) => d.error)) {
        setError("Failed to fetch pair details. Is this a valid PulseX V2 pair?");
        setIsSearching(false);
        return;
      }

      const balance = data[0]?.result as bigint;
      const totalSupply = data[1]?.result as bigint;
      const token0 = data[2]?.result as `0x${string}`;
      const token1 = data[3]?.result as `0x${string}`;
      const reserves = data[4]?.result as [bigint, bigint, number];

      if (!balance || balance === BigInt(0)) {
        setError("You don't have any LP tokens for this pair");
        setIsSearching(false);
        return;
      }

      const [reserve0, reserve1] = reserves;
      const userShare0 = (balance * reserve0) / totalSupply;
      const userShare1 = (balance * reserve1) / totalSupply;

      const position: LPPosition = {
        pairAddress: pair,
        name: "Custom Pair",
        balance,
        formattedBalance: formatTokenAmount(balance, 18, 6),
        totalSupply,
        token0,
        token1,
        token0Symbol: "Token0",
        token1Symbol: "Token1",
        reserve0,
        reserve1,
        userShare0,
        userShare1,
        formattedShare0: formatTokenAmount(userShare0, 18, 4),
        formattedShare1: formatTokenAmount(userShare1, 18, 4),
      };

      setFoundPosition(position);
    } catch (err) {
      setError("Failed to fetch pair details");
    }

    setIsSearching(false);
  };

  const handleUsePosition = () => {
    if (foundPosition) {
      onPositionFound(foundPosition);
      setFoundPosition(null);
      setTokenA("");
      setTokenB("");
      setPairAddress("");
    }
  };

  return (
    <Card className="border-border/50 border-dashed">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Find Custom LP Pair
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search by Token Addresses */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Search by token addresses:</p>
          <div className="flex gap-2">
            <Input
              placeholder="Token A address (0x...)"
              value={tokenA}
              onChange={(e) => setTokenA(e.target.value)}
              className="text-xs font-mono"
            />
            <Input
              placeholder="Token B address (0x...)"
              value={tokenB}
              onChange={(e) => setTokenB(e.target.value)}
              className="text-xs font-mono"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleSearchByTokens}
              disabled={isSearching || !tokenA || !tokenB}
            >
              Find
            </Button>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/50" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">or</span>
          </div>
        </div>

        {/* Search by Pair Address */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Enter LP pair address directly:</p>
          <div className="flex gap-2">
            <Input
              placeholder="LP Pair address (0x...)"
              value={pairAddress}
              onChange={(e) => setPairAddress(e.target.value)}
              className="text-xs font-mono flex-1"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleSearchByPair}
              disabled={isSearching || !pairAddress}
            >
              {isSearching ? "..." : "Search"}
            </Button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        )}

        {/* Found Position */}
        {foundPosition && (
          <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-400">Position Found!</span>
              <Badge variant="secondary">{foundPosition.formattedBalance} LP</Badge>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Token 0: {foundPosition.token0.slice(0, 10)}...{foundPosition.token0.slice(-8)}</p>
              <p>Token 1: {foundPosition.token1.slice(0, 10)}...{foundPosition.token1.slice(-8)}</p>
            </div>
            <Button
              size="sm"
              onClick={handleUsePosition}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Use This Position
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

