"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useV3Positions, type V3Position } from "@/hooks/useV3Positions";
import { EXPLORER, NINEMM_CONTRACTS } from "@/constants/addresses";
import { shortenAddress } from "@/lib/utils";

const FEE_TIER_LABELS: Record<number, string> = {
  100: "0.01%",
  500: "0.05%",
  3000: "0.3%",
  10000: "1%",
};

function V3PositionCard({ position }: { position: V3Position }) {
  const isFullRange = position.tickLower === -887220 && position.tickUpper === 887220;

  return (
    <div className="p-3 rounded-lg bg-muted/30 border border-border/50 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-1">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 border border-background flex items-center justify-center text-[10px] font-bold">
              T0
            </div>
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 border border-background flex items-center justify-center text-[10px] font-bold">
              T1
            </div>
          </div>
          <span className="text-sm font-medium">#{position.tokenId.toString()}</span>
        </div>
        <div className="flex gap-1">
          <Badge variant="outline" className="text-xs">
            {FEE_TIER_LABELS[position.fee] || `${position.fee / 10000}%`}
          </Badge>
          {isFullRange && (
            <Badge variant="secondary" className="text-xs">
              Full Range
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-muted-foreground">Token 0: </span>
          <a
            href={EXPLORER.token(position.token0)}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono hover:text-primary"
          >
            {shortenAddress(position.token0, 4)}
          </a>
        </div>
        <div>
          <span className="text-muted-foreground">Token 1: </span>
          <a
            href={EXPLORER.token(position.token1)}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono hover:text-primary"
          >
            {shortenAddress(position.token1, 4)}
          </a>
        </div>
      </div>

      <div className="flex justify-between items-center pt-1">
        <span className="text-xs text-muted-foreground">
          Liquidity: {position.liquidity > BigInt(0) ? "Active" : "Empty"}
        </span>
        <a
          href={`https://dex.9mm.pro/liquidity/${position.tokenId}?chain=pulsechain`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:underline"
        >
          View on 9mm →
        </a>
      </div>
    </div>
  );
}

export function V3PositionsList() {
  const { positions, positionCount, isLoading, refetch } = useV3Positions();

  return (
    <Card className="border-border/50">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          Your 9mm V3 Positions
          {positionCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {positionCount}
            </Badge>
          )}
        </CardTitle>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-8 text-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Loading V3 positions...</p>
          </div>
        ) : positions.length === 0 ? (
          <div className="py-8 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-muted/50 flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="text-sm font-medium mb-1">No V3 Positions</p>
            <p className="text-xs text-muted-foreground">
              {positionCount === 0
                ? "You don't have any 9mm V3 positions yet. Migrate your V2 LP to create one!"
                : "No active liquidity positions found."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {positions.map((position) => (
              <V3PositionCard key={position.tokenId.toString()} position={position} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

